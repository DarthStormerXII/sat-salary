import { getConfig, okxWalletMezoTestnet } from "@mezo-org/passport";

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "07386577a7711651c83f5ef08c19e7e8";

export const wagmiConfig = getConfig({
  appName: "Sat Salary",
  appDescription: "Payroll in MUSD, backed by Bitcoin — streamed on Mezo",
  appUrl: "https://sat-salary-mezo.vercel.app",
  appIcon: "https://sat-salary-mezo.vercel.app/logo-mark.png",
  mezoNetwork: "testnet",
  walletConnectProjectId: projectId,
  wallets: [
    {
      groupName: "Bitcoin wallets",
      wallets: [okxWalletMezoTestnet],
    },
  ],
});
