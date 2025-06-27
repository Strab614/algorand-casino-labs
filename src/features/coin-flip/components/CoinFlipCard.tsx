import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import React, { useCallback, useEffect, useState } from "react";
import AsaIcon from "../../../components/AsaIcon";
import { Circle } from "@mui/icons-material";
import { pulse } from "../styles";
import {
  BOX_STORAGE_COST,
  CoinFlipGame,
  CoinFlipGlobalState,
  CoinFlipLogsFormatted,
} from "../types";
import { getCoinFlipGameByAddress, parseRawLogs } from "../utils";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectNetworkClients, showNotification } from "../../appSlice";
import { CoinFlipClient } from "../clients/CoinFlipClient";
import { useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import * as algokit from "@algorandfoundation/algokit-utils";
import { CoinFlipStats } from "./CoinFlipStats";
import Loading from "../../../components/Loading";
import { WalletNotConnected } from "../../../components/WalletNotConnected";

import { CoinFlipInProgress } from "./CoinFlipInProgress";
import { RecentGames } from "./RecentGames";
import { formattedAssetAmount } from "../../../utils/utils";
import { CoinFlip } from "./CoinFlip";

//tmp
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export interface Props {
  appId: number;
  currentRound: number;
  showStats: boolean;
}

export const CoinFlipCard = ({ appId, currentRound, showStats }: Props) => {
  const dispatch = useAppDispatch();
  const { algod, indexer } = useAppSelector(selectNetworkClients);
  const { activeAddress, transactionSigner } = useWallet();

  const [prediction, setPrediction] = useState<"heads" | "tails">("heads");
  const [wager, setWager] = useState("0.0");

  const [isLoading, setIsLoading] = useState(true);
  const [coinFlipClient, setCoinFlipClient] = useState<CoinFlipClient>();

  const [cfg, setCfg] = useState<CoinFlipGame | undefined>(undefined);

  const [logs, setLogs] = useState<CoinFlipLogsFormatted>();

  const [globalState, setGlobalState] = useState<CoinFlipGlobalState>();

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment === "heads" || newAlignment === "tails") {
      setPrediction(newAlignment as "heads" | "tails");
    }
  };

  const getLogs = useCallback(async () => {
    if (!currentRound) {
      return;
    }

    setIsLoading(true);

    let nextToken = "";
    let logData: [] = [];

    while (nextToken !== undefined) {
      try {
        const r = await indexer
          .lookupApplicationLogs(Number(appId))
          .nextToken(nextToken)
          .minRound(currentRound - 30857 * 5 /* 5 days */)
          .limit(50) // we only need to display the last 10 recent games...
          .do();

        nextToken = r["next-token"];

        const ld: [] = r["log-data"];

        if (ld) {
          logData.push(...ld);
        }
      } catch (error: any) {
        dispatch(showNotification({ type: "error", message: error.message }));
      }
    }

    const r = parseRawLogs(logData);
    setLogs(r);
    setIsLoading(false);
  }, [currentRound, indexer, appId, dispatch]);

  const getCoinFlipInfo = async (client: CoinFlipClient) => {
    // cannot call without initialsied clients
    if (!client || !activeAddress) {
      return;
    }

    try {
      const c = await getCoinFlipGameByAddress(appId, activeAddress, indexer);

      setCfg(c);
    } catch (error) {
      // check if there was an error, or just doesn't exist
      dispatch(
        showNotification({
          type: "error" + String(error),
          message: "Failed to fetch game!",
        })
      );
    }

    try {
      const gs = await client.getGlobalState();

      setGlobalState({
        manager: algosdk.encodeAddress(gs.manager?.asByteArray()!!),
        name: gs.name?.asString()!!,
        assetId: gs.assetId?.asBigInt()!!,
        beaconAppId: gs.beaconAppId?.asBigInt()!!,
        feePercent: gs.feePercent?.asNumber()!!,
        minBet: gs.minBet?.asBigInt()!!,
        maxBet: gs.maxBet?.asBigInt()!!,
        prizePool: gs.prizePool?.asBigInt()!!,
        fees: gs.fees?.asBigInt()!!,
        totalGames: gs.totalGames?.asBigInt()!!,
        totalCancelled: gs.totalCancelled?.asBigInt()!!,
        totalHeads: gs.totalHeads?.asBigInt()!!,
        totalWagered: gs.totalWagered?.asBigInt()!!,
        totalWon: gs.totalWon?.asBigInt()!!,
      } as CoinFlipGlobalState);

      // convert from raw ASA to one with decimals
      const convertedWager = formattedAssetAmount(
        gs?.assetId?.asNumber()!!,
        gs.minBet?.asNumber()!!
      );

      // set bet field to minimum
      setWager(convertedWager);
    } catch (error) {
      dispatch(
        showNotification({
          type: "error",
          message: "something went wrong" + error,
        })
      );
    }
  };

  const onCreateClick = async () => {
    if (!coinFlipClient || !activeAddress || globalState === undefined) {
      alert("client not connected");
      return;
    }

    setIsLoading(true);

    try {
      const { appAddress } = await coinFlipClient.appClient.getAppReference();

      const boxFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: appAddress,
        amount: algokit.algos(BOX_STORAGE_COST).microAlgos,
        suggestedParams: await algokit.getTransactionParams(undefined, algod),
      });

      const axfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: appAddress,
        amount: Number(wager) * 10, // TODO: fix, this will only work with assets with 1 decimal place correctly
        assetIndex: Number(globalState.assetId),
        suggestedParams: await algokit.getTransactionParams(undefined, algod),
      });

      await coinFlipClient.createGame(
        { boxFeeTxn, axfer, heads: prediction === "heads" ? 1 : 0 },
        {
          sendParams: { fee: algokit.algos(0.003) },
          boxes: [
            {
              appIndex: 0,
              name: algosdk.decodeAddress(activeAddress).publicKey,
            },
          ],
        }
      );

      await getCoinFlipInfo(coinFlipClient);
    } catch (error) {
      // check if there was an error, or just doesn't exist
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to create game",
        })
      );
    }

    setIsLoading(false);
  };

  const onCancelClick = async () => {
    if (!coinFlipClient || !activeAddress || globalState === undefined) {
      alert("client not connected");
      return;
    }

    setIsLoading(true);

    try {
      await coinFlipClient.cancelGame(
        { address: activeAddress },
        {
          sendParams: { fee: algokit.algos(0.003) },
          boxes: [
            {
              appIndex: 0,
              name: algosdk.decodeAddress(activeAddress).publicKey,
            },
          ],
          assets: [Number(globalState.assetId)],
        }
      );

      await getCoinFlipInfo(coinFlipClient);
    } catch (error) {
      // check if there was an error, or just doesn't exist
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to cancel game!",
        })
      );
    }

    setIsLoading(false);
  };

  // const onCompleteClick = async () => {
  //   if (!coinFlipClient || !activeAddress) {
  //     alert("client not connected");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     alert("not yet implemented");

  //     await getCoinFlipInfo(coinFlipClient);
  //   } catch (error) {
  //     // check if there was an error, or just doesn't exist
  //     dispatch(
  //       showNotification({
  //         type: "error",
  //         message: "Failed to complete game!",
  //       })
  //     );
  //   }

  //   setIsLoading(false);
  // };

  useEffect(() => {
    const doit = async () => {
      if (!activeAddress) {
        return;
      }

      setIsLoading(true);

      const userClient = new CoinFlipClient(
        {
          sender: {
            addr: activeAddress,
            signer: transactionSigner,
          },
          resolveBy: "id",
          id: appId,
        },
        algod
      );

      setCoinFlipClient(userClient);

      await getCoinFlipInfo(userClient);

      if (logs === undefined) {
        getLogs();
      }

      setIsLoading(false);
    };

    if (!coinFlipClient) {
      doit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeAddress,
    algod,
    appId,
    dispatch,
    getCoinFlipInfo,
    transactionSigner,
  ]);

  if (!activeAddress) {
    return <WalletNotConnected />;
  }

  if (isLoading || globalState === undefined || logs === undefined) {
    return <Loading />;
  }

  return (
    <Stack spacing={1}>
      <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
        <CardHeader
          avatar={<AsaIcon asaId={Number(globalState.assetId)} />}
          title={globalState.name}
          subheader={
            <Link
              variant="subtitle1"
              color="text.secondary"
              target="_blank"
              rel="noopener"
              href={`https://allo.info/application/${appId}`}
            >
              AppID: {appId}
            </Link>
          }
          action={
            <Box
              display="flex"
              alignItems="center"
              justifyContent={"center"}
              flexDirection={"column"}
            >
              <Circle
                sx={{
                  animation: `${pulse} ${1000}ms ease infinite`,
                }}
                fontSize="small"
                color={"success"}
              />
            </Box>
          }
          sx={{
            backgroundColor: "#272727",
          }}
        />
        <Divider />
        <CardContent>
          {cfg === undefined ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                m: -2,
                // backgroundColor: "#4158D0",
                // backgroundImage:
                //   "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  py: 1,
                  px: 2,
                  mb: -1,
                }}
              >
                <Typography variant="h6" color="text.primary">
                  Waiting for bet...
                </Typography>
              </Box>
              <Divider sx={{ width: "100%" }} />
              <Box
                sx={{ display: "flex", justifyContent: "center", my: 1, m: 2 }}
              >
                <CoinFlip
                  headsImg="images/coin-flip/HEADS.png"
                  tailsImg="images/coin-flip/TAILS.png"
                  result={prediction}
                />
              </Box>
              <Divider sx={{ width: "100%" }} />

              <Box sx={{ px: 2, width: "100%" }}>
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  paddingY={1}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Min Bet
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ display: "flex" }}
                  >
                    {formattedAssetAmount(
                      Number(globalState.assetId),
                      Number(globalState.minBet)
                    )}
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 1,
                      }}
                    >
                      <AsaIcon asaId={Number(globalState.assetId)} />
                    </Box>
                  </Typography>
                </Box>
                <Divider />
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  paddingY={1}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Max Bet
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ display: "flex" }}
                  >
                    {formattedAssetAmount(
                      Number(globalState.assetId),
                      Number(globalState.maxBet)
                    )}
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 1,
                      }}
                    >
                      <AsaIcon asaId={Number(globalState.assetId)} />
                    </Box>
                  </Typography>
                </Box>
                <Divider />
              </Box>
              <ToggleButtonGroup
                size="small"
                sx={{ mb: 1 }}
                value={prediction}
                onChange={handleChange}
                exclusive={true}
                aria-label="heads-tails-btn"
              >
                <ToggleButton value="heads" key="heads" sx={{ width: 100 }}>
                  Heads
                </ToggleButton>
                ,
                <ToggleButton value="tails" key="tails" sx={{ width: 100 }}>
                  Tails
                </ToggleButton>
              </ToggleButtonGroup>

              <Box
                sx={{
                  px: 2,
                  pb: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  width: "100%",
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  label="Bet"
                  variant="outlined"
                  value={wager}
                  sx={{ textAlign: "center" }}
                  onChange={(e) => {
                    let re = /^(\d)*(\.)?([0-9]{1})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setWager("");
                      return;
                    }

                    setWager(e.target.value);
                  }}
                  InputProps={{
                    inputProps: {
                      style: { textAlign: "center" },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            const convertedMin = formattedAssetAmount(
                              Number(globalState.assetId),
                              Number(globalState.minBet)
                            );

                            setWager(convertedMin);
                          }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => alert("not yet implemented")}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={() => alert("not yet implemented")}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            const convertedMax = formattedAssetAmount(
                              Number(globalState.assetId),
                              Number(globalState.maxBet)
                            );

                            setWager(convertedMax);
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  // sx={{ m: 0.1 }} // this slight margin makes it look better
                  size="small"
                  variant="contained"
                  onClick={onCreateClick}
                >
                  Play
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <CoinFlipInProgress
                currentRound={currentRound}
                assetId={globalState.assetId}
                address={activeAddress}
                wager={cfg.wager}
                heads={cfg.heads === 1}
                commitmentRound={cfg.commitmentRound}
                onChange={() => {
                  // clear cfg, game is over (and thus box already deleted)
                  setCfg(undefined);
                  // update info
                  getCoinFlipInfo(coinFlipClient!!);
                  // get new logs
                  getLogs();
                }}
              />
              {currentRound >= cfg!!.commitmentRound + 1512 && (
                <Button
                  variant="contained"
                  onClick={onCancelClick}
                  //disabled={currentRound <= cfg?.commitmentRound!!}
                >
                  Cancel Game
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showStats && (
        <Box sx={{ mb: 1 }}>
          <CoinFlipStats
            name={globalState.name}
            assetId={Number(globalState.assetId)}
            manager={globalState.manager}
            minBet={Number(globalState.minBet)}
            maxBet={Number(globalState.maxBet)}
            prizePool={Number(globalState.prizePool)}
            fees={Number(globalState.fees)}
            totalGames={Number(globalState.totalGames)}
            totalCancelled={Number(globalState.totalCancelled)}
            totalHeads={Number(globalState.totalHeads)}
            totalWagered={Number(globalState.totalWagered)}
            totalWinnings={Number(globalState.totalWon)}
          />
        </Box>
      )}
      <RecentGames logs={logs} assetId={Number(globalState.assetId)} />
    </Stack>
  );
};
