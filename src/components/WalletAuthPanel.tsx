import { ShieldAlert, ShieldCheck, WalletCards } from "lucide-react";
import { connectAndSignWallet, type WalletAuthError, type WalletAuthProof } from "../lib/walletAuth";

export type WalletAuthState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected"; proof: WalletAuthProof }
  | { status: "blocked"; code: string; message: string };

interface WalletAuthPanelProps {
  authState: WalletAuthState;
  onAuthState: (state: WalletAuthState) => void;
}

function shortAccount(account: string): string {
  return `${account.slice(0, 6)}...${account.slice(-4)}`;
}

export function WalletAuthPanel({ authState, onAuthState }: WalletAuthPanelProps) {
  async function connectWallet() {
    onAuthState({ status: "connecting" });

    try {
      const proof = await connectAndSignWallet();
      onAuthState({ status: "connected", proof });
    } catch (error) {
      const authError = error as WalletAuthError;
      onAuthState({
        status: "blocked",
        code: authError.code ?? "provider-error",
        message: authError.message,
      });
    }
  }

  const isConnected = authState.status === "connected";
  const isBlocked = authState.status === "blocked";

  return (
    <div className="wallet-auth-card" aria-label="Wallet authentication">
      <div className="wallet-auth-card__header">
        <div>
          <p className="eyebrow">Wallet auth</p>
          <h3>Operator signature gate</h3>
        </div>
        {isConnected ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
      </div>
      <p>
        Live Mezo payroll testing requires a real EVM wallet account, Mezo Testnet chain
        {` `}31611, and a signed operator message. The app will not mark a wallet connected
        without a returned signature.
      </p>
      <button
        className="dark-button"
        data-testid="wallet-auth-button"
        type="button"
        onClick={connectWallet}
        disabled={authState.status === "connecting" || isConnected}
      >
        <WalletCards size={17} />
        {authState.status === "connecting" ? "Waiting for wallet" : isConnected ? "Wallet signed" : "Connect wallet & sign"}
      </button>
      {isConnected ? (
        <div className="wallet-auth-status wallet-auth-status--connected" data-testid="wallet-auth-status">
          <strong>{shortAccount(authState.proof.account)}</strong>
          <span>Signed on chain {authState.proof.chainId}</span>
        </div>
      ) : null}
      {isBlocked ? (
        <div className="wallet-auth-status wallet-auth-status--blocked" data-testid="wallet-auth-status">
          <strong>{authState.code}</strong>
          <span>{authState.message}</span>
        </div>
      ) : null}
    </div>
  );
}
