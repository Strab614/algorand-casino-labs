import {
  Card,
  CardHeader,
  Typography,
  Box,
  Divider,
  CardContent,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CelebrationIcon from "@mui/icons-material/Celebration";

import { LotteryWinner } from "../utils";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { copyTextToClipboard, ellipseAddress } from "../../../utils/utils";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function renderRow(props: ListChildComponentProps) {
  const { index, style, data } = props;

  const winners: LotteryWinner = data[index];

  return (
    <ListItem
      style={style}
      key={index}
      secondaryAction={
        <>
          <IconButton
            size="small"
            aria-label="comment"
            onClick={() => {
              copyTextToClipboard(winners.address);
              alert("winner address has been copied to clipboard");
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <ListItemAvatar sx={{ mr: -3 }}>
        <CelebrationIcon color="primary" fontSize="small" />
      </ListItemAvatar>
      <ListItemText
        color="purple"
        primary="Winner"
        primaryTypographyProps={{
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: "bold",

          letterSpacing: 0,
        }}
        secondary={ellipseAddress(winners.address) + " won " + winners.amount}
        secondaryTypographyProps={{
          fontFamily: "monospace",
          fontSize: 14,

          letterSpacing: 0,
        }}
      />
    </ListItem>
  );
}
export interface Props {
  winners: LotteryWinner[];
}

export const LotteryWinners = ({ winners }: Props) => {
  return (
    <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
      <CardHeader
        title={
          <div style={{ display: "flex" }}>
            <Typography variant="h5" color="text.primary">
              Winners
            </Typography>
          </div>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent sx={{ padding: 0 }}>
        <Typography variant="body1" sx={{ m: 2 }}>
          The winners of this lottery can be viewed below for your convenience.
        </Typography>
        <Divider />
        <Box
          component="div"
          sx={{
            mt: 1,
            height: 200,
          }}
        >
          {winners.length <= 0 ? (
            <Typography variant="body1" sx={{ m: 2 }}>
              Unfortunately there were no winners this round.
            </Typography>
          ) : (
            <VariableSizeList
              height={200}
              width="100%"
              itemSize={() => {
                return 50;
              }}
              itemCount={winners.length}
              overscanCount={10}
              itemData={winners}
            >
              {renderRow}
            </VariableSizeList>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
