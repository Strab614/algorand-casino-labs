import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  CardContent,
  Divider,
  Card,
  CardHeader,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { Circle as CircleIcon } from "@mui/icons-material";
import { ellipseAddress } from "../utils/utils";

import {
  DataGrid,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import {
  StakingCommit,
  StakingOverview,
  StakingPeriodOverview,
  StakingResults,
} from "../features/house-staking/components";
import {
  StakingCommitment,
  StakingPeriod,
} from "@/features/house-staking/types";
import { StakingPeriodSelect } from "@/features/house-staking/components/StakingPeriodSelect";
import { useAppDispatch } from "../app/hooks";
import AsaIcon from "../components/AsaIcon";
import { useWallet } from "@txnlab/use-wallet-react";
import { useNotification } from "@/hooks/useNotification";
import { Header } from "@/app/Header";
import { pulse } from "@/styles";

interface HouseStakingCommitmentsProps {
  stakingPeriodId: number;
  stakingCommittments?: StakingCommitment[];
  chipRatio: number;
}

const calculateSinglePercent = (
  totalCombined: number,
  chipRatio: number,
  liquidityCommitment: number,
  liquidityCommitmentV2: number,
  chipCommitment: number
) => {
  const lq =
    ((liquidityCommitment + liquidityCommitmentV2) / 1000000) * chipRatio;
  const combined = lq + chipCommitment / 10;
  return (combined / totalCombined) * 100;
};

const HouseStakingCommitments = ({
  stakingPeriodId,
  stakingCommittments,
  chipRatio,
}: HouseStakingCommitmentsProps) => {
  const columns = [
    //{ field: "id", headerName: "ID", width: 70, flex: 1 },
    {
      field: "eligible",
      headerName: "Status",
      type: "string",
      width: 110,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <CircleIcon
            sx={{
              animation: `${pulse} ${1000}ms ease infinite`,
            }}
            fontSize="small"
            color={params.row.eligible ? "success" : "error"}
          />
        );
      },
    },
    {
      field: "algorandAddress",
      headerName: "Address",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        `${ellipseAddress(params.row.algorandAddress)}`,
    },
    {
      field: "chipCommitment",
      headerName: "Chips",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.chipCommitment / 10,
    },
    {
      field: "liquidityCommitment",
      headerName: "TM V1",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.liquidityCommitment / 1000000,
    },
    {
      field: "liquidityCommitmentV2",
      headerName: "TM V2",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.liquidityCommitmentV2 / 1000000,
    },
    {
      field: "cAlgoCommitment",
      headerName: "cALGO/chip",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.cAlgoCommitment / 1000000,
    },
    {
      field: "tAlgoCommitment",
      headerName: "tALGO/chip",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.tAlgoCommitment / 1000000,
    },
    {
      field: "mAlgoCommitment",
      headerName: "mALGO/chip",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.mAlgoCommitment / 1000000,
    },
    {
      field: "xAlgoCommitment",
      headerName: "xALGO/chip",
      type: "number",
      width: 130,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.xAlgoCommitment / 1000000,
    },
    {
      field: "percent",
      headerName: "Percent",
      type: "number",
      width: 100,
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row.eligible) {
          return calculateSinglePercent(
            getTotalConverted ? getTotalConverted : 0,
            chipRatio,
            params.row.liquidityCommitment,
            params.row.liquidityCommitmentV2,
            params.row.chipCommitment
          );
        } else {
          return 0;
        }
      },
    },
    {
      field: "createdAt",
      headerName: "Registered",
      type: "date",
      width: 270,
    },
    {
      field: "updatedAt",
      headerName: "Not Eligible At",
      type: "date",
      width: 270,
    },
  ];

  const totalStakedChips = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.chipCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedLiquidity = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.liquidityCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedLiquidityV2 = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.liquidityCommitmentV2;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedCAlgoLiquidity = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.cAlgoCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedTAlgoLiquidity = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.tAlgoCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedMAlgoLiquidity = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.mAlgoCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const totalStakedXAlgoLiquidity = useMemo(() => {
    if (stakingCommittments) {
      return stakingCommittments.reduce(function (a, b) {
        if (b.eligible) {
          return a + b.xAlgoCommitment;
        } else {
          return a;
        }
      }, 0);
    }

    return 0;
  }, [stakingCommittments]);

  const eligibleStakers = useMemo(() => {
    if (stakingCommittments) {
      const l = stakingCommittments.filter((el) => el.eligible);

      return l.length;
    } else {
      return 0;
    }
  }, [stakingCommittments]);

  const getTotalConverted = useMemo(() => {
    const doIt = () => {
      const lq =
        ((totalStakedLiquidity +
          totalStakedLiquidityV2 +
          totalStakedCAlgoLiquidity +
          totalStakedTAlgoLiquidity +
          totalStakedMAlgoLiquidity +
          totalStakedXAlgoLiquidity) *
          chipRatio) /
        1000000;

      const totalChip = totalStakedChips / 10 + lq;

      return totalChip;
    };

    if (totalStakedChips && totalStakedLiquidity && chipRatio) return doIt();
  }, [
    totalStakedChips,
    totalStakedLiquidity,
    chipRatio,
    totalStakedLiquidityV2,
    totalStakedCAlgoLiquidity,
    totalStakedTAlgoLiquidity,
    totalStakedMAlgoLiquidity,
    totalStakedXAlgoLiquidity,
  ]);

  if (!stakingCommittments) {
    return (
      <Container
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        House Staking Period #{stakingPeriodId} Commitments
      </Typography>
      <StakingOverview
        totalStakedChips={totalStakedChips}
        totalStakedLiquidityTokens={totalStakedLiquidity}
        totalStakedLiquidityTokensV2={totalStakedLiquidityV2}
        totalCAlgoLiquidityTokens={totalStakedCAlgoLiquidity}
        totalTAlgoLiquidityTokens={totalStakedTAlgoLiquidity}
        totalMAlgoLiquidityTokens={totalStakedMAlgoLiquidity}
        totalXAlgoLiquidityTokens={totalStakedXAlgoLiquidity}
        totalStakers={stakingCommittments.length}
        totalEquivalent={getTotalConverted}
        eligibleStakers={eligibleStakers}
      />
      <DataGrid
        sx={{
          mt: 2,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#272727",
          },
          "& .MuiDataGrid-panelFooter": {
            backgroundColor: "red",
          },
        }}
        autoHeight
        rows={stakingCommittments}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box component="div" sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HouseStaking = () => {
  const dispatch = useAppDispatch();
  const notification = useNotification();
  const { activeAddress } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [stakingPeriods, setStakingPeriods] = useState<
    StakingPeriod[] | undefined
  >();

  const [stakingPeriodIndex, setStakingPeriodIndex] = useState(0);

  const [profit, setProfit] = useState<number>();

  const [stakingCommittments, setStakingCommittments] =
    useState<StakingCommitment[]>();

  // tab stuff
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // tmp hack
  const isRegistrationPeriod = () => {
    if (!stakingPeriods || !stakingPeriods[stakingPeriodIndex]) {
      return false;
    }

    const now = new Date();

    return (
      now > new Date(stakingPeriods[stakingPeriodIndex].registrationBegin) &&
      now < new Date(stakingPeriods[stakingPeriodIndex].registrationEnd)
    );
  };

  useEffect(() => {
    const getStakingPeriods = async () => {
      const response = await fetch(
        "https://api.algo-casino.com/stakingPeriods",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const buf = await response.json();

      if (!response.ok) {
        notification.display({ type: "error", message: buf.message });
        return;
      }

      setStakingPeriods(buf);
      setStakingPeriodIndex(buf.length - 1);
      setIsLoading(false);
    };
    if (!stakingPeriods) {
      getStakingPeriods();
    }
  }, [stakingPeriods, notification]);

  useEffect(() => {
    const getStakingCommittments = async () => {
      if (!stakingPeriods) return;

      const response = await fetch(
        `https://api.algo-casino.com/stakingCommitments?stakingPeriodId=${stakingPeriods[stakingPeriodIndex].id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const buf = await response.json();

      if (!response.ok) {
        notification.display({ type: "error", message: buf.message });
        return;
      }

      setStakingCommittments(buf);
      setIsLoading(false);
    };

    const getProfits = async () => {
      if (!stakingPeriods) return;

      const now = new Date();

      const { commitmentEnd } = stakingPeriods[stakingPeriodIndex];

      if (now > new Date(commitmentEnd)) {
        setProfit(undefined);
        return;
      }

      const response = await fetch(
        `https://api.algo-casino.com/stakingPeriods/${stakingPeriods[stakingPeriodIndex].id}/profit`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const buf = await response.json();

      setProfit(buf.profit);
    };

    getStakingCommittments();
    getProfits();
  }, [stakingPeriods, stakingPeriodIndex, dispatch]);

  // show spinner while getting data
  if (isLoading) {
    return (
      <Container
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ my: 2 }}>
      <Header
        title="House Staking"
        whatIsThisContent={
          <Box component="div">
            <Typography variant="body1" paragraph color="text.primary">
              You can stake chips or LP tokens to become the house and take a
              share of the casino profits. If the house makes a profit, you will
              receive a share relative to your share of the commitment.
            </Typography>

            <Typography variant="body1" paragraph color="text.primary">
              You must choose during the registration period how many LP tokens
              or chips you want to commit. Your chips and LP tokens will never
              leave your wallet.
            </Typography>

            <Typography variant="body1" paragraph color="text.primary">
              You must maintain your chip and LP balance throughout the
              commitment period in order to be eligible for rewards. If your
              balance falls below your committed amount you won't be included in
              the reward distribution.
            </Typography>
          </Box>
        }
      />
      <Stack spacing={2} sx={{ pb: 2 }}>
        <StakingPeriodSelect
          stakingPeriods={stakingPeriods}
          stakingPeriodIndex={stakingPeriodIndex}
          onStakingPeriodSelected={(index: number) => {
            setStakingPeriodIndex(index);
          }}
        />

        {stakingPeriods && stakingPeriods[stakingPeriodIndex] && (
          <Card>
            <CardHeader
              title={
                <div style={{ display: "flex" }}>
                  <Typography variant="h6" color="text.primary">
                    House Staking Period #
                    {stakingPeriods[stakingPeriodIndex].id}
                  </Typography>
                </div>
              }
              sx={{
                backgroundColor: "#272727",
              }}
            />
            <Divider />
            <CardContent>
              <Box component="div" sx={{ width: "100%" }}>
                {profit && (
                  <Typography variant="h6">
                    Estimated profit:{" "}
                    <div style={{ display: "inline-block" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          display="inline"
                          variant="h6"
                          color={profit < 0 ? "red" : "#4caf50"}
                        >
                          {profit.toLocaleString()}
                        </Typography>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: 2,
                          }}
                        >
                          <AsaIcon asaId={388592191} size={24} />
                        </div>
                      </div>
                    </div>
                  </Typography>
                )}

                <Box
                  component="div"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    aria-label="staking tabs"
                  >
                    <Tab label="Overview" />
                    <Tab label="Commit" disabled={!activeAddress} />
                  </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                  <StakingPeriodOverview
                    item={stakingPeriods[stakingPeriodIndex]}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <StakingCommit
                    stakingPeriodId={stakingPeriods[stakingPeriodIndex].id}
                    stakingCommittments={stakingCommittments}
                    showEdit={isRegistrationPeriod()}
                  />
                </TabPanel>
              </Box>
            </CardContent>
          </Card>
        )}

        {stakingPeriods && stakingPeriods[stakingPeriodIndex] && (
          <StakingResults
            stakingPeriodId={stakingPeriods[stakingPeriodIndex].id}
          />
        )}

        {stakingPeriods && stakingPeriods[stakingPeriodIndex] && (
          <HouseStakingCommitments
            stakingCommittments={stakingCommittments}
            stakingPeriodId={stakingPeriods[stakingPeriodIndex].id}
            chipRatio={stakingPeriods[stakingPeriodIndex].chipRatio}
          />
        )}
      </Stack>
    </Container>
  );
};

export default HouseStaking;
