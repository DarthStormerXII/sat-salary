import { getConfig, getDefaultWallets } from "@mezo-org/passport";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "07386577a7711651c83f5ef08c19e7e8";

// Mezo Passport (OrangeKit) Bitcoin-wallet connectors — Unisat / OKX / Xverse —
// derive an EVM smart account from a BTC wallet. This is the mandatory Mezo
// integration. We append standard EVM wallets so the employer (trove owner EOA)
// can also operate the contract in the owner-operated demo.
const passportWallets = getDefaultWallets("testnet");

export const wagmiConfig = getConfig({
  appName: "Sat Salary",
  appDescription: "Payroll in MUSD, backed by Bitcoin — streamed on Mezo",
  appUrl: "https://sat-salary-mezo.vercel.app",
  appIcon: "https://sat-salary-mezo.vercel.app/favicon-512.png",
  mezoNetwork: "testnet",
  walletConnectProjectId: projectId,
  wallets: [
    ...passportWallets,
    {
      groupName: "EVM Wallets (employer)",
      wallets: [metaMaskWallet, injectedWallet, walletConnectWallet],
    },
  ],
});
