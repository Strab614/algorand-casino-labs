import React from "react";
import {
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { StakingPeriod } from "../types";

export interface Props {
  stakingPeriods: StakingPeriod[] | undefined;
  stakingPeriodIndex: number;
  onStakingPeriodSelected: (index: number) => void;
}

export const StakingPeriodSelect = ({
  stakingPeriods,
  stakingPeriodIndex,
  onStakingPeriodSelected,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => {
    onStakingPeriodSelected(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <>
        <FormControl fullWidth>
          <InputLabel id="staking-period-label">Staking Period</InputLabel>
          <Select
            labelId="staking-period-label"
            id="staking-period-select"
            value={stakingPeriodIndex.toString()}
            label="Staking Period"
            onChange={handleChange}
          >
            {stakingPeriods?.map((el, index) => (
              <MenuItem value={index} key={index}>
                Staking Period #{el.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </>
    </div>
  );
};
