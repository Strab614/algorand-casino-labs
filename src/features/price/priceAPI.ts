export interface FetchDataResult {
  algoUSD: number;
  chipALGO: number;
}

const fetchAlgoPrice = async () => {
  try {
    const response = await fetch("https://free-api.vestige.fi/currency/prices");

    const r = await response.json();

    return r["USD"];
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const fetchChipPrice = async () => {
  try {
    const response = await fetch("https://free-api.vestige.fi/asset/388592191/price?currency=algo");

    const r = await response.json();

    return r["price"];
  } catch (error) {
    console.log(error);
    return -1;
  }
};

export const fetchData = async (): Promise<FetchDataResult> => {
  const res: FetchDataResult = {
    algoUSD: await fetchAlgoPrice(),
    chipALGO: await fetchChipPrice(),
  };

  return res;
};
