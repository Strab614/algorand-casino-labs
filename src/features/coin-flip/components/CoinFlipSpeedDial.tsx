import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

import InfoIcon from "@mui/icons-material/Info";
import PieChartIcon from "@mui/icons-material/PieChart";
import SettingsIcon from "@mui/icons-material/Settings";

import { Theme, useMediaQuery } from "@mui/material";

export interface Props {
  onInfoClick: () => void;
  onStatsClick: () => void;
  onManageClick?: () => void;
}

export function CoinFlipSpeedDial({
  onInfoClick,
  onStatsClick,
  onManageClick,
}: Props) {
  // will be true if screen bigger than sm
  const matches = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  return (
    <SpeedDial
      ariaLabel="Coin flip speed dial"
      sx={{
        position: "absolute",
        bottom: matches ? 16 : 8 /* if small screen, make it 64 */,
        right: matches ? 16 : 8 /* if small screen, make it 16 */,
      }}
      icon={<SpeedDialIcon />}
    >
      {onManageClick && (
        <SpeedDialAction
          key={"manage"}
          icon={<SettingsIcon />}
          tooltipTitle={"Manage"}
          onClick={onManageClick}
        />
      )}
      <SpeedDialAction
        key={"stats"}
        icon={<PieChartIcon />}
        tooltipTitle={"Stats"}
        onClick={onStatsClick}
      />
      <SpeedDialAction
        key={"info"}
        icon={<InfoIcon />}
        tooltipTitle={"Info"}
        onClick={onInfoClick}
      />
    </SpeedDial>
  );
}
