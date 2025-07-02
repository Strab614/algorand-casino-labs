import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Casino,
  AttachMoney,
  ShowChart,
} from '@mui/icons-material';
import { useRouletteMetrics } from '@/hooks/useRoulette';
import { formattedAssetAmount } from '@/utils/utils';

interface RouletteStatsProps {
  appId: bigint;
  assetId: number;
}

export const RouletteStats: React.FC<RouletteStatsProps> = ({ appId, assetId }) => {
  const { data: metrics, isLoading } = useRouletteMetrics(appId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Roulette Statistics" />
        <CardContent>
          <Typography>Loading statistics...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader title="Roulette Statistics" />
        <CardContent>
          <Typography>No statistics available</Typography>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary' 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon}
          <Typography variant="h6" color={`${color}.main`}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader 
        title="Roulette Statistics"
        subheader="Performance metrics and game analytics"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Games"
              value={metrics.totalGames.toLocaleString()}
              icon={<Casino color="primary" />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Volume"
              value={formattedAssetAmount(assetId, metrics.totalVolume)}
              icon={<TrendingUp color="secondary" />}
              color="secondary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Winnings"
              value={formattedAssetAmount(assetId, metrics.totalWinnings)}
              icon={<AttachMoney color="success" />}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Bet"
              value={formattedAssetAmount(assetId, Math.round(metrics.averageBet))}
              icon={<ShowChart color="warning" />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">House Edge</Typography>
          <Chip
            label={`${metrics.houseEdge.toFixed(2)}%`}
            color={metrics.houseEdge > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            House edge represents the mathematical advantage the casino has over players.
            A positive house edge indicates the casino is profitable.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RouletteStats;