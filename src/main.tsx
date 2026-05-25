import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { PassportProvider } from "@mezo-org/passport";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App";
import { wagmiConfig } from "./lib/wagmi";
import "./styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#f2b84b",
            accentColorForeground: "#050505",
            borderRadius: "medium",
          })}
        >
          <PassportProvider environment="testnet">
            <App />
          </PassportProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
