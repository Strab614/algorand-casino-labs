import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useMockWalletContext } from './MockWalletProvider';
import { ellipseAddress } from '@/utils/utils';

export const MockWalletButton: React.FC = () => {
  const { activeAddress, isConnected, connect, disconnect } = useMockWalletContext();

  if (isConnected && activeAddress) {
    return (
      <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Mock Mode
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={disconnect}
          size="small"
        >
          {ellipseAddress(activeAddress)}
        </Button>
      </Box>
    );
  }

  return (
    <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Mock Mode
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={connect}
        size="small"
      >
        Connect Mock
      </Button>
    </Box>
  );
};