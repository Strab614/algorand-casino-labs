import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import {
  Casino,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useRouletteLogs } from '@/hooks/useRoulette';
import { formattedAssetAmount, ellipseAddress, blockTimeAgo } from '@/utils/utils';
import { useAppSelector } from '@/app/hooks';
import { selectLastKnownRound } from '@/features/appSlice';

interface RouletteGameHistoryProps {
  appId: bigint;
  assetId: number;
  maxItems?: number;
}

export const RouletteGameHistory: React.FC<RouletteGameHistoryProps> = ({ 
  appId, 
  assetId, 
  maxItems = 10 
}) => {
  const { data: logs, isLoading } = useRouletteLogs(appId);
  const lastKnownRound = useAppSelector(selectLastKnownRound);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Recent Games" />
        <CardContent>
          <Typography>Loading game history...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Games" />
        <CardContent>
          <Typography>No games played yet</Typography>
        </CardContent>
      </Card>
    );
  }

  const recentGames = logs.slice(0, maxItems);

  const getNumberColor = (num: number): string => {
    if (num === 0 || num === 37) return 'green'; // 0 and 00
    const redNumbers = new Set([
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ]);
    return redNumbers.has(num) ? 'red' : 'black';
  };

  const getWinningNumberDisplay = (num: number): string => {
    return num === 37 ? '00' : num.toString();
  };

  return (
    <Card>
      <CardHeader 
        title="Recent Games"
        subheader={`Last ${recentGames.length} completed games`}
      />
      <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List>
          {recentGames.map((game, index) => (
            <React.Fragment key={`${game.round}-${game.address}`}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Casino />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {ellipseAddress(game.address)}
                      </Typography>
                      <Chip
                        label={getWinningNumberDisplay(game.winningNumber)}
                        size="small"
                        sx={{
                          bgcolor: getNumberColor(game.winningNumber),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bet: {formattedAssetAmount(assetId, game.totalBetAmount)}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        {game.profitAmount > 0 ? (
                          <>
                            <TrendingUp color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              Won {formattedAssetAmount(assetId, game.profitAmount)}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <TrendingDown color="error" fontSize="small" />
                            <Typography variant="body2" color="error.main">
                              Lost
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {blockTimeAgo(lastKnownRound, Number(game.round))}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < recentGames.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RouletteGameHistory;