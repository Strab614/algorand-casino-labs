import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Box,
  CircularProgress,
  Button,
  FormControl,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ellipseAddress, getAssets } from "@/utils/utils";

import { useAppDispatch } from "@/app/hooks";

import { setIsSignTxnOpen } from "@/features/appSlice";
import { StakingCommitment } from "../types";

import algosdk, { Algodv2 } from "algosdk";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";
import { bytesToBase64 } from "byte-base64";
import { WalletNotConnected } from "@/components/WalletNotConnected";
import { useNotification } from "@/hooks/useNotification";
import { getAlgodConfigFromViteEnvironment } from "@/utils/network";

const algodConfig = getAlgodConfigFromViteEnvironment();
const algod = new Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

export interface Props {
  stakingPeriodId: number;
  stakingCommittments?: StakingCommitment[]; // users staking commitment
  showEdit: boolean;
}

export const StakingCommit = ({
  stakingPeriodId,
  stakingCommittments,
  showEdit = false,
}: Props) => {
  const { activeAddress, signTransactions } = useWalletAdapter();

  const [assets, setAssets] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

  const notification = useNotification();
  const [chipAmount, setChipAmount] = useState("0.0");
  const [liquidityAmount, setLiquidityAmount] = useState("0.0");
  const [liquidityAmountV2, setLiquidityAmountV2] = useState("0.0");
  const [cAlgoAmount, setCAlgoAmount] = useState("0.0");
  const [tAlgoAmount, setTAlgoAmount] = useState("0.0");
  const [mAlgoAmount, setMAlgoAmount] = useState("0.0");
  const [xAlgoAmount, setXAlgoAmount] = useState("0.0");

  const [isEditing, setIsEditing] = useState(false);

  const createAuthTransaction = async () => {
    if (!activeAddress) {
      alert("wallet not connected");
      return;
    }
    const suggestedParams = await algod.getTransactionParams().do();

    const enc = new TextEncoder();
    // must pass domain as note, extra layer of validation
    const note = enc.encode("https://labs.algo-casino.com");

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      activeAddress,
      activeAddress,
      undefined,
      undefined,
      0,
      note,
      388592191,
      suggestedParams,
      undefined
    );

    let signedTxn;

    dispatch(setIsSignTxnOpen(true));

    try {
      const encodedTransaction = algosdk.encodeUnsignedTransaction(txn);
      signedTxn = await signTransactions([encodedTransaction]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        notification.display({ type: "error", message: error.message });
      }
      dispatch(setIsSignTxnOpen(false));
      return null;
    }

    dispatch(setIsSignTxnOpen(false));

    return bytesToBase64(signedTxn[0]!);
  };

  const stakingCommittment = useMemo(() => {
    return stakingCommittments?.find((el) => {
      return el.algorandAddress === activeAddress;
    });
  }, [activeAddress, stakingCommittments]);

  const commit = async () => {
    const numChipAmount = parseFloat(chipAmount);
    const numLiquidityAmount = parseFloat(liquidityAmount);
    const numLiquidityAmountV2 = parseFloat(liquidityAmountV2);
    const numCAlgoAmount = parseFloat(cAlgoAmount);
    const numTAlgoAmount = parseFloat(tAlgoAmount);
    const numMAlgoAmount = parseFloat(mAlgoAmount);
    const numXAlgoAmount = parseFloat(xAlgoAmount);

    // if (
    //   !chipAmount ||
    //   !liquidityAmount ||
    //   (numChipAmount <= 0 &&
    //     numLiquidityAmount <= 0 &&
    //     numLiquidityAmountV2 <= 0)
    // ) {
    //   alert("Cannot commit nothing!");
    //   return;
    // }

    const authTx = await createAuthTransaction();

    if (!authTx) {
      notification.display({
        type: "error",
        message: "failed to create auth transaction",
      });

      return;
    }

    // create payment intent
    const response = await fetch(
      "https://api.algo-casino.com/stakingCommitments",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // auth parts
          transaction: authTx,
          pubkey: activeAddress,

          algorandAddress: activeAddress,
          stakingPeriodId: stakingPeriodId,
          chipCommitment: numChipAmount * 10,
          liquidityCommitment: Math.round(numLiquidityAmount * 1000000),
          liquidityCommitmentV2: Math.round(numLiquidityAmountV2 * 1000000),
          cAlgoCommitment: Math.round(numCAlgoAmount * 1000000),
          tAlgoCommitment: Math.round(numTAlgoAmount * 1000000),
          mAlgoCommitment: Math.round(numMAlgoAmount * 1000000),
          xAlgoCommitment: Math.round(numXAlgoAmount * 1000000),
        }),
      }
    );

    const buf = await response.json();

    if (!response.ok) {
      notification.display({ type: "error", message: buf.message });
      return;
    }

    notification.display({
      type: "success",
      message: "You have committed for this period.",
    });
  };

  const update = async () => {
    const numChipAmount = parseFloat(chipAmount);
    const numLiquidityAmount = parseFloat(liquidityAmount);
    const numLiquidityAmountV2 = parseFloat(liquidityAmountV2);
    const numCAlgoAmount = parseFloat(cAlgoAmount);
    const numTAlgoAmount = parseFloat(tAlgoAmount);
    const numMAlgoAmount = parseFloat(mAlgoAmount);
    const numXAlgoAmount = parseFloat(xAlgoAmount);

    if (
      /*!chipAmount ||
      !liquidityAmount ||
      (numChipAmount <= 0 &&
        numLiquidityAmount <= 0 &&
        numLiquidityAmountV2 <= 0) ||*/
      !stakingCommittment
    ) {
      alert("Cannot update nothing!");
      return;
    }

    const authTx = await createAuthTransaction();

    if (!authTx) {
      notification.display({
        type: "error",
        message: "failed to create auth transaction",
      });

      return;
    }

    // create payment intent
    const response = await fetch(
      `https://api.algo-casino.com/stakingCommitments/${stakingCommittment.id}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // authparts
          transaction: authTx,
          pubkey: activeAddress,

          chipCommitment: numChipAmount * 10,
          liquidityCommitment: Math.round(numLiquidityAmount * 1000000),
          liquidityCommitmentV2: Math.round(numLiquidityAmountV2 * 1000000),
          cAlgoCommitment: Math.round(numCAlgoAmount * 1000000),
          tAlgoCommitment: Math.round(numTAlgoAmount * 1000000),
          mAlgoCommitment: Math.round(numMAlgoAmount * 1000000),
          xAlgoCommitment: Math.round(numXAlgoAmount * 1000000),
        }),
      }
    );

    const buf = await response.json();

    if (!response.ok) {
      setIsEditing(false);
      notification.display({ type: "error", message: buf.message });
      return;
    }

    notification.display({
      type: "success",
      message:
        "You have updated your commitment. Please refresh the page to see changes.",
    });

    setIsEditing(false);
  };

  useEffect(() => {
    const _getAssets = async () => {
      setIsLoading(true);
      try {
        const r = await getAssets(activeAddress!, algod);

        setAssets(r);
      } catch (error) {
        notification.display({ type: "error", message: error });
        return;
      }

      setIsLoading(false);
    };
    if (activeAddress && !assets) {
      _getAssets();
    }
  }, [dispatch, activeAddress, assets, algod]);

  useEffect(() => {
    if (stakingCommittment) {
      const {
        chipCommitment,
        liquidityCommitment,
        liquidityCommitmentV2,
        cAlgoCommitment,
        tAlgoCommitment,
        mAlgoCommitment,
        xAlgoCommitment,
      } = stakingCommittment;

      setChipAmount((chipCommitment / 10).toFixed(1).toString());
      setLiquidityAmount((liquidityCommitment / 1000000).toFixed(6).toString());
      setLiquidityAmountV2(
        (liquidityCommitmentV2 / 1000000).toFixed(6).toString()
      );
      setCAlgoAmount((cAlgoCommitment / 1000000).toFixed(6).toString());
      setTAlgoAmount((tAlgoCommitment / 1000000).toFixed(6).toString());
      setMAlgoAmount((mAlgoCommitment / 1000000).toFixed(6).toString());
      setXAlgoAmount((xAlgoCommitment / 1000000).toFixed(6).toString());
    }
  }, [stakingCommittment]);

  const handleMaxClick = (
    type:
      | "chip"
      | "liquidity"
      | "liquidityV2"
      | "cAlgoChip"
      | "tAlgoChip"
      | "mAlgoChip"
      | "xAlgoChip"
  ) => {
    const getBalance = (assetId: number): number => {
      if (!assets) {
        return -1;
      }

      const asset = assets.find((item) => item["asset-id"] === assetId);
      if (asset) {
        return asset.amount;
      } else {
        return 0;
      }
    };

    if (!isLoading && assets) {
      if (type === "chip") {
        const balance = getBalance(388592191);

        setChipAmount((balance / 10).toFixed(1));
      } else if (type === "liquidity") {
        const balance = getBalance(552665159);

        setLiquidityAmount((balance / 1000000).toFixed(6));
      } else if (type === "liquidityV2") {
        const balance = getBalance(1002609713);

        setLiquidityAmountV2((balance / 1000000).toFixed(6));
      } else if (type === "cAlgoChip") {
        const balance = getBalance(2562903034);

        setCAlgoAmount((balance / 1000000).toFixed(6));
      } else if (type === "tAlgoChip") {
        const balance = getBalance(2545480441);

        setTAlgoAmount((balance / 1000000).toFixed(6));
      } else if (type === "mAlgoChip") {
        const balance = getBalance(2536627349);

        setMAlgoAmount((balance / 1000000).toFixed(6));
      } else if (type === "xAlgoChip") {
        const balance = getBalance(2520645026);

        setXAlgoAmount((balance / 1000000).toFixed(6));
      }
    }
  };

  if (isLoading) {
    return (
      <Container
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!activeAddress) {
    return <WalletNotConnected />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div>
        <Typography textAlign={"center"} sx={{ mb: 1 }}>
          Algorand Address: {ellipseAddress(activeAddress)}
        </Typography>
      </div>

      {stakingCommittment ? (
        <Box>
          {showEdit && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Your Commitment</Typography>
              <Button
                variant="outlined"
                sx={{ padding: 0.1, marginLeft: 1, bg: "#edb345" }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <EditIcon />
              </Button>
            </Box>
          )}
          <Typography variant="subtitle1">
            ID: {stakingCommittment.id}
          </Typography>
          {isEditing ? (
            <Stack
              sx={{ mt: 1, maxWidth: "sm" }}
              direction="column"
              spacing={2}
              alignContent="center"
              //alignItems="center"
              justifyContent="center"
            >
              <TextField
                label="Chip Amount"
                variant="outlined"
                value={chipAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setChipAmount("");
                    return;
                  }

                  setChipAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("chip")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Liquidity Amount"
                variant="outlined"
                value={liquidityAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setLiquidityAmount("");
                    return;
                  }

                  setLiquidityAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("liquidity")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Liquidity Amount V2"
                variant="outlined"
                value={liquidityAmountV2}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setLiquidityAmountV2("");
                    return;
                  }

                  setLiquidityAmountV2(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("liquidityV2")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="cALGO/chip"
                variant="outlined"
                value={cAlgoAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setCAlgoAmount("");
                    return;
                  }

                  setCAlgoAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("cAlgoChip")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="tALGO/chip"
                variant="outlined"
                value={tAlgoAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setTAlgoAmount("");
                    return;
                  }

                  setTAlgoAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("tAlgoChip")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="mALGO/chip"
                variant="outlined"
                value={mAlgoAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setMAlgoAmount("");
                    return;
                  }

                  setMAlgoAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("mAlgoChip")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="xALGO/chip"
                variant="outlined"
                value={xAlgoAmount}
                onChange={(e) => {
                  const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                  if (
                    !re.test(e.target.value) ||
                    isNaN(parseFloat(e.target.value))
                  ) {
                    setXAlgoAmount("");
                    return;
                  }

                  setXAlgoAmount(e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMaxClick("xAlgoChip")}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Button title="Update" variant="contained" onClick={update}>
                Update
              </Button>
            </Stack>
          ) : (
            <>
              <Typography variant="subtitle1">
                Chips: {stakingCommittment.chipCommitment / 10}
              </Typography>
              <Typography variant="subtitle1">
                TM LP:{" "}
                {(stakingCommittment.liquidityCommitment +
                  stakingCommittment.liquidityCommitmentV2) /
                  1000000}{" "}
                ({stakingCommittment.liquidityCommitment / 1000000} V1 &{" "}
                {stakingCommittment.liquidityCommitmentV2 / 1000000} V2)
              </Typography>
              <Typography variant="subtitle1">
                Liquid LP:{" "}
                {(stakingCommittment.cAlgoCommitment +
                  stakingCommittment.tAlgoCommitment +
                  stakingCommittment.mAlgoCommitment +
                  stakingCommittment.xAlgoCommitment) /
                  1000000}{" "}
                ({stakingCommittment.cAlgoCommitment / 1000000} cALGO/chip &{" "}
                {stakingCommittment.tAlgoCommitment / 1000000} tALGO/chip &{" "}
                {stakingCommittment.mAlgoCommitment / 1000000} mALGO/chip &{" "}
                {stakingCommittment.xAlgoCommitment / 1000000} xALGO/chip)
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <>
          {showEdit ? (
            <FormControl sx={{ maxWidth: "sm" }}>
              <Stack
                sx={{ mt: 1 }}
                direction="column"
                spacing={2}
                alignContent="center"
                justifyContent="center"
              >
                <TextField
                  label="Chip Amount"
                  variant="outlined"
                  value={chipAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setChipAmount("");
                      return;
                    }

                    setChipAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("chip")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Liquidity Amount"
                  variant="outlined"
                  value={liquidityAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setLiquidityAmount("");
                      return;
                    }

                    setLiquidityAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("liquidity")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Liquidity Amount V2"
                  variant="outlined"
                  value={liquidityAmountV2}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setLiquidityAmountV2("");
                      return;
                    }

                    setLiquidityAmountV2(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("liquidityV2")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="cALGO/chip"
                  variant="outlined"
                  value={cAlgoAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setCAlgoAmount("");
                      return;
                    }

                    setCAlgoAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("cAlgoChip")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="tALGO/chip"
                  variant="outlined"
                  value={tAlgoAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setTAlgoAmount("");
                      return;
                    }

                    setTAlgoAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("tAlgoChip")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="mALGO/chip"
                  variant="outlined"
                  value={mAlgoAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setMAlgoAmount("");
                      return;
                    }

                    setMAlgoAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("mAlgoChip")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="xALGO/chip"
                  variant="outlined"
                  value={xAlgoAmount}
                  onChange={(e) => {
                    const re = /^(\d)*(\.)?([0-9]{1,6})?$/gm;

                    if (
                      !re.test(e.target.value) ||
                      isNaN(parseFloat(e.target.value))
                    ) {
                      setXAlgoAmount("");
                      return;
                    }

                    setXAlgoAmount(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleMaxClick("xAlgoChip")}
                        >
                          Max
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Button variant="contained" onClick={commit} sx={{ mt: 2 }}>
                Commit
              </Button>
            </FormControl>
          ) : (
            <p>Registration period is closed and you have not registered.</p>
          )}
        </>
      )}
    </Box>
  );
};