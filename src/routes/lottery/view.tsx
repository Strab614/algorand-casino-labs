import { Stack } from "@mui/material";
import { useWalletAdapter } from "@/hooks/useWalletAdapter";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import Loading from "../../components/Loading";
import {
  DeletedLotteryCard,
  LotteryLogs,
  LotteryCard,
  LotteryWinners,
} from "../../features/lottery/components";
import { LotteryNumbers } from "../../features/lottery/types";
import {
  LotteryLogsFormatted,
  parseRawLogs,
} from "../../features/lottery/utils";
import { useLottery } from "./layout";
import { useNotification } from "@/hooks/useNotification";

import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from "@/utils/network";
import { Algodv2, Indexer } from "algosdk";

const algodConfig = getAlgodConfigFromViteEnvironment();
const algod = new Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

const indexerConfig = getIndexerConfigFromViteEnvironment();
const indexer = new Indexer(
  indexerConfig.token as string,
  indexerConfig.server,
  indexerConfig.port
);

const LotteryView = () => {
  const { appId } = useParams();
  const { applications, manager, currentRound } = useLottery();
  const { activeAddress } = useWalletAdapter();

  const [deleted, setDeleted] = useState<boolean>();

  const notification = useNotification();

  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<LotteryNumbers[]>();

  const [logs, setLogs] = useState<LotteryLogsFormatted>();

  const getLogs = useCallback(async () => {
    setIsLoading(true);

    let nextToken = "";
    const logData: [] = [];

    while (nextToken !== undefined) {
      try {
        const r = await indexer
          .lookupApplicationLogs(Number(appId))
          .nextToken(nextToken)
          .do();

        nextToken = r["next-token"];

        const ld: [] = r["log-data"];

        if (ld) {
          logData.push(...ld);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          notification.display({ type: "error", message: error.message });
        }
      }
    }

    const r = parseRawLogs(logData);
    setLogs(r);
    setIsLoading(false);
  }, [appId, indexer, dispatch]);

  useEffect(() => {
    if (algod && appId && applications) {
      const getInitialStatus = async () => {
        setIsLoading(true);

        if (logs === undefined) {
          getLogs();
        }

        const d = applications.find((el: any) => {
          return el.id === Number(appId) && el.deleted;
        });

        setDeleted(d !== undefined);
        setIsLoading(false);
      };

      getInitialStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algod, appId, applications]);

  useEffect(() => {
    if (logs) {
      logs.events.forEach((value) => {
        if (value.type === "BuyTicket") {
          const { address, tickets } = value.data as {
            address: string;
            tickets: LotteryNumbers[];
          };

          if (address === activeAddress) {
            setUserTickets(tickets);
          }
        }
      });
    }
  }, [activeAddress, logs]);

  if (isLoading || !logs || !appId) {
    return <Loading />;
  }

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      {deleted ? (
        <>
          <DeletedLotteryCard
            appId={Number(appId)}
            manager={manager}
            ticketsSold={Number(logs.ticketsSold)}
            ticketPrice={1000}
            finalPrizePool={Number(logs.finalPrizePool)}
            totalFees={Number(logs.totalFees)}
            winningNumbers={logs.winningNumbers}
            userTickets={userTickets}
          />
          <LotteryWinners winners={logs.winners} />
          <LotteryLogs
            appId={parseInt(appId, 10)}
            logs={logs}
            onRefreshClick={getLogs}
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
          <LotteryCard
            appId={parseInt(appId, 10)}
            currentRound={currentRound}
          />
          <LotteryLogs
            appId={parseInt(appId, 10)}
            logs={logs}
            onRefreshClick={getLogs}
            isLoading={isLoading}
          />
        </>
      )}
    </Stack>
  );
};

export default LotteryView;