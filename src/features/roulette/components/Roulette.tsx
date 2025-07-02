import { Header } from "@/app/Header";
import { useAppDispatch } from "@/app/hooks";
import { setIsSignTxnOpen } from "@/features/appSlice";
import {
  getRouletteGlobalState,
  createRouletteGame,
  completeRouletteGame,
  getRouletteGameByAddress,
  cancelRouletteGame,
} from "@/features/roulette/api/roulette";
import { RouletteManager } from "@/features/roulette/components/RouletteManager";

import { RouletteBet, RouletteGameCompleted } from "@/features/roulette/types";

import { Container, Typography, Box, Stack, Alert } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";
import { AppOverview } from "./AppOverview";

import AmericanRouletteTable from "./AmericanRouletteTable";
import { useEffect, useState } from "react";

import Pusher from "pusher-js";
import { RouletteWheel } from "./RouletteWheel";
import { useNotification } from "@/hooks/useNotification";
import { formattedAssetAmount } from "@/utils/utils";
import Footer from "@/app/Footer";

const spinSound = new Audio("/audio/roulette/spin.wav");
const stopSound = new Audio("/audio/roulette/stop.wav");
const winSound = new Audio("/audio/roulette/win.wav");
const loseSound = new Audio("/audio/roulette/lose.wav");

const rouletteAppId = BigInt(import.meta.env.VITE_ROULETTE_APP_ID);

const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

export const Roulette = () => {
  const notification = useNotification();
  // const lastKnownRound = useAppSelector(selectLastKnownRound);
  const dispatch = useAppDispatch();
  const { activeAddress, transactionSigner } = useWalletAdapter();

  // waiting for notification of game completion event
  const [isWaitingForEvent, setIsWaitingForEvent] = useState(false);
  // the completion event data
  const [gameCompleted, setGameCompleted] =
    useState<RouletteGameCompleted | null>(null);

  const { isLoading, isError, isSuccess, error, data } = useQuery({
    queryKey: ["roulette", "globalState", Number(rouletteAppId)],
    queryFn: () => getRouletteGlobalState(rouletteAppId),
  });

  const gameQuery = useQuery({
    queryKey: ["roulette", "game", activeAddress],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryFn: () => getRouletteGameByAddress(rouletteAppId, activeAddress),
    enabled: !!activeAddress,
  });

  useEffect(() => {
    if (gameQuery.data) {
      // if we have a game, we are waiting for event
      setIsWaitingForEvent(true);

      // below doesn't work, use needs to interact with the app first
      // set time to start
      spinSound.currentTime = 0;
      // loop sound
      spinSound.loop = true;
      // play sound
      spinSound.play();
    }
    // reset spin sound
  }, [gameQuery.data]);

  // mutations
  const createGame = useMutation({
    mutationFn: (bets: RouletteBet[]) => {
      if (!activeAddress) throw new Error("Active address is required");

      return createRouletteGame(
        rouletteAppId,
        activeAddress,
        transactionSigner,
        bets
      );
    },
    onMutate: () => {
      // show loading
      dispatch(setIsSignTxnOpen(true));

      // clear game completion event data
      setGameCompleted(null);
    },
    onSuccess: () => {
      // notification.display({
      //   type: "success",
      //   message: "Game created!",
      // });
      setIsWaitingForEvent(true);

      // set time to start
      spinSound.currentTime = 0;
      // loop sound
      spinSound.loop = true;
      // play sound
      spinSound.play();
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: "Error creating game " + error,
      });
    },
    onSettled: () => {
      // hide loading
      dispatch(setIsSignTxnOpen(false));
      // reset mutation
      createGame.reset();
      // refetch game
      gameQuery.refetch();
    },
  });

  const completeGame = useMutation({
    mutationFn: () => {
      if (!activeAddress) throw new Error("Active address is required");

      return completeRouletteGame(
        rouletteAppId,
        activeAddress,
        transactionSigner
      );
    },
    onMutate: () => {
      // show loading
      dispatch(setIsSignTxnOpen(true));
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Game completed!",
      });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: "Error completing game " + error,
      });
    },
    onSettled: () => {
      // hide loading
      dispatch(setIsSignTxnOpen(false));
      // reset mutation
      completeGame.reset();
      // refetch game
      gameQuery.refetch();
    },
  });

  const cancelGame = useMutation({
    mutationFn: () => {
      if (!activeAddress) throw new Error("Active address is required");

      return cancelRouletteGame(
        rouletteAppId,
        activeAddress,
        transactionSigner
      );
    },
    onMutate: () => {
      // show loading
      dispatch(setIsSignTxnOpen(true));
    },
    onSuccess: () => {
      notification.display({
        type: "success",
        message: "Game cancelled!",
      });
    },
    onError: (error) => {
      notification.display({
        type: "error",
        message: "Error cancelling game " + error,
      });
    },
    onSettled: () => {
      // hide loading
      dispatch(setIsSignTxnOpen(false));
      // reset mutation
      cancelGame.reset();
      // refetch game
      gameQuery.refetch();
    },
  });

  // for pusher
  useEffect(() => {
    // create channel
    const channel = pusher.subscribe("roulette");

    // bind to event
    channel.bind("game-completed", async (r: RouletteGameCompleted) => {
      console.log("game-completed: ", r);

      if (r.address === activeAddress) {
        // stop spin sound
        spinSound.pause();

        // play stop sound
        await stopSound.play();

        stopSound.onended = () => {
          // play sound dependent on outcome
          if (r.profitAmount <= 0) {
            loseSound.play();
          } else {
            winSound.play();
          }
        };

        setIsWaitingForEvent(false);
        setGameCompleted(r);

        // refetch game from server, will return 404.. should reset state instead
        await gameQuery.refetch();
      }
    });

    return () => {
      // unsubscribe from channel
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (isError) {
    return (
      <Typography>
        Error fetching roulette global state: {error.message}
      </Typography>
    );
  }

  return (
    <>
      <Container
        sx={{
          py: 2,
          height: "100%",
          backgroundImage: "url(images/roulette/background.jpg);",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Header
          title="Roulette"
          whatIsThisContent={
            <Typography>
              The American roulette wheel has 38 divisions with numbers from 1
              to 36, single zero and double zero. The objective of the game is
              to correctly guess the outcome of the roulette spin (the right
              number or the right group).
            </Typography>
          }
        />

        {isSuccess && (
          <Stack spacing={2} justifyContent={"center"} alignItems="center">
            <AppOverview appId={rouletteAppId} globalState={data} />
            {/* <RouletteLogs appId={rouletteAppId} /> */}
            {/* are we the manager? */}
            {data.manager === activeAddress && (
              <RouletteManager
                appId={rouletteAppId}
                activeAddress={activeAddress}
                transactionSigner={transactionSigner}
              />
            )}

            <Box
              component={"div"}
              sx={{
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <Alert
                sx={{
                  width: "100%",
                  backgroundColor: "#4158D0",
                  opacity: 0.8,
                  backgroundImage:
                    "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                }}
                variant="outlined"
                icon={false}
                severity="warning"
                //sx={{ display: !init || !result ? "none" : "block" }}
              >
                {gameCompleted ? (
                  <Typography>
                    Landed on {gameCompleted.winningNumber}!{" "}
                    {gameCompleted.profitAmount > 0 ? (
                      <>
                        You won{" "}
                        {formattedAssetAmount(
                          Number(data.betAsset),
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
                      <Typography>Waiting for bets...</Typography>
                    )}
                  </>
                )}
              </Alert>
            </Box>

            <RouletteWheel
              startSpinning={isWaitingForEvent}
              winningNumber={gameCompleted?.winningNumber}
            />

            <AmericanRouletteTable
              readOnly={isWaitingForEvent || !activeAddress}
              existingBets={gameQuery.data?.bets}
              onPlay={(bets: RouletteBet[]) => createGame.mutate(bets)}
            />

            {/* {gameQuery.data && isWaitingForEvent && (
              <Box component={"div"}>
                {BigInt(lastKnownRound) >
                gameQuery.data.revealRound + BigInt(1512) ? (
                  <Button
                    sx={{ marginTop: 1 }}
                    disabled={
                      gameQuery.data.revealRound > BigInt(lastKnownRound)
                    }
                    variant="contained"
                    onClick={() => cancelGame.mutate()}
                  >
                    Cancel Game
                  </Button>
                ) : (
                  <Button
                    sx={{ marginTop: 1 }}
                    disabled={
                      lastKnownRound < gameQuery.data.revealRound + BigInt(8)
                    }
                    variant="contained"
                    onClick={() => completeGame.mutate()}
                  >
                    Complete Game
                  </Button>
                )}
              </Box>
            )} */}
          </Stack>
        )}
      </Container>
      <Footer />
    </>
  );
};