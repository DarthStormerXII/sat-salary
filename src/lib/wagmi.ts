import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { okxWallet } from "@rainbow-me/rainbowkit/wallets";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: {
      name: "Mezo Testnet Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
  testnet: true,
});

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "07386577a7711651c83f5ef08c19e7e8";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supported",
      wallets: [okxWallet],
    },
  ],
  { appName: "Sat Salary", projectId },
);

export const wagmiConfig = createConfig({
  chains: [mezoTestnet],
  connectors,
  multiInjectedProviderDiscovery: true,
  transports: {
    [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
  },
});
