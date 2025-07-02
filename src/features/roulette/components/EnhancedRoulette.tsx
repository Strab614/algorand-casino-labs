import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useWallet } from '@txnlab/use-wallet-react';
import { Header } from '@/app/Header';
import Footer from '@/app/Footer';
import { AppOverview } from './AppOverview';
import AmericanRouletteTable from './AmericanRouletteTable';
import RouletteWheel from './RouletteWheel';
import RouletteStats from './RouletteStats';
import RouletteGameHistory from './RouletteGameHistory';
import { RouletteManager } from './RouletteManager';
import { RouletteBet, RouletteGameCompleted } from '../types';
import { formattedAssetAmount } from '@/utils/utils';
import { casinoWebSocketClient } from '@/api/casino/websocket';
import { useNotification } from '@/hooks/useNotification';
import {
  useRouletteGlobalState,
  useRouletteGame,
  useCreateRouletteGame,
  useCompleteRouletteGame,
  useCancelRouletteGame,
} from '@/hooks/useRoulette';

// Sound effects
const spinSound = new Audio('/audio/roulette/spin.wav');
const stopSound = new Audio('/audio/roulette/stop.wav');
const winSound = new Audio('/audio/roulette/win.wav');
const loseSound = new Audio('/audio/roulette/lose.wav');

const rouletteAppId = BigInt(import.meta.env.VITE_ROULETTE_APP_ID || '0');

export const EnhancedRoulette: React.FC = () => {
  const notification = useNotification();
  const { activeAddress } = useWallet();

  // State for game flow
  const [isWaitingForEvent, setIsWaitingForEvent] = useState(false);
  const [gameCompleted, setGameCompleted] = useState<RouletteGameCompleted | null>(null);

  // Queries
  const { data: globalState, isLoading, isError, error } = useRouletteGlobalState(rouletteAppId);
  const gameQuery = useRouletteGame(rouletteAppId, activeAddress);

  // Mutations
  const createGame = useCreateRouletteGame(rouletteAppId);
  const completeGame = useCompleteRouletteGame(rouletteAppId);
  const cancelGame = useCancelRouletteGame(rouletteAppId);

  // Handle game in progress
  useEffect(() => {
    if (gameQuery.data) {
      setIsWaitingForEvent(true);
      
      // Start spin sound
      spinSound.currentTime = 0;
      spinSound.loop = true;
      spinSound.play().catch(() => {
        // Handle autoplay restrictions
        console.log('Audio autoplay prevented');
      });
    }
  }, [gameQuery.data]);

  // WebSocket event handling
  useEffect(() => {
    const unsubscribe = casinoWebSocketClient.subscribeToRouletteEvents(
      async (result: RouletteGameCompleted) => {
        if (result.address === activeAddress) {
          // Stop spin sound
          spinSound.pause();

          // Play stop sound
          await stopSound.play().catch(() => {});

          stopSound.onended = () => {
            // Play win/lose sound
            if (result.profitAmount <= 0) {
              loseSound.play().catch(() => {});
            } else {
              winSound.play().catch(() => {});
            }
          };

          setIsWaitingForEvent(false);
          setGameCompleted(result);

          // Refetch game data
          await gameQuery.refetch();
        }
      }
    );

    return unsubscribe;
  }, [activeAddress, gameQuery]);

  const handlePlayGame = async (bets: RouletteBet[]) => {
    try {
      setGameCompleted(null);
      await createGame.mutateAsync(bets);
      setIsWaitingForEvent(true);

      // Start spin sound
      spinSound.currentTime = 0;
      spinSound.loop = true;
      spinSound.play().catch(() => {});
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 2 }}>
        <Typography>Loading roulette...</Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 2 }}>
        <Alert severity="error">
          Error loading roulette: {error?.message}
        </Alert>
      </Container>
    );
  }

  if (!globalState) {
    return (
      <Container sx={{ py: 2 }}>
        <Alert severity="warning">
          Roulette application not found
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container
        sx={{
          py: 2,
          minHeight: '100vh',
          backgroundImage: 'url(/images/roulette/background.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Header
          title="Enhanced Roulette"
          whatIsThisContent={
            <Typography>
              Experience the thrill of American roulette with 38 divisions (1-36, 0, 00).
              Place your bets on numbers, colors, or groups and watch the wheel spin!
              All games are provably fair using Algorand's randomness beacon.
            </Typography>
          }
        />

        <Stack spacing={3} alignItems="center">
          {/* App Overview */}
          <AppOverview appId={rouletteAppId} globalState={globalState} />

          {/* Manager Controls */}
          {globalState.manager === activeAddress && (
            <RouletteManager
              appId={rouletteAppId}
              activeAddress={activeAddress}
              transactionSigner={() => Promise.resolve([])} // This should be properly implemented
            />
          )}

          {/* Game Status Alert */}
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            <Alert
              sx={{
                backgroundColor: '#4158D0',
                opacity: 0.9,
                backgroundImage:
                  'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
              }}
              variant="outlined"
              icon={false}
              severity="info"
            >
              {gameCompleted ? (
                <Typography>
                  Landed on {gameCompleted.winningNumber === 37 ? '00' : gameCompleted.winningNumber}!{' '}
                  {gameCompleted.profitAmount > 0 ? (
                    <>
                      You won{' '}
                      {formattedAssetAmount(
                        Number(globalState.betAsset),
                        gameCompleted.profitAmount
                      )}
                    </>
                  ) : (
                    <>You lost</>
                  )}
                </Typography>
              ) : (
                <>
                  {gameQuery.data && isWaitingForEvent ? (
                    <Typography>Spinning...</Typography>
                  ) : (
                    <Typography>Place your bets!</Typography>
                  )}
                </>
              )}
            </Alert>
          </Box>

          {/* Roulette Wheel */}
          <RouletteWheel
            startSpinning={isWaitingForEvent}
            winningNumber={gameCompleted?.winningNumber}
          />

          {/* Betting Table */}
          <AmericanRouletteTable
            readOnly={isWaitingForEvent || !activeAddress}
            existingBets={gameQuery.data?.bets}
            onPlay={handlePlayGame}
          />

          {/* Game Controls */}
          {gameQuery.data && isWaitingForEvent && (
            <Box>
              <Button
                variant="outlined"
                onClick={() => completeGame.mutate()}
                disabled={completeGame.isPending}
                sx={{ mr: 1 }}
              >
                Complete Game
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => cancelGame.mutate()}
                disabled={cancelGame.isPending}
              >
                Cancel Game
              </Button>
            </Box>
          )}

          {/* Statistics and History */}
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid item xs={12} md={6}>
              <RouletteStats appId={rouletteAppId} assetId={Number(globalState.betAsset)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RouletteGameHistory appId={rouletteAppId} assetId={Number(globalState.betAsset)} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default EnhancedRoulette;