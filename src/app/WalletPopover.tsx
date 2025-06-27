import { getAccountBalances } from "@/api/algorand/algorand";
import AsaIcon from "@/components/AsaIcon";
import {
  copyTextToClipboard,
  ellipseAddress,
  formattedAssetAmount,
} from "@/utils/utils";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Link as MuiLink,
} from "@mui/material";

import {
  ContentCopy as ContentCopyIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { microalgosToAlgos } from "algosdk";
import { useMemo } from "react";

import { useNotification } from "@/hooks/useNotification";

export interface WalletPopoverProps {
  activeAddress: string;
  id?: string;
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onDisconnect: () => void;
}

export const WalletPopover = ({
  activeAddress,
  id,
  open,
  anchorEl,
  onClose,
  onDisconnect,
}: WalletPopoverProps) => {
  // Queries
  const { isPending, isError, error, data } = useQuery({
    queryKey: ["assets", activeAddress],
    queryFn: activeAddress
      ? () => getAccountBalances(activeAddress)
      : undefined,
  });

  const notification = useNotification();

  const chipAmount: number | undefined = useMemo(() => {
    if (!data) return undefined;

    const chipAsset = data.assets.find((v) => v["asset-id"] === 388592191);

    return chipAsset?.amount;
  }, [data]);

  if (isPending) {
    return null;
  }

  if (isError) {
    notification.display({
      type: "error",
      message: `Error : ${error.message}`,
    });
  }

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Box component={"div"} width={232}>
        <Box
          component="div"
          display="flex"
          flexDirection={"row"}
          alignItems="center"
          justifyContent="space-between"
          paddingX={2}
          paddingY={1}
        >
          <Typography>
            <MuiLink
              variant="subtitle1"
              color="text.secondary"
              target="_blank"
              rel="noopener"
              href={`https://allo.info/account/${activeAddress}`}
            >
              {ellipseAddress(activeAddress)}
            </MuiLink>
          </Typography>
          <IconButton
            onClick={() => {
              copyTextToClipboard(activeAddress);
              // copy address to clipboard
              // notify user

              notification.display({
                type: "success",
                message: "Address copied to clipboard",
              });
            }}
            size="small"
          >
            <ContentCopyIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box component="div" paddingX={2} paddingY={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Balances
          </Typography>
          <Box
            component={"div"}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>ALGO</Typography>
            <Box component="div" display="flex">
              <Typography sx={{ pr: 1 }}>
                {data
                  ? microalgosToAlgos(Number(data.microAlgos)).toFixed(3)
                  : "?"}{" "}
              </Typography>
              <AsaIcon asaId={0} />
            </Box>
          </Box>
          <Box
            component={"div"}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>chip</Typography>
            <Box component="div" display="flex">
              <Typography sx={{ pr: 1 }}>
                {chipAmount ? (
                  <>{formattedAssetAmount(388592191, chipAmount)}</>
                ) : (
                  <>?</>
                )}{" "}
              </Typography>
              <AsaIcon asaId={388592191} />
            </Box>
          </Box>
        </Box>
        <Divider />
        <Button
          size="small"
          variant="text"
          color="error"
          sx={{
            paddingLeft: "auto",
            paddingRight: 0,
            paddingY: 1,
            width: "100%",
          }}
          onClick={() => {
            // call ondisconnect
            onDisconnect();
            //onClose();
          }}
        >
          <LogoutIcon sx={{ mr: 1 }} />
          Disconnect
        </Button>
      </Box>
    </Popover>
  );
};
