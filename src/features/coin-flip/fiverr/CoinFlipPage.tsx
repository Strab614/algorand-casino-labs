import { useCallback, useEffect, useState } from "react";

// mui components
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  Theme,
} from "@mui/material";

// three
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

// fiverr
import Base from "./Base";
import useSceneStore from "./store";

// app components
import { BetInput } from "@/components/BetInput";
import { WalletNotConnected } from "@/components/WalletNotConnected";

// use wallet lib
import { useWallet } from "@txnlab/use-wallet-react";

// redux dispatch and selectors
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectNetworkClients, setIsSignTxnOpen } from "@/features/appSlice";

import {
  CoinFlipGame,
  CoinFlipGameResult,
  CoinFlipGlobalState,
  CoinFlipOutcome,
} from "../types";
import { createCoinFlipGame } from "../utils";
import { formattedAssetAmount } from "@/utils/utils";
import Footer from "@/app/Footer";

// notifications
import Pusher from "pusher-js";
import { useNotification } from "@/hooks/useNotification";

const clickSound = new Audio("/audio/click.wav");
const loseSound = new Audio("/audio/lose.wav");
const winSound = new Audio("/audio/win.wav");

export interface Props {
  /* loading */
  loading: boolean;
  /* app id */
  appId: number;
  /* current users game in progress, if any */
  game?: CoinFlipGame;
  /* state of the app */
  globalState?: CoinFlipGlobalState;
  /* sync function to update state */
  sync: () => Promise<void>;
}

const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

const CoinFlipPage = ({ loading, appId, globalState, game, sync }: Props) => {
  const notification = useNotification();
  // will be true if screen bigger than sm
  const matches = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));

  const dispatch = useAppDispatch();
  const { algod } = useAppSelector(selectNetworkClients);
  const { activeAddress, transactionSigner } = useWallet();

  // for animation
  const { flipCoinFn, setFallCoin, canFlip, setOutcome } = useSceneStore();

  // local state used to interact with the game
  const [prediction, setPrediction] = useState<CoinFlipOutcome>("heads");
  const [wager, setWager] = useState("0.0");
  // completed game result
  const [gameResult, setGameResult] = useState<
    CoinFlipGameResult | undefined
  >();

  // const [isLoading, setIsLoading] = useState(true);

  const onGameCompleted = useCallback(
    async (address: string, result: { wager: number; won: number }) => {
      if (address === activeAddress) {
        let outcome: CoinFlipOutcome = "tails";

        // did user bet on heads?
        const heads = prediction === "heads";

        // calc outcome
        if (
          (heads && Number(result.won) > 0) ||
          (!heads && Number(result.won) <= 0)
        ) {
          // bet heads and won
          outcome = "heads";
        } else if (
          (!heads && Number(result.won) > 0) ||
          (heads && Number(result.won) <= 0)
        ) {
          // bet tails and won
          outcome = "tails";
        }

        // set result
        setGameResult({ ...result, outcome } as CoinFlipGameResult);
        // update the redux stores outcome
        setOutcome(outcome);
        // start fall animation
        setFallCoin(true);
        // play sound to simulate fall ping/click
        await clickSound.play();
        // play win/lose sound
        if (result.won <= 0) {
          await loseSound.play();
        } else {
          await winSound.play();
        }
      } else {
        // someone elses game just completed
        // consider logging or alerting the users
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeAddress, prediction]
  );

  // for pusher
  useEffect(() => {
    if (onGameCompleted) {
      // create channel
      const channel = pusher.subscribe("coin-flip");

      // bind to event
      channel.bind(
        "game-completed",
        async (result: { address: string; wager: number; won: number }) => {
          // call the game completed function
          await onGameCompleted(result.address, {
            wager: result.wager,
            won: result.won,
          });
        }
      );
    }
    return () => {
      // TODO: fix this properly
      // unsubscribe from channel
    };
  }, [onGameCompleted]);

  useEffect(() => {
    (async () => {
      // only run if we have an active address and no global state
      if (activeAddress && flipCoinFn && wager && globalState) {
        //    setIsLoading(true);

        if (wager === "0.0") {
          // set wager to min bet as default if not set..
          setWager(String(Number(globalState.minBet) / 10));
        }

        if (game) {
          // have a game in progress
          // start flip animation
          flipCoinFn();
          // this was preventing the resume happening
          //await clickSound.play();
        } else {
          // no game in progress
        }

        // setIsLoading(false);
      }
    })();
  }, [
    activeAddress,
    algod,
    appId,
    flipCoinFn,
    globalState,
    transactionSigner,
    wager,
  ]);

  // TODO: make this prettier
  if (!activeAddress) {
    return <WalletNotConnected />;
  }

  const onCreateClick = async () => {
    if (!activeAddress || globalState === undefined) {
      alert("client not connected");
      return;
    }

    setOutcome(null);
    setGameResult(undefined);

    //setIsLoading(true);

    try {
      dispatch(setIsSignTxnOpen(true));

      await createCoinFlipGame(
        appId,
        activeAddress,
        transactionSigner,
        globalState.assetId,
        Number(wager),
        prediction,
        algod
      );

      dispatch(setIsSignTxnOpen(false));

      //console.debug(`Coin flip game created can complete at round ${r}`, r);

      // sync game state, this will update `game` and `globalState`
      await sync();

      // start animation and play sound
      flipCoinFn();
      await clickSound.play();
    } catch (error) {
      // should be closed unless issue with the sign/call, we do it in all instances
      dispatch(setIsSignTxnOpen(false));

      // check if there was an error, or just doesn't exist
      notification.display({
        type: "error",
        message: "Failed to create game! err: " + error,
      });
    }

    //setIsLoading(false);
  };

  return (
    <Box
      component={"div"}
      sx={{
        height: `calc(100vh - ${matches ? 64 : 56}px)`,
        width: "100%",
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* top alert box area */}
      <Box
        component={"div"}
        sx={{
          position: "absolute",
          top: 80,
          zIndex: 1,
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
          {gameResult ? (
            <Typography>
              Bet{" "}
              {formattedAssetAmount(
                Number(globalState?.assetId),
                gameResult.wager
              )}
              {" and "}
              {gameResult.won > 0 ? (
                <>
                  won{" "}
                  {formattedAssetAmount(
                    Number(globalState?.assetId),
                    gameResult.won
                  )}
                </>
              ) : (
                <>lost</>
              )}
            </Typography>
          ) : (
            <>
              {game ? (
                <Typography sx={{ display: "flex" }}>
                  Bet{" "}
                  {formattedAssetAmount(
                    Number(globalState?.assetId),
                    game.wager
                  )}{" "}
                  on {game.heads === 1 ? "heads" : "tails"}
                </Typography>
              ) : (
                <>
                  {loading ? (
                    <CircularProgress size={18} sx={{ color: "white" }} />
                  ) : (
                    <Typography>Waiting for bet...</Typography>
                  )}
                </>
              )}
            </>
          )}
        </Alert>
      </Box>

      {/* actual game canvas */}
      <Canvas
        camera={{ position: [-5, 7.9, 0], fov: 45 }}
        shadows
        style={{ height: "100%" }}
      >
        <ambientLight intensity={1} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Physics gravity={[0, -9.81, 0]} interpolate={false}>
          <Base />
        </Physics>
      </Canvas>

      <Footer />
      {/* bottom area that overlays the game */}
      <Box
        component={"div"}
        sx={{
          position: "absolute",
          bottom: 80,
          px: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ToggleButtonGroup
          disabled={!canFlip || loading}
          size="small"
          sx={{ mb: 1 }}
          value={prediction}
          onChange={(
            _event: React.MouseEvent<HTMLElement>,
            newAlignment: string
          ) => {
            if (newAlignment === "heads" || newAlignment === "tails") {
              setPrediction(newAlignment as "heads" | "tails");
            }
          }}
          exclusive={true}
          aria-label="heads-tails-btn"
        >
          <ToggleButton value="heads" key="heads" sx={{ width: 100 }}>
            Heads
          </ToggleButton>
          <ToggleButton value="tails" key="tails" sx={{ width: 100 }}>
            Tails
          </ToggleButton>
        </ToggleButtonGroup>
        <Box
          component="div"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <BetInput
            minBet={Number(globalState?.minBet) / 10}
            maxBet={Math.min(
              Number(globalState?.maxBet) / 10,
              Number(globalState?.prizePool) / 10 / 2 // half the prize pool is max possible bet
            )}
            step={Number(globalState?.minBet) / 10}
            value={Number(wager)}
            disabled={!canFlip || loading}
            onChange={(value) => {
              setWager(value.toString());
            }}
          />

          <Box component={"div"}>
            <Button
              variant="contained"
              disabled={!canFlip || loading}
              onClick={onCreateClick}
            >
              Play
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CoinFlipPage;
