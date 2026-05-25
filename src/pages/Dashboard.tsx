import { ArrowRight, Bitcoin, Droplet, LogOut } from "lucide-react";
import { useBalance } from "wagmi";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";

interface DashboardProps {
  account: string;
  onDisconnect: () => void;
}

const FAUCET_URL = "https://faucet.test.mezo.org/";
const MIN_GAS_WEI = 100_000_000_000_000n; // 0.0001 BTC

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBtcBalance(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${frac}`;
}

export function Dashboard({ account, onDisconnect }: DashboardProps) {
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: account as `0x${string}`,
  });

  const gasWei = balance?.value ?? 0n;
  const gasChecked = !balanceLoading && balance !== undefined;
  const insufficientGas = gasChecked && gasWei < MIN_GAS_WEI;

  return (
    <div>
      <nav className="dash-nav">
        <div className="dash-brand">
          <div className="dash-brand-mark">
            <img src="/logo-mark.png" alt="Sat Salary logo" />
          </div>
          Sat Salary
        </div>
        <div className="dash-wallet-area">
          {gasChecked && (
            <div className="dash-balance-pill">
              <Bitcoin size={14} />
              <span>{formatBtcBalance(gasWei)} BTC</span>
            </div>
          )}
          <div className="dash-wallet-pill">
            <span className="dash-wallet-addr">{shortAddr(account)}</span>
            <button className="dash-disconnect" onClick={onDisconnect}>
              <LogOut size={12} /> Disconnect
            </button>
          </div>
        </div>
      </nav>

      <div className="dash-container">
        {insufficientGas && (
          <div className="dash-faucet-banner" data-testid="faucet-banner">
            <div className="dash-faucet-banner__icon">
              <Droplet size={18} />
            </div>
            <div className="dash-faucet-banner__body">
              <strong>You need testnet BTC for gas</strong>
              <span>
                Your wallet holds {formatBtcBalance(gasWei)} BTC. Claim free
                testnet BTC before sending any transaction.
              </span>
            </div>
            <a
              className="dash-faucet-btn"
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim BTC
              <ArrowRight size={15} />
            </a>
          </div>
        )}

        <RealFlowPanel />

        <ActivityFeed />
      </div>
    </div>
  );
}
