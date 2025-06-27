import {
  Card,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Divider,
  CardContent,
  Skeleton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { copyTextToClipboard, ellipseAddress } from "../../../utils/utils";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CelebrationIcon from "@mui/icons-material/Celebration";
import MovingIcon from "@mui/icons-material/Moving";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import { CoinFlipGameEvent, CoinFlipLogsFormatted } from "../types";

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;

  const item: CoinFlipGameEvent = data[index];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { address, wager, commitmentRound, heads } = item.data as {
    address: string;
    wager: number;
    commitmentRound: number;
    heads: number;
  };

  const getIcon = () => {
    switch (item.type) {
      case "Create":
        return <CelebrationIcon color="primary" fontSize="small" />;
      case "AddPrizePool":
        return <MovingIcon color="primary" fontSize="small" />;
      case "CreateGame":
        return <ShoppingBagIcon color="primary" fontSize="small" />;
      case "CancelGame":
        return <KeyboardReturnIcon color="primary" fontSize="small" />;
      case "CompleteGame":
        return <CelebrationIcon color="primary" fontSize="small" />;
      //  case "Delete":
      //   return <DeleteForeverIcon color="primary" fontSize="small" />;
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
          item.type === "CreateGame"
            ? `${ellipseAddress(address)} ${wager / 1000000} ${commitmentRound}`
            : item.data.toString()
        }
        secondaryTypographyProps={{
          fontFamily: "monospace",
          fontSize: 14,

          letterSpacing: 0,
        }}
        onClick={() =>
          item.type === "CompleteGame" && alert(JSON.stringify(item.data))
        }
      />
    </ListItem>
  );
}
export interface Props {
  logs: CoinFlipLogsFormatted;
  isLoading: boolean;
  onRefreshClick: () => void;
}

export const CoinFlipLogs = ({ logs, isLoading, onRefreshClick }: Props) => {
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
          You can view historical logs emmited by the coin flip application
          here. If you wish to verify an event you can copy the txid.
          Alternatively you can click the event and view the transaction on an
          explorer.
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
