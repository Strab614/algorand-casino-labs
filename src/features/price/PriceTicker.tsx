import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useEffect } from "react";

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import AsaIcon from "../../components/AsaIcon";
import {
  selectAlgoPrice,
  //selectChipPrice,
  updatePriceAsync,
  selectIsLoading,
} from "../price/priceSlice";

const PriceTicker = () => {
  const algoPrice = useAppSelector(selectAlgoPrice);
  //const chipPrice = useAppSelector(selectChipPrice);
  const isLoading = useAppSelector(selectIsLoading);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updatePriceAsync(0));
  }, [dispatch]);

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        maxWidth: "80px",
        borderColor: "gainsboro",
        borderWidth: 1,
        borderRadius: 8,
        padding: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          paddingRight: 2,
        }}
      >
        <AsaIcon asaId={0} size={16} />
      </div>
      {isLoading ? (
        <CircularProgress size="16px" />
      ) : (
        <Typography>${algoPrice.toFixed(4)}</Typography>
      )}
    </Box>
  );
};

export default PriceTicker;
