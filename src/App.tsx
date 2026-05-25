import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LandingPage } from "./pages/LandingPage";
import { AppShell } from "./pages/AppShell";

export default function App() {
  const { address, isConnected, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();

  function handleConnect() {
    openConnectModal?.();
  }

  return (
    <AnimatePresence mode="wait">
      {isConnected && address ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AppShell />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage onConnect={handleConnect} connecting={isConnecting} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
