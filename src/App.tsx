import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { connectAndSignWallet, WalletAuthError } from "./lib/walletAuth";

export default function App() {
  const [wallet, setWallet] = useState<{
    account: string;
    chainId: number;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function handleConnect() {
    setConnecting(true);
    setConnectError(null);
    try {
      const proof = await connectAndSignWallet();
      setWallet({ account: proof.account, chainId: proof.chainId });
    } catch (err) {
      const message =
        err instanceof WalletAuthError
          ? err.message
          : "Wallet connection failed.";
      setConnectError(message);
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setWallet(null);
    setConnecting(false);
    setConnectError(null);
  }

  return (
    <AnimatePresence mode="wait">
      {wallet ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Dashboard account={wallet.account} onDisconnect={handleDisconnect} />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage
            onConnect={handleConnect}
            connecting={connecting}
            connectError={connectError}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
