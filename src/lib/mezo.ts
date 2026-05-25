import { defineChain } from "viem";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.test.mezo.org"],
      webSocket: ["wss://rpc-ws.test.mezo.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mezo Testnet Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
});

export const MUSD_TOKEN = {
  symbol: "MUSD",
  decimals: 18,
  testnetAddressFromDocs: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
};

export const SAT_SALARY_VAULT = {
  address: "0x48B051F3e565E394ED8522ac453d87b3Fa40ad62" as const,
  deployer: "0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00" as const,
  txHash:
    "0x855bb686ec01b57b1e55f5c1bb10b850cbe7341115b72f27a432f4ca426a2822" as const,
};

export const SAT_SALARY_TROVE = {
  address: "0x306919805eed1ad4772d92e18d00a1c132b07c19" as const,
  deployer: "0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00" as const,
};

export const MEZO_CONTRACTS = {
  borrowerOperations: "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5" as const,
  troveManager: "0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0" as const,
  priceFeed: "0x86bCF0841622a5dAC14A313a15f96A95421b9366" as const,
  hintHelpers: "0x4e4cBA3779d56386ED43631b4dCD6d8EacEcBCF6" as const,
  sortedTroves: "0x722E4D24FD6Ff8b0AC679450F3D91294607268fA" as const,
};

export interface TroveState {
  btcPrice: bigint;
  collateral: bigint;
  debt: bigint;
  healthFactor: bigint;
  isRebalanceNeeded: boolean;
  payrollReserve: bigint;
}

export async function fetchBtcPrice(
  rpcUrl = mezoTestnet.rpcUrls.default.http[0],
): Promise<bigint> {
  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [
        {
          to: MEZO_CONTRACTS.priceFeed,
          data: "0x0fdb11cf", // fetchPrice()
        },
        "latest",
      ],
    }),
  });
  const json = (await resp.json()) as { result?: string };
  return BigInt(json.result ?? "0x0");
}

export async function fetchTroveState(
  rpcUrl = mezoTestnet.rpcUrls.default.http[0],
): Promise<TroveState | null> {
  const troveAddr = SAT_SALARY_TROVE.address.toLowerCase().slice(2);

  const calls = [
    { to: MEZO_CONTRACTS.priceFeed, data: "0x0fdb11cf" }, // fetchPrice()
    {
      to: SAT_SALARY_TROVE.address,
      data: "0xf3165ecf", // troveColl()
    },
    {
      to: SAT_SALARY_TROVE.address,
      data: "0xa71d594a", // troveDebt()
    },
    {
      to: SAT_SALARY_TROVE.address,
      data: "0x22841f01", // healthFactor()
    },
    {
      to: SAT_SALARY_TROVE.address,
      data: "0x8a77c8dc", // isRebalanceNeeded()
    },
    {
      to: SAT_SALARY_TROVE.address,
      data: "0x3eef17db", // payrollReserve()
    },
  ];

  const batchBody = calls.map((c, i) => ({
    jsonrpc: "2.0",
    id: i + 1,
    method: "eth_call",
    params: [c, "latest"],
  }));

  try {
    const resp = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batchBody),
    });
    const results = (await resp.json()) as { id: number; result?: string }[];
    results.sort((a, b) => a.id - b.id);

    const val = (i: number) => BigInt(results[i]?.result ?? "0x0");

    return {
      btcPrice: val(0),
      collateral: val(1),
      debt: val(2),
      healthFactor: val(3),
      isRebalanceNeeded: val(4) !== 0n,
      payrollReserve: val(5),
    };
  } catch {
    return null;
  }
}

export interface RpcStatus {
  ok: boolean;
  chainId?: number;
  blockNumber?: number;
  error?: string;
}

export function explorerAddressUrl(address: string): string {
  return `${mezoTestnet.blockExplorers.default.url}/address/${address}`;
}

export async function probeMezoRpc(
  rpcUrl = mezoTestnet.rpcUrls.default.http[0],
): Promise<RpcStatus> {
  try {
    const [chainResponse, blockResponse] = await Promise.all([
      fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_chainId",
          params: [],
        }),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_blockNumber",
          params: [],
        }),
      }),
    ]);

    const chainJson = (await chainResponse.json()) as { result?: string };
    const blockJson = (await blockResponse.json()) as { result?: string };
    const chainId = Number.parseInt(chainJson.result ?? "0x0", 16);
    const blockNumber = Number.parseInt(blockJson.result ?? "0x0", 16);

    return {
      ok: chainId === mezoTestnet.id && blockNumber > 0,
      chainId,
      blockNumber,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown RPC error",
    };
  }
}
