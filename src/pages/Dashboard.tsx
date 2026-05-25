import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Droplet,
  Gauge,
  LogOut,
  RefreshCcw,
  TrendingDown,
  WalletCards,
  Zap,
} from "lucide-react";
import { useBalance } from "wagmi";
import { WorkerCard } from "../components/WorkerCard";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";
import { initialDemoState } from "../lib/demoState";
import { formatMusd, formatUsd } from "../lib/format";
import { fetchBtcPrice, fetchTroveState, type TroveState } from "../lib/mezo";
import { demoReducer, totalStreamingPerHour } from "../lib/simulation";
import type { ProofType } from "../types";

interface DashboardProps {
  account: string;
  onDisconnect: () => void;
}

const FAUCET_URL = "https://faucet.test.mezo.org/";
// Minimum native BTC needed to cover gas on Mezo Testnet (gas is very cheap).
const MIN_GAS_WEI = 100_000_000_000_000n; // 0.0001 BTC

const proofLabels: Record<ProofType, string> = {
  fixture: "Fixture",
  "local-contract": "Local contract",
  "mezo-testnet": "Mezo testnet",
};

function formatBtcPrice(price: bigint): string {
  return `$${Number(price / 10n ** 18n).toLocaleString()}`;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBtcBalance(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${frac}`;
}

export function Dashboard({ account, onDisconnect }: DashboardProps) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [btcPrice, setBtcPrice] = useState<bigint | null>(null);
  const [troveState, setTroveState] = useState<TroveState | null>(null);
  const streamingPerHour = useMemo(
    () => totalStreamingPerHour(state.workers),
    [state.workers],
  );

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: account as `0x${string}`,
  });

  const gasWei = balance?.value ?? 0n;
  const hasGas = !balanceLoading && gasWei >= MIN_GAS_WEI;
  const gasChecked = !balanceLoading && balance !== undefined;
  const insufficientGas = gasChecked && !hasGas;

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "tick", seconds: 5 });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    fetchTroveState().then(setTroveState);
    const interval = setInterval(() => {
      fetchBtcPrice().then(setBtcPrice);
      fetchTroveState().then(setTroveState);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const liveBtcUsd = btcPrice ? Number(btcPrice / 10n ** 18n) : null;

  return (
    <div>
      <nav className="dash-nav">
        <div className="dash-brand">
          <div className="dash-brand-mark">
            <img src="/logo-mark.png" alt="Sat Salary logo" />
          </div>
          Sat Salary
        </div>
        <div className="dash-wallet-pill">
          <span className="dash-wallet-addr">{shortAddr(account)}</span>
          <button className="dash-disconnect" onClick={onDisconnect}>
            <LogOut size={12} /> Disconnect
          </button>
        </div>
      </nav>

      <div className="dash-container">
        {/* Real on-chain flow — primary */}
        <RealFlowPanel />

        {/* Real on-chain event timeline */}
        <ActivityFeed />

        {/* Simulation preview — clearly labeled, secondary */}
        <div className="dash-sim-banner">
          <Activity size={14} />
          <span>
            Fast-forward simulation below — accelerates streaming &amp;
            stress-tests the position locally. The numbers above are live
            on-chain.
          </span>
        </div>

        {/* Treasury */}
        <div className="dash-treasury">
          <div className="dash-treasury-header">
            <div>
              <p className="eyebrow">Agency treasury</p>
              <h2>{state.treasury.agencyName}</h2>
            </div>
            <span
              className={`risk-badge risk-badge--${state.treasury.riskBand}`}
            >
              {state.treasury.riskBand}
            </span>
          </div>
          <div className="dash-collateral">
            <span>Retained collateral</span>
            <strong>{state.treasury.collateralBtc.toFixed(2)} BTC</strong>
            <em>
              {liveBtcUsd
                ? `${formatUsd(state.treasury.collateralBtc * liveBtcUsd)} at live oracle`
                : `${formatUsd(state.treasury.collateralUsd)} at demo spot`}
            </em>
          </div>
          <div className="dash-metrics">
            <div className="dash-metric">
              <div className="dash-metric-label">
                <BadgeDollarSign size={14} /> MUSD debt
              </div>
              <strong>{formatMusd(state.treasury.musdDebt)}</strong>
            </div>
            <div className="dash-metric">
              <div className="dash-metric-label">
                <WalletCards size={14} /> Payroll liquidity
              </div>
              <strong>{formatMusd(state.treasury.liquidityMusd)}</strong>
            </div>
            <div className="dash-metric">
              <div className="dash-metric-label">
                <Gauge size={14} /> Health ratio
              </div>
              <strong>{state.treasury.healthRatio.toFixed(2)}x</strong>
            </div>
            <div className="dash-metric">
              <div className="dash-metric-label">
                <Activity size={14} /> Streaming now
              </div>
              <strong>{formatMusd(streamingPerHour)}/hr</strong>
            </div>
          </div>
          <div className="dash-oracle-strip">
            <Zap size={14} />
            {btcPrice ? (
              <span>
                BTC oracle: <strong>{formatBtcPrice(btcPrice)}</strong> · Live
                from Mezo PriceFeed
              </span>
            ) : (
              <span>Loading BTC price from Mezo oracle…</span>
            )}
          </div>
        </div>

        {/* Gas / faucet gate */}
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

        {/* Actions */}
        <div className="dash-actions">
          <button
            className="action-btn action-btn--primary"
            data-testid="start-streams"
            onClick={() => dispatch({ type: "start-streams" })}
            disabled={insufficientGas}
            title={
              insufficientGas ? "Claim testnet BTC for gas first." : undefined
            }
          >
            <ArrowRight size={16} />{" "}
            {insufficientGas ? "Insufficient gas" : "Start payroll streams"}
          </button>
          <button
            className="action-btn action-btn--secondary"
            data-testid="repay-musd"
            onClick={() => dispatch({ type: "repay", amount: 2400 })}
            disabled={insufficientGas}
            title={
              insufficientGas ? "Claim testnet BTC for gas first." : undefined
            }
          >
            Repay 2,400 MUSD
          </button>
          <button
            className="action-btn action-btn--danger"
            onClick={() => dispatch({ type: "stress-btc", percentDrop: 18 })}
            disabled={insufficientGas}
            title={
              insufficientGas ? "Claim testnet BTC for gas first." : undefined
            }
          >
            <TrendingDown size={16} /> Stress BTC -18%
          </button>
          <button
            className="action-btn action-btn--secondary"
            onClick={() => dispatch({ type: "reset" })}
          >
            <RefreshCcw size={14} /> Reset
          </button>
        </div>

        {/* Workers */}
        <div className="dash-workers-header">
          <h3>Contractor streams</h3>
          <span className="eyebrow">
            {state.workers.filter((w) => w.streamStatus === "streaming").length}{" "}
            active
          </span>
        </div>
        <div className="dash-workers-grid">
          {state.workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              gasBlocked={insufficientGas}
              onPause={() =>
                dispatch({ type: "pause-worker", workerId: worker.id })
              }
              onResume={() =>
                dispatch({ type: "resume-worker", workerId: worker.id })
              }
            />
          ))}
        </div>

        {/* Event Trail */}
        <div className="dash-events">
          <div className="dash-events-header">
            <h3>Event trail</h3>
            <span>Demo clock {state.simulatedSeconds}s</span>
          </div>
          {state.events.map((evt) => (
            <div key={evt.id} className="event-item">
              <div>
                <span
                  className={`event-type-badge event-type-badge--${evt.proofType}`}
                >
                  {proofLabels[evt.proofType]}
                </span>
                <h4>{evt.label}</h4>
              </div>
              <time>{evt.timestamp}</time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
