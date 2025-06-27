import { useNavigate } from "react-router-dom";

import {
  Card,
  CardActionArea,
  CardHeader,
  Link,
  Box,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AsaIcon from "../../../components/AsaIcon";
import { LotteryNumbers } from "../types";
import { blockTimeAgo, formattedAssetAmount } from "../../../utils/utils";
import { pulse } from "@/styles";

export interface Props {
  appId: number;
  assetId: number;
  name: string;
  currentRound: number;
  drawRound: number;
  endRound: number;
  winningNumbers?: LotteryNumbers;
  ticketPrice: number;
  prizePool: number;
}

export const LotteryListCard = ({
  appId,
  assetId,
  name,
  currentRound,
  drawRound,
  endRound,
  winningNumbers,
  ticketPrice,
  prizePool,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
      <CardActionArea onClick={() => navigate(`/lottery/${appId}`)}>
        <CardHeader
          avatar={<AsaIcon asaId={assetId} />}
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

        <CardContent>
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
              {formattedAssetAmount(assetId, ticketPrice)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={assetId} />
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
              Prize Pool
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {formattedAssetAmount(assetId, prizePool)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={assetId} />
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
