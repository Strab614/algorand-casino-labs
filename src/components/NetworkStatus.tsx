import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/app/hooks';
import {
  selectNetworkHealth,
  selectPerformanceMetrics,
  selectIsConnected,
  selectNetwork,
} from '@/features/appSlice';
import { useNetworkStatus, usePerformanceMetrics } from '@/hooks/useAlgorand';

export const NetworkStatus: React.FC = () => {
  const theme = useTheme();
  const network = useAppSelector(selectNetwork);
  const isConnected = useAppSelector(selectIsConnected);
  const networkHealth = useAppSelector(selectNetworkHealth);
  const performanceMetrics = useAppSelector(selectPerformanceMetrics);
  
  const { isLoading: statusLoading } = useNetworkStatus();
  const { isLoading: metricsLoading } = usePerformanceMetrics();

  const getStatusColor = () => {
    if (!isConnected) return theme.palette.error.main;
    if (networkHealth.algod && networkHealth.indexer) return theme.palette.success.main;
    return theme.palette.warning.main;
  };

  const getStatusIcon = () => {
    if (statusLoading || metricsLoading) {
      return <CircularProgress size={16} />;
    }
    if (!isConnected) return <ErrorIcon fontSize="small" />;
    if (networkHealth.algod && networkHealth.indexer) {
      return <CheckCircleIcon fontSize="small" />;
    }
    return <WarningIcon fontSize="small" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (networkHealth.algod && networkHealth.indexer) return 'Connected';
    return 'Partial Connection';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${getStatusColor()}`,
      }}
    >
      <Tooltip
        title={
          <Box>
            <Typography variant="body2">Network: {network.toUpperCase()}</Typography>
            <Typography variant="body2">
              Algod: {networkHealth.algod ? 'Connected' : 'Disconnected'}
            </Typography>
            <Typography variant="body2">
              Indexer: {networkHealth.indexer ? 'Connected' : 'Disconnected'}
            </Typography>
            {performanceMetrics.lastUpdated > 0 && (
              <>
                <Typography variant="body2">
                  Avg Block Time: {performanceMetrics.avgBlockTime}s
                </Typography>
                <Typography variant="body2">
                  TPS: {performanceMetrics.tps}
                </Typography>
              </>
            )}
          </Box>
        }
      >
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          size="small"
          sx={{
            color: getStatusColor(),
            borderColor: getStatusColor(),
          }}
          variant="outlined"
        />
      </Tooltip>
      
      <Typography variant="caption" color="text.secondary">
        {network.toUpperCase()}
      </Typography>
    </Box>
  );
};

export default NetworkStatus;