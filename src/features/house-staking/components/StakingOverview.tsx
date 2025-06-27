import {
  Stack,
  Box,
  Typography,
  Paper,
  CardContent,
  Divider,
} from "@mui/material";
import AsaIcon from "@/components/AsaIcon";

export interface Props {
  totalStakers: number;
  eligibleStakers: number;
  totalStakedChips: number;
  totalStakedLiquidityTokens: number;
  totalStakedLiquidityTokensV2: number;
  totalCAlgoLiquidityTokens: number;
  totalTAlgoLiquidityTokens: number;
  totalMAlgoLiquidityTokens: number;
  totalXAlgoLiquidityTokens: number;
  totalEquivalent?: number;
}

export const StakingOverview = (props: Props) => {
  return (
    <Box
      component="div"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper sx={{ backgroundColor: "secondary.dark", flex: 1 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              Stakers
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {props.eligibleStakers}/{props.totalStakers}
            </Typography>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              Chips
            </Typography>
            <div>
              <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                <Typography variant="body2" color="text.primary" fontSize={16}>
                  {(props.totalStakedChips / 10).toLocaleString()}{" "}
                </Typography>
                <AsaIcon asaId={388592191} size={24} />
              </div>
            </div>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              Tinyman V1
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalStakedLiquidityTokens / 1000000).toLocaleString()} LP
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              Tinyman V2
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalStakedLiquidityTokensV2 / 1000000).toLocaleString()}{" "}
              LP
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              cALGO/chip
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalCAlgoLiquidityTokens / 1000000).toLocaleString()} LP
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              tALGO/chip
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalTAlgoLiquidityTokens / 1000000).toLocaleString()} LP
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              mALGO/chip
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalMAlgoLiquidityTokens / 1000000).toLocaleString()} LP
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary" fontSize={18}>
              xALGO/chip
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={16}>
              {(props.totalXAlgoLiquidityTokens / 1000000).toLocaleString()} LP
            </Typography>
          </Stack>
          {props.totalEquivalent && (
            <Stack direction="row" justifyContent="space-between">
              <Typography
                variant="subtitle2"
                color="text.primary"
                fontSize={18}
              >
                Total
              </Typography>
              <div>
                <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    fontSize={16}
                  >
                    {props.totalEquivalent.toLocaleString()}
                  </Typography>
                  <AsaIcon asaId={388592191} size={24} />
                </div>
              </div>
            </Stack>
          )}
        </CardContent>
      </Paper>
    </Box>
  );
};
