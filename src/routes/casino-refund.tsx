import { useState } from "react";
import {
  Button,
  Container,
  Stack,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from "@mui/material";

import AsaIcon from "@/components/AsaIcon";
import { ellipseAddress } from "@/utils/utils";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";
import { WalletNotConnected } from "@/components/WalletNotConnected";
import { ApiQuote, NftClaim } from "@/types/casinoRefund";
import { useNotification } from "@/hooks/useNotification";
import { Header } from "@/app/Header";

interface NftClaimInfoProps {
  nftClaim: NftClaim;
}

const NftClaimInfo = ({ nftClaim }: NftClaimInfoProps) => {
  return (
    <Box
      component="div"
      px={8}
      p={1}
      sx={{
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "secondary.main",
        borderRadius: 1,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textAlign: "center",
          mb: 1,
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: "primary.main",
          borderRadius: 1,
          p: 1,
          fontWeight: "bold",
        }}
      >
        Here is the confirmation details of your refund request, you can note
        these details down or screenshot them for reference. Your request will
        be processed within 48 hours. Thank you for your patience!
      </Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Address:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {ellipseAddress(nftClaim.address)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Created At:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftClaim.created_at}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          ID:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftClaim.id}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Claim Type:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftClaim.refundType === 0 ? "1%" : "10%"}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Refund Amount:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftClaim.refundAmount.toFixed(1)} chip
        </Typography>
      </Stack>
    </Box>
  );
};

interface NftQuoteInfoProps {
  address: string;
  nftQuote: ApiQuote;
}

const NftQuoteInfo = ({ address, nftQuote }: NftQuoteInfoProps) => {
  return (
    <Box
      component="div"
      px={8}
      p={1}
      sx={{
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "secondary.main",
        borderRadius: 1,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Address:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {ellipseAddress(address)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Bet Count:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftQuote.betCount}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Win Count:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftQuote.winCount}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Bet Total:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftQuote.betTotal} chip
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Profit Total:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {nftQuote.profitTotal} chip
        </Typography>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: "bold" }}
        >
          Refund Amount:{" "}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {(
            Math.floor(
              (Math.abs(nftQuote.profitTotal) /
                (nftQuote.type === 0 ? 100 : 10)) *
                10
            ) / 10
          ).toFixed(1)}{" "}
          chip ({nftQuote.type === 0 ? "1%" : "10%"})
        </Typography>
      </Stack>
    </Box>
  );
};

interface QuoteCardProps {
  address: string;
}

const QuoteCard = ({ address }: QuoteCardProps) => {
  const [apiQuote, setApiQuote] = useState<ApiQuote>();
  const [nftClaim, setNftClaim] = useState<NftClaim>();

  const notification = useNotification();

  const getQuote = async () => {
    // get a quote from the backend
    const response = await fetch("https://api.algo-casino.com/casino/check", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: address }),
    });

    const buf = await response.json();

    if (!response.ok) {
      notification.display({ type: "error", message: buf.message });
      return;
    }
    setApiQuote(buf);
  };

  const submitClaimRequest = async () => {
    // get a quote from the backend
    const response = await fetch("https://api.algo-casino.com/casino/claim", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ address: address }),
    });

    const buf = await response.json();

    if (!response.ok) {
      notification.display({ type: "error", message: buf.message });
      return;
    }

    setNftClaim(buf);
  };

  return (
    <>
      <Card>
        <CardHeader
          title={
            <div style={{ display: "flex" }}>
              <Typography variant="h6" color="text.primary">
                Get a quote
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
          {!apiQuote ? (
            <Box textAlign="center" pt={1}>
              <Button variant="contained" onClick={getQuote}>
                Get Quote
              </Button>
            </Box>
          ) : (
            <>
              {nftClaim ? (
                <Box>
                  <NftClaimInfo nftClaim={nftClaim} />
                </Box>
              ) : (
                <Box textAlign="center" mt={1}>
                  <NftQuoteInfo address={address} nftQuote={apiQuote} />
                  <Button
                    variant="contained"
                    onClick={submitClaimRequest}
                    sx={{ mt: 1 }}
                  >
                    Submit Claim
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const CasinoRefund = () => {
  const { activeAddress } = useWalletAdapter();

  return (
    <Container sx={{ my: 2 }}>
      <Header
        title="Casino Refund"
        whatIsThisContent={
          <Box component={"div"}>
            <Typography variant="body1" paragraph color="text.primary">
              Here you can can get a 1% or 10% refund of your total losses at
              the casino. (http://beta.algo-casino.com)
            </Typography>
            <Typography variant="body1" paragraph color="text.primary">
              Each address can only claim once. You must have the ASA (ID:
              797090353 or 797095358) in your wallet to be eligible.
            </Typography>
          </Box>
        }
      />

      <Stack spacing={2}>
        {activeAddress ? (
          <QuoteCard address={activeAddress} />
        ) : (
          <WalletNotConnected />
        )}
      </Stack>
    </Container>
  );
};

export default CasinoRefund;