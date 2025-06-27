import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";

import { ListChildComponentProps, VariableSizeList } from "react-window";

import { copyTextToClipboard, ellipseAddress } from "../../../utils/utils";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CelebrationIcon from "@mui/icons-material/Celebration";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import MovingIcon from "@mui/icons-material/Moving";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import { LotteryEvent, LotteryNumbers } from "../types";

import { LotteryLogsFormatted } from "../utils";

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;

  const item: LotteryEvent = data[index];

  const { address, tickets } = item.data as {
    address: string;
    tickets: LotteryNumbers[];
  };

  const getIcon = () => {
    switch (item.type) {
      case "PrizePoolAdded":
        return <MovingIcon color="primary" fontSize="small" />;
      case "BuyTicket":
        return <ShoppingBagIcon color="primary" fontSize="small" />;
      case "Refund":
        return <KeyboardReturnIcon color="primary" fontSize="small" />;
      case "Draw":
        return <BlurCircularIcon color="primary" fontSize="small" />;
      case "WinnerPaid":
        return <CelebrationIcon color="primary" fontSize="small" />;
      case "Delete":
        return <DeleteForeverIcon color="primary" fontSize="small" />;
    }
  };
  return (
    <ListItem
      style={style}
      key={index}
      secondaryAction={
        <>
          <IconButton
            size="small"
            aria-label="comment"
            onClick={() =>
              window.open(`https://allo.info/tx/${item.txid}`, "_blank")
            }
          >
            <img
              src={"/images/allo.png"}
              alt={"allo"}
              loading="lazy"
              height="24px"
              width="24px"
            />
          </IconButton>
          <IconButton
            size="small"
            aria-label="comment"
            onClick={() => copyTextToClipboard(item.txid)}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <ListItemAvatar sx={{ mr: -3 }}>{getIcon()}</ListItemAvatar>
      <ListItemText
        color="purple"
        primary={`${item.type}`}
        primaryTypographyProps={{
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: "bold",

          letterSpacing: 0,
        }}
        secondary={
          item.type === "BuyTicket"
            ? `${ellipseAddress(address)} ${tickets.length}`
            : item.data.toString()
        }
        secondaryTypographyProps={{
          fontFamily: "monospace",
          fontSize: 14,

          letterSpacing: 0,
        }}
        onClick={() =>
          item.type === "BuyTicket" && alert(JSON.stringify(tickets))
        }
      />
    </ListItem>
  );
}

export interface Props {
  appId: number;
  deleted?: boolean;
  logs: LotteryLogsFormatted;
  isLoading: boolean;
  onRefreshClick: () => void;
}

export const LotteryLogs = ({
  appId,
  deleted,
  logs,
  isLoading,
  onRefreshClick,
}: Props) => {
  return (
    <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
      <CardHeader
        title={
          <div style={{ display: "flex" }}>
            <Typography variant="h5" color="text.primary">
              Logs
            </Typography>
          </div>
        }
        action={
          <Box
            display="flex"
            alignItems="center"
            justifyContent={"center"}
            flexDirection={"column"}
          >
            <IconButton
              size="small"
              aria-label="comment"
              onClick={onRefreshClick}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent sx={{ padding: 0 }}>
        <Typography variant="body1" sx={{ m: 2 }}>
          You can view historical logs emmited by the lottery application here.
          If you wish to verify an event you can copy the txid. Alternatively
          you can click the event and view the transaction on an explorer.
        </Typography>
        <Divider />
        <Box
          sx={{
            mt: 1,
            //  borderRadius: 2,
            height: 400,

            // bgcolor: "background.paper",
          }}
        >
          {isLoading || logs.events?.length!! < 0 ? (
            <Skeleton
              variant="rectangular"
              height={400}
              width={"100%"}
              //sx={{ borderRadius: 2 }}
            />
          ) : (
            <VariableSizeList
              height={400}
              width="100%"
              itemSize={(index) => {
                return 50;
              }}
              itemCount={logs.events?.length!!}
              overscanCount={10}
              itemData={logs.events}
            >
              {renderRow}
            </VariableSizeList>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
