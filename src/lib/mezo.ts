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
