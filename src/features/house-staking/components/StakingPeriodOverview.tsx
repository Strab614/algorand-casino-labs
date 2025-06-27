import React, { useMemo } from "react";
import {
  Typography,
  Box,
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from "@mui/material";
import { StakingPeriod } from "../types";

export interface Props {
  item: StakingPeriod;
}

const steps = ["Registration Period", "Commitment Period", "Rewards/Cooldown"];

export const StakingPeriodOverview = ({ item }: Props) => {
  const step = useMemo(() => {
    const now = new Date();

    if (
      now > new Date(item.registrationBegin) &&
      now < new Date(item.registrationEnd)
    ) {
      // within registration period
      return 0;
    } else if (
      now > new Date(item.commitmentBegin) &&
      now < new Date(item.commitmentEnd)
    ) {
      // within commitment period
      return 1;
    } else if (now > new Date(item.commitmentEnd)) {
      // after commitmend period
      return 2;
    }

    return -1;
  }, [item]);

  return (
    <>
      <Typography variant="h6">Period Timeline</Typography>
      <Typography variant="subtitle1" color="text.secondary">
        LP Chip Equivalent Ratio: {item.chipRatio}
      </Typography>

      <Box component="div" sx={{ width: "100%" }}>
        <Stepper activeStep={step} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label} expanded={true}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {index === 0 ? (
                  <Typography>
                    {new Date(item.registrationBegin).toUTCString()} -{" "}
                    {new Date(item.registrationEnd).toUTCString()}
                  </Typography>
                ) : index === 1 ? (
                  <Typography>
                    {new Date(item.commitmentBegin).toUTCString()} -{" "}
                    {new Date(item.commitmentEnd).toUTCString()}
                  </Typography>
                ) : (
                  <Typography>
                    {new Date(item.commitmentEnd).toUTCString()}
                  </Typography>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </>
  );
};
