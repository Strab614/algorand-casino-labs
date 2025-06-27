import {
  Card,
  CardActionArea,
  CardHeader,
  Box,
  CardContent,
  Typography,
  Link,
  Divider,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AsaIcon from "../../../components/AsaIcon";
import { ellipseAddress } from "../../../utils/utils";
import { pulse } from "@/styles";
import { blockTimeAgo } from "../../../utils/utils";
import { useNavigate } from "react-router-dom";

export interface Props {
  appId: number;
  creator: string;
  currentRound: number;
  createdAt: number;
  deletedAt: number;
}

export const DeletedListCard = ({
  appId,
  creator,
  currentRound,
  createdAt,
  deletedAt,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ minWidth: { xs: "340px" }, width: "100%" }} elevation={1}>
      <CardActionArea onClick={() => navigate(`/lottery/${appId}`)}>
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
        <CardContent>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            paddingY={1}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Manager
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {ellipseAddress(creator)}
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
              Created At
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {createdAt} ({blockTimeAgo(currentRound, createdAt)})
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
              Deleted At
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {deletedAt} ({blockTimeAgo(currentRound, deletedAt)})
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
