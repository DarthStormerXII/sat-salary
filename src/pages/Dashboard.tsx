import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Gauge,
  LogOut,
  RefreshCcw,
  TrendingDown,
  WalletCards,
  Zap,
} from "lucide-react";
import { WorkerCard } from "../components/WorkerCard";
import { initialDemoState } from "../lib/demoState";
import { formatMusd, formatUsd } from "../lib/format";
import { fetchBtcPrice, fetchTroveState, type TroveState } from "../lib/mezo";
import { demoReducer, totalStreamingPerHour } from "../lib/simulation";
import type { ProofType } from "../types";

interface DashboardProps {
  account: string;
  onDisconnect: () => void;
}

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

export function Dashboard({ account, onDisconnect }: DashboardProps) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [btcPrice, setBtcPrice] = useState<bigint | null>(null);
  const [troveState, setTroveState] = useState<TroveState | null>(null);
  const streamingPerHour = useMemo(
    () => totalStreamingPerHour(state.workers),
    [state.workers],
  );

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

        {/* Actions */}
        <div className="dash-actions">
          <button
            className="action-btn action-btn--primary"
            data-testid="start-streams"
            onClick={() => dispatch({ type: "start-streams" })}
          >
            <ArrowRight size={16} /> Start payroll streams
          </button>
          <button
            className="action-btn action-btn--secondary"
            data-testid="repay-musd"
            onClick={() => dispatch({ type: "repay", amount: 2400 })}
          >
            Repay 2,400 MUSD
          </button>
          <button
            className="action-btn action-btn--danger"
            onClick={() => dispatch({ type: "stress-btc", percentDrop: 18 })}
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
