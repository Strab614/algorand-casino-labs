import {
  Card,
  CardHeader,
  Box,
  Divider,
  CardContent,
  Typography,
  Link,
  Grid,
} from "@mui/material";

import AsaIcon from "../../../components/AsaIcon";
import { ellipseAddress, formattedAssetAmount } from "../../../utils/utils";
import { pulse } from "@/styles";
import CircleIcon from "@mui/icons-material/Circle";
import { LotteryNumbers } from "../types";
import { UserTickets } from "./UserTickets";
import { WinningNumbers } from "./WinningNumbers";

export interface Props {
  appId: number;
  manager: string;
  ticketsSold: number;
  ticketPrice: number;
  finalPrizePool: number;
  totalFees: number;
  winningNumbers: LotteryNumbers;
  userTickets?: LotteryNumbers[];
}
export const DeletedLotteryCard = ({
  appId,
  manager,
  ticketsSold,
  ticketPrice,
  finalPrizePool,
  totalFees,
  winningNumbers,
  userTickets,
}: Props) => {
  return (
    <>
      <Grid
        container
        columnSpacing={1}
        rowSpacing={1}
        direction={"row-reverse"}
      >
        <Grid item xs={12} md={6}>
          <WinningNumbers winningNumbers={winningNumbers} />
        </Grid>

        {userTickets && (
          <Grid item xs={12} md={6}>
            <UserTickets
              userEntry={userTickets}
              winningNumbers={winningNumbers}
            />
          </Grid>
        )}
      </Grid>

      <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
        <CardHeader
          avatar={<AsaIcon asaId={388592191} />}
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
                color="info"
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
              {formattedAssetAmount(388592191, ticketPrice)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={388592191} />
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
              {formattedAssetAmount(388592191, finalPrizePool)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={388592191} />
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
              Fees
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ display: "flex" }}
            >
              {formattedAssetAmount(388592191, totalFees)}
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 1,
                }}
              >
                <AsaIcon asaId={388592191} />
              </Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
