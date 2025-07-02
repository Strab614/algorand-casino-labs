import React, { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material";
import AsaIcon from "@/components/AsaIcon";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import {
  encodeAddress,
  encodeUint64,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { selectNetworkClients, setIsSignTxnOpen } from "@/features/appSlice";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";

import { NftBuyBackClient } from "../clients/NftBuyBackClient";
import * as algokit from "@algorandfoundation/algokit-utils";
import { getAssets } from "@/utils/utils";
import { Asset } from "@/api/algorand/algorand";
import { useNotification } from "@/hooks/useNotification";
import { Header } from "@/app/Header";

const SWAP_APP_ID = 1743042212;
const PAY_ASSET_ID = 388592191;

interface BuybackCardProps {
  onStatusChanged: (status: "success" | "error", message: string) => void;
}

const BuybackCard = ({ onStatusChanged }: BuybackCardProps) => {
  const dispatch = useAppDispatch();
  const { algod } = useAppSelector(selectNetworkClients);
  const { activeAddress, transactionSigner } = useWalletAdapter();

  const [assets, setAssets] = useState<Asset[]>();
  const [isLoading, setIsLoading] = useState(false);

  const [amount, setAmount] = useState(0);

  const [assetId, setAssetId] = React.useState(693545224);

  const [buyBackClient, setBuyBackClient] = useState<NftBuyBackClient>();
  const [nftReceiver, setNftReceiver] = useState<string>();

  const handleChange = (event: SelectChangeEvent) => {
    setAssetId(Number(event.target.value));
    setAmount(0);
  };

  const notification = useNotification();

  useEffect(() => {
    const _init = async () => {
      if (!activeAddress) return;

      setIsLoading(true);
      try {
        const r = await getAssets(activeAddress, algod);

        setAssets(r);

        const userClient = new NftBuyBackClient(
          {
            sender: {
              addr: activeAddress,
              signer: transactionSigner,
            },
            resolveBy: "id",
            id: SWAP_APP_ID,
          },
          algod
        );

        setBuyBackClient(userClient);

        const { receiver } = await userClient.getGlobalState();
        if (!receiver) {
          throw Error("nft receiver is not defined");
        }

        const address = encodeAddress(receiver?.asByteArray());
        setNftReceiver(address);
      } catch (error: unknown) {
        if (error instanceof Error) {
          onStatusChanged("error", error.message);
        }
      }

      setIsLoading(false);
    };

    if (!assets) {
      _init();
    }
  }, [
    dispatch,
    activeAddress,
    assets,
    algod,
    transactionSigner,
    notification,
    onStatusChanged,
  ]);

  const doSwap = async () => {
    if (buyBackClient && nftReceiver && activeAddress) {
      setIsLoading(true);

      try {
        const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: activeAddress,
          to: nftReceiver,
          assetIndex: assetId,
          amount: amount, // only send 1 nft
          suggestedParams: await algokit.getTransactionParams(undefined, algod),
        });

        dispatch(setIsSignTxnOpen(true));
        await buyBackClient.doSwap(
          { nftAxfer: txn },
          {
            boxes: [{ appIndex: 0, name: encodeUint64(assetId) }],
            assets: [PAY_ASSET_ID],
            sendParams: { fee: algokit.algos(0.002) },
          }
        );

        onStatusChanged("success", "Swap Completed");
      } catch (e: unknown) {
        if (e instanceof Error) {
          onStatusChanged("error", e.message);
        }
      }

      dispatch(setIsSignTxnOpen(false));
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
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
      const balance = getBalance(assetId);

      setAmount(balance);
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex" }}>
            <Typography variant="h6" color="text.primary">
              Trade your NFT for chip
            </Typography>
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                paddingLeft: 2,
              }}
            >
              <AsaIcon asaId={388592191} />
            </div>
          </div>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent>
        <Box component="div" sx={{ display: "flex", justifyContent: "center" }}>
          <FormControl>
            <InputLabel id="assetId-label">NFT ASA</InputLabel>
            <Select
              type="number"
              labelId="assetId-label"
              id="assetId-select"
              value={String(assetId)}
              label="NFT ASA"
              onChange={handleChange}
            >
              <MenuItem value={693545224}>10 chip/day (ID: 693545224)</MenuItem>
              <MenuItem value={797090353}>
                1% Casino Refund (ID: 797090353)
              </MenuItem>
              <MenuItem value={1032365802}>
                Autostake NFT (ID: 1032365802)
              </MenuItem>
            </Select>
            <Stack
              sx={{ mt: 1 }}
              direction="row"
              spacing={2}
              alignContent="center"
              justifyContent="center"
            >
              <TextField
                disabled={isLoading}
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleMaxClick}
                      >
                        Max
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Box
                component="div"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={() => doSwap()}
                  disabled={isLoading || amount <= 0}
                >
                  {isLoading ? <CircularProgress size={32} /> : "Swap"}
                </Button>
              </Box>
            </Stack>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
};
const NFTBuyback = () => {
  const notification = useNotification();

  const onStatusChanged = (status: "success" | "error", message: string) => {
    notification.display({ type: status, message: message });
  };

  return (
    <>
      <Container sx={{ my: 2, maxWidth: "md" }}>
        <Header
          title="NFT Buyback"
          whatIsThisContent={
            <Box component="div">
              <Typography variant="body1" paragraph color="text.primary">
                We will buy back any of the accepted NFTs below at their
                original purchase price. Refunds will be paid out instantly and
                is completed using a smart contract.
              </Typography>

              <Typography variant="body2" paragraph color="text.primary">
                • 1% Casino Refund (ID: 797090353) = 10,000 chip
              </Typography>
              <Typography variant="body2" paragraph color="text.primary">
                • 10 chip/day (ID: 693545224) = 7300 chip
              </Typography>
              <Typography variant="body2" paragraph color="text.primary">
                • Autostake NFT (ID: 1032365802) = 20,000{" "}
              </Typography>
            </Box>
          }
        />
        <Stack spacing={2}>
          <BuybackCard onStatusChanged={onStatusChanged} />
        </Stack>
      </Container>
    </>
  );
};

export default NFTBuyback;