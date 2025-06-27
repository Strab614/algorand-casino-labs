import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import algosdk, { ABIStringType } from "algosdk";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

export function ellipseAddress(address = "", width = 4): string {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}

export function getTimestampInSeconds() {
  return Math.floor(Date.now());
}

export async function copyTextToClipboard(text: string) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

// convenience to format known algo assets
export function formattedAssetAmount(
  assetId: bigint | number,
  amount: bigint | number
): string {
  let ret = Number(amount).toString();

  switch (Number(assetId)) {
    case 388592191:
      ret = (Number(amount) / 10).toLocaleString("en", {
        maximumFractionDigits: 1,
      });
      break;

    default:
      break;
  }

  return ret;
}

type Asset = {
  "asset-id": number;
  amount: number;
  "is-frozen": boolean;
};

export const getAssets = async (
  address: string,
  algod: algosdk.Algodv2
): Promise<Asset[]> => {
  const r = await algod.accountInformation(address).do();

  return r.assets as Asset[];
};

export const blockTimeAgo = (curr: number, prev: number): string => {
  return timeAgo.format(Date.now() - Math.floor((curr - prev) * 2.9 * 1000));
};

export const lookupNFDByAddress = async (address: string) => {
  try {
    const r = await fetch(
      `https://api.nf.domains/nfd/lookup?address=${address}&view=tiny`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const res = await r.json();

    return res[address].name;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return undefined;
  }
};

// util to decode arc4 strings (they are prefixed with a 2 byte length)
export function decodeArc4String(b: Uint8Array): string {
  return new ABIStringType().decode(b);
}
