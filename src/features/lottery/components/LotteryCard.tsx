import { algos } from "@algorandfoundation/algokit-utils";
import {
  Grid,
  Card,
  CardHeader,
  Box,
  Divider,
  CardContent,
  Typography,
  CardActions,
  Button,
  Link,
  Stack,
} from "@mui/material";
import * as algokit from "@algorandfoundation/algokit-utils";
import CircleIcon from "@mui/icons-material/Circle";
import { useWallet } from "@txnlab/use-wallet-react";

import algosdk, {
  encodeAddress,
  decodeAddress,
  makePaymentTxnWithSuggestedParamsFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LotteryClient } from "../clients/LotteryClient";
import { setIsSignTxnOpen, selectNetworkClients } from "../../appSlice";
import {
  blockTimeAgo,
  decodeArc4String,
  ellipseAddress,
  formattedAssetAmount,
} from "@/utils/utils";
import AsaIcon from "@/components/AsaIcon";
import Loading from "@/components/Loading";
import { WalletNotConnected } from "@/components/WalletNotConnected";
import { UserTickets } from "./UserTickets";
import { WinningNumbers } from "./WinningNumbers";
import {
  decodeLotteryNumbers,
  getEntryFromAppId,
  hasUniqueValues,
  sortLotteryNumbers,
} from "../utils";
import { BOX_TRUE_COST, LotteryNumbers, MAX_ENTRIES } from "../types";
import { LotteryEntrySelect } from "./LotteryEntrySelect";
import { Countdown } from "./Countdown";
import { pulse } from "@/styles";
import { useLottery } from "../../../routes/lottery/layout";
import { useNotification } from "@/hooks/useNotification";

export interface Props {
  appId: number;
  currentRound: number;
}

export const LotteryCard = ({ appId, currentRound }: Props) => {
  const { applications } = useLottery();

  const dispatch = useAppDispatch();

  const notification = useNotification();

  const { algod, indexer } = useAppSelector(selectNetworkClients);

  const { activeAddress, transactionSigner } = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const [lotteryClient, setLotteryClient] = useState<LotteryClient>();

  const [entry, setEntry] = useState<LotteryNumbers[]>();

  // user boxes read result
  const [userEntry, setUserEntry] = useState<LotteryNumbers[]>();

  // users previous lotto entry
  const [previousEntry, setPreviousEntry] = useState<LotteryNumbers[]>();

  // global state of client

  const [manager, setManager] = useState<string>();
  const [ticketPrice, setTicketPrice] = useState<number>();
  const [name, setName] = useState<string>();
  const [assetId, setAssetId] = useState<number>();
  const [endRound, setEndRound] = useState<number>();
  const [drawRound, setDrawRound] = useState<number>();
  const [prizePool, setPrizePool] = useState<number>();
  const [ticketsSold, setTicketsSold] = useState<number>();
  const [winningNumbers, setWinningNumbers] = useState<LotteryNumbers>();

  const getLotteryInfo = async (client: LotteryClient) => {
    // cannot call without initialsied clients
    if (!client || !activeAddress) {
      return;
    }

    try {
      const { na, ma, tp, pp, as, er, dr, wn, ts } =
        await client.getGlobalState();
      if (!na || !ma || !tp || !pp) {
        throw Error("no global state");
      }
      setName(decodeArc4String(na.asByteArray()!));
      setAssetId(as?.asNumber());
      setManager(encodeAddress(ma?.asByteArray()));
      setTicketPrice(tp.asNumber());
      setPrizePool(pp.asNumber());
      setEndRound(er?.asNumber());
      setDrawRound(dr?.asNumber());
      setTicketsSold(ts?.asNumber());

      // winning numbers present?
      if (wn) {
        const a = algosdk.ABIType.from("uint16[5]");
        const v = a.decode(wn.asByteArray()!).valueOf() as LotteryNumbers;

        setWinningNumbers(sortLotteryNumbers(v));
      }
    } catch (error) {
      notification.display({
        type: "error",
        message: "failed to fetch lottery info" + error,
      });
    }

    try {
      // find our current position in the list (usually first entry 0)
      const index = applications.findIndex((el) => el["id"] === appId);

      // get the previous lottery tickets
      const { id } = applications[index + 1];

      const pe: LotteryNumbers[] | undefined = await getEntryFromAppId(
        id,
        activeAddress,
        indexer
      );

      setPreviousEntry(pe);

      const bd = await client.appClient.getBoxValue(
        decodeAddress(activeAddress).publicKey
      );

      // get the users entry if they have one
      const r: LotteryNumbers[] = decodeLotteryNumbers(bd);

      setUserEntry(r);
    } catch (error) {
      // no issues, the box just doesn't exist
    }
  };

  useEffect(() => {
    const _init = async () => {
      if (!activeAddress) return;

      setIsLoading(true);
      try {
        const userClient = new LotteryClient(
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

        setLotteryClient(userClient);

        await getLotteryInfo(userClient);
      } catch (error) {
        notification.display({
          type: "error",
          message: "something went wrong" + error,
        });
      }

      setIsLoading(false);
    };

    if (!lotteryClient) {
      _init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    activeAddress,
    algod,
    transactionSigner,
    appId,
    getLotteryInfo,
  ]);

  const buyTickets = async () => {
    if (lotteryClient && activeAddress && ticketPrice && assetId && entry) {
      setIsLoading(true);

      let found = false;
      // validate all entries
      entry.forEach((element, index) => {
        if (
          !hasUniqueValues([
            element[0],
            element[1],
            element[2],
            element[3],
            element[4],
          ])
        ) {
          alert("index " + index + " is not unique");
          found = true;
        }
      });

      // abort if not unique
      if (found) {
        return;
      }

      try {
        const { appAddress } = await lotteryClient.appClient.getAppReference();
        if (!appAddress) {
          throw Error("appAddress");
        }

        // are we updating a current entry?
        if (userEntry) {
          // for some reason userEntry size is changing even without an update
          const currentLength = userEntry.length;
          const newLength = entry.length;
          const diff = newLength - currentLength;

          // is there no difference?
          if (diff <= 0) {
            alert("cannot remove entries");
            return;
          }

          const axfer = makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: activeAddress,
            to: appAddress,
            amount: ticketPrice * diff,
            assetIndex: assetId,
            suggestedParams: await algokit.getTransactionParams(
              undefined,
              algod
            ),
          });

          await lotteryClient.setEntry(
            { axfer, entry },
            {
              sendParams: {
                fee: algos(0.01),
              },
              boxes: [
                { appIndex: 0, name: decodeAddress(activeAddress).publicKey },
              ],
            }
          );
        } else {
          const a = lotteryClient.compose();

          const boxFeeTxn = makePaymentTxnWithSuggestedParamsFromObject({
            from: activeAddress,
            to: appAddress,
            amount: BOX_TRUE_COST,
            suggestedParams: await algokit.getTransactionParams(
              undefined,
              algod
            ),
          });

          const axfer = makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: activeAddress,
            to: appAddress,
            amount: ticketPrice * entry.length,
            assetIndex: assetId,
            suggestedParams: await algokit.getTransactionParams(
              undefined,
              algod
            ),
          });

          a.addTransaction(boxFeeTxn).setEntry(
            { axfer, entry: entry },
            {
              sendParams: { fee: algos(0.01) },
              boxes: [
                { appIndex: 0, name: decodeAddress(activeAddress).publicKey },
              ],
            }
          );

          // send txn
          await a.execute();
        }

        dispatch(setIsSignTxnOpen(true));
      } catch (error) {
        notification.display({
          type: "error",
          message: "Something went wrong: " + error,
        });
      }

      // refresh lotto data (and get user entry from box)
      await getLotteryInfo(lotteryClient);

      dispatch(setIsSignTxnOpen(false));
      setIsLoading(false);
    }
  };

  const getRefund = async () => {
    if (lotteryClient && activeAddress && ticketPrice && assetId) {
      setIsLoading(true);

      try {
        dispatch(setIsSignTxnOpen(true));

        await lotteryClient.getRefund(
          { address: activeAddress },
          {
            sendParams: { fee: algos(0.003) },
            boxes: [
              { appIndex: 0, name: decodeAddress(activeAddress).publicKey },
            ],
            assets: [assetId],
          }
        );
      } catch (error) {
        notification.display({
          type: "error",
          message: "something went wrong" + error,
        });
      }

      dispatch(setIsSignTxnOpen(false));
      setIsLoading(false);
    }
  };

  if (!activeAddress) {
    return <WalletNotConnected />;
  }

  if (isLoading || !ticketPrice) {
    return <Loading />;
  }

  if (prizePool === undefined || !endRound || !drawRound) {
    return <p>You Need to connect your wallet.</p>;
  }

  return (
    <>
      <Grid
        container
        columnSpacing={1}
        rowSpacing={1}
        direction={"row-reverse"}
      >
        {winningNumbers ? (
          <Grid item xs={12} md={6}>
            {winningNumbers && (
              <WinningNumbers
                winningNumbers={[
                  winningNumbers[0],
                  winningNumbers[1],
                  winningNumbers[2],
                  winningNumbers[3],
                  winningNumbers[4],
                ]}
              />
            )}
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Countdown currentRound={currentRound} drawRound={drawRound} />
          </Grid>
        )}
        {userEntry && (
          <Grid item xs={12} md={6}>
            <UserTickets
              userEntry={userEntry}
              winningNumbers={winningNumbers}
            />
          </Grid>
        )}
      </Grid>
      <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
        <CardHeader
          avatar={<AsaIcon asaId={assetId!} />}
          title={name}
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
              <CircleIcon
                sx={{
                  animation: `${pulse} ${1000}ms ease infinite`,
                }}
                fontSize="small"
                color={
                  currentRound < endRound
                    ? "success"
                    : currentRound > drawRound && winningNumbers === undefined
                    ? "warning"
                    : "error"
                }
              />
            </Box>
          }
          sx={{
            backgroundColor: "#272727",
          }}
        />
        <Divider />
        <CardContent>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            paddingBottom={1}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Manager
            </Typography>
            <Link
              variant="subtitle1"
              color="text.secondary"
              target="_blank"
              rel="noopener"
              href={`https://allo.info/account/${manager}`}
            >
              {ellipseAddress(manager)}
            </Link>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            paddingY={1}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Ticket Price
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {formattedAssetAmount(assetId!, ticketPrice)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={assetId!} />
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
              Tickets Sold
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {ticketsSold}
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
              Prize Pool
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {formattedAssetAmount(assetId!, prizePool)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={assetId!} />
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
              Draw Round
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {drawRound} ({blockTimeAgo(currentRound, drawRound)})
            </Typography>
          </Box>
          <Divider />
        </CardContent>
        <CardActions sx={{ display: "flex", justifyContent: "center" }}>
          {winningNumbers === undefined &&
          userEntry !== undefined &&
          drawRound <= currentRound - 1512 ? (
            <Button variant="outlined" onClick={getRefund} disabled={isLoading}>
              Get Refund
            </Button>
          ) : (
            <Stack>
              {!winningNumbers && currentRound <= endRound && (
                <>
                  <LotteryEntrySelect
                    existingEntry={userEntry}
                    previousEntry={previousEntry}
                    onChange={(entry: LotteryNumbers[]) => setEntry(entry)}
                  />
                  <Divider sx={{ my: 1 }} />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ display: "flex" }}
                    >
                      Price:{" "}
                      {entry?.length! > 0
                        ? formattedAssetAmount(
                            assetId!,
                            entry?.length! * ticketPrice
                          )
                        : 0!}
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: 1,
                        }}
                      >
                        <AsaIcon asaId={assetId!} />
                      </Box>
                    </Typography>
                    <Button
                      onClick={buyTickets}
                      variant="contained"
                      sx={{ ml: 1 }}
                      disabled={
                        isLoading ||
                        entry?.length! <= 0 ||
                        userEntry?.length! >= MAX_ENTRIES
                      }
                    >
                      Set Entry
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </CardActions>
      </Card>
    </>
  );
};
