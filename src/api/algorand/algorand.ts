import { getAlgodConfigFromViteEnvironment } from "@/utils/network";
import { Algodv2 } from "algosdk";

const algodConfig = getAlgodConfigFromViteEnvironment();

// create single instance of algod
const algodClient = new Algodv2(
  algodConfig.token as string,
  algodConfig.server,
  algodConfig.port
);

export type Asset = {
  "asset-id": number;
  amount: number;
  "is-frozen": boolean;
};

/**
 * Gets the current assets for a given address
 * @param address
 * @returns { Asset[]; number | bigint }
 */
export const getAccountBalances = async (
  address: string
): Promise<{ assets: Asset[]; microAlgos: number | bigint }> => {
  const r = await algodClient.accountInformation(address).do();

  return { assets: r.assets, microAlgos: r.amount };
};

/**
 * Gets the last round from the Algorand network
 * @returns the last round
 * @throws Error if the request fails
 */
export const getLastRound = async (): Promise<number> => {
  const status = await algodClient.status().do();

  return Number(status["last-round"]);
};
