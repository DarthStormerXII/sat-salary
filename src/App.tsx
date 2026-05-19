import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Bitcoin,
  Gauge,
  Landmark,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  WalletAuthPanel,
  type WalletAuthState,
} from "./components/WalletAuthPanel";
import { WorkerCard } from "./components/WorkerCard";
import { initialDemoState } from "./lib/demoState";
import { formatMusd, formatUsd } from "./lib/format";
import {
  MUSD_TOKEN,
  SAT_SALARY_VAULT,
  mezoTestnet,
  probeMezoRpc,
  type RpcStatus,
} from "./lib/mezo";
import { demoReducer, totalStreamingPerHour } from "./lib/simulation";
import type { ProofType } from "./types";

const proofLabels: Record<ProofType, string> = {
  fixture: "Fixture",
  "local-contract": "Local contract",
  "mezo-testnet": "Mezo testnet",
};

export default function App() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus | null>(null);
  const [rpcLoading, setRpcLoading] = useState(false);
  const [walletAuth, setWalletAuth] = useState<WalletAuthState>({
    status: "idle",
  });
  const streamingPerHour = useMemo(
    () => totalStreamingPerHour(state.workers),
    [state.workers],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: "tick", seconds: 5 });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  async function checkRpc() {
    setRpcLoading(true);
    const result = await probeMezoRpc();
    setRpcStatus(result);
    setRpcLoading(false);
  }

  return (
    <main>
      <section className="hero-shell">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">
              <Bitcoin size={18} />
            </div>
            <span>Sat Salary</span>
          </div>
          <div className="nav-links" aria-label="Product sections">
            <a href="#streams">Streams</a>
            <a href="#proof">Proof</a>
            <a href="#contracts">Contracts</a>
          </div>
          <button
            className="nav-button"
            data-testid="rpc-check"
            type="button"
            onClick={checkRpc}
          >
            {rpcLoading
              ? "Checking"
              : rpcStatus?.ok
                ? "RPC Live"
                : "Check Mezo RPC"}
          </button>
        </nav>

        <div className="hero-card">
          <div className="hero-media" aria-hidden="true">
            <div className="coin-orbit coin-orbit--one" />
            <div className="coin-orbit coin-orbit--two" />
            <div className="flow-line flow-line--one" />
            <div className="flow-line flow-line--two" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Bank on Bitcoin / MUSD track</p>
            <h1>Your BTC pays payroll without selling a sat.</h1>
            <p>
              Sat Salary turns retained BTC collateral into visible MUSD
              liquidity, starts worker payroll streams, and keeps repayment risk
              in front of the operator.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                data-testid="start-streams"
                type="button"
                onClick={() => dispatch({ type: "start-streams" })}
              >
                Start payroll streams
                <span>
                  <ArrowRight size={18} />
                </span>
              </button>
              <button
                className="secondary-button"
                data-testid="repay-musd"
                type="button"
                onClick={() => dispatch({ type: "repay", amount: 2400 })}
              >
                Repay 2,400 MUSD
              </button>
            </div>
            <div className="brand-marquee" aria-label="Demo proof steps">
              <div className="marquee-track">
                {[
                  "BTC collateral retained",
                  "MUSD credit line",
                  "Payroll stream",
                  "Pause control",
                  "Repay risk",
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
                {[
                  "BTC collateral retained",
                  "MUSD credit line",
                  "Payroll stream",
                  "Pause control",
                  "Repay risk",
                ].map((item) => (
                  <span key={`${item}-loop`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="treasury-panel" aria-label="Treasury state">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Agency treasury</p>
                <h2>{state.treasury.agencyName}</h2>
              </div>
              <span
                className={`risk-pill risk-pill--${state.treasury.riskBand}`}
              >
                {state.treasury.riskBand}
              </span>
            </div>
            <div className="big-number">
              <span>Retained collateral</span>
              <strong>{state.treasury.collateralBtc.toFixed(2)} BTC</strong>
              <em>
                {formatUsd(state.treasury.collateralUsd)} at current demo spot
              </em>
            </div>
            <div className="metrics-grid">
              <div>
                <BadgeDollarSign size={18} />
                <span>MUSD debt</span>
                <strong>{formatMusd(state.treasury.musdDebt)}</strong>
              </div>
              <div>
                <WalletCards size={18} />
                <span>Payroll liquidity</span>
                <strong>{formatMusd(state.treasury.liquidityMusd)}</strong>
              </div>
              <div>
                <Gauge size={18} />
                <span>Health ratio</span>
                <strong>{state.treasury.healthRatio.toFixed(2)}x</strong>
              </div>
              <div>
                <Activity size={18} />
                <span>Streaming now</span>
                <strong>{formatMusd(streamingPerHour)}/hr</strong>
              </div>
            </div>
            <div className="proof-strip">
              <ShieldCheck size={18} />
              <span>
                UI data is demo fixture. SatSalaryVault deployed on Mezo
                Testnet.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid" id="streams">
        <div className="section-copy">
          <p className="eyebrow">Operator flow</p>
          <h2>Collateral, streams, repayment.</h2>
          <p>
            The judge-visible state transition is explicit: BTC collateral stays
            on the balance sheet, MUSD payroll liquidity funds contractors, and
            repayment lowers the risk band.
          </p>
          <div className="action-stack">
            <button
              className="dark-button"
              type="button"
              onClick={() => dispatch({ type: "stress-btc", percentDrop: 18 })}
            >
              Stress BTC -18%
            </button>
            <button
              className="light-button"
              type="button"
              onClick={() => dispatch({ type: "reset" })}
            >
              <RefreshCcw size={16} />
              Reset demo
            </button>
          </div>
        </div>
        <div className="workers-grid">
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
      </section>

      <section className="proof-section" id="proof">
        <div>
          <p className="eyebrow">Proof lane</p>
          <h2>No hidden mocks.</h2>
          <p>
            Fixture data is marked as fixture. SatSalaryVault is deployed on
            Mezo Testnet with verified contract proof.
          </p>
        </div>
        <div className="proof-stack">
          <WalletAuthPanel authState={walletAuth} onAuthState={setWalletAuth} />
          <div className="proof-card">
            <div className="proof-row">
              <span>Mezo network</span>
              <strong>
                {mezoTestnet.name} / chain {mezoTestnet.id}
              </strong>
            </div>
            <div className="proof-row">
              <span>SatSalaryVault</span>
              <strong>
                <a
                  href={`${mezoTestnet.blockExplorers.default.url}/address/${SAT_SALARY_VAULT.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SAT_SALARY_VAULT.address.slice(0, 6)}…
                  {SAT_SALARY_VAULT.address.slice(-4)}
                </a>
              </strong>
            </div>
            <div className="proof-row">
              <span>MUSD token</span>
              <strong>{MUSD_TOKEN.testnetAddressFromDocs}</strong>
            </div>
            <div className="proof-row">
              <span>RPC probe</span>
              <strong>
                {rpcStatus
                  ? rpcStatus.ok
                    ? `Live block ${rpcStatus.blockNumber}`
                    : (rpcStatus.error ??
                      `Unexpected chain ${rpcStatus.chainId}`)
                  : "Run check"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="timeline-section" id="contracts">
        <div className="timeline-header">
          <div>
            <p className="eyebrow">Receipts</p>
            <h2>Event trail</h2>
          </div>
          <span>Demo clock {state.simulatedSeconds}s</span>
        </div>
        <div className="timeline-list">
          {state.events.map((item) => (
            <article key={item.id} className="timeline-item">
              <div>
                <span className={`proof-type proof-type--${item.proofType}`}>
                  {proofLabels[item.proofType]}
                </span>
                <h3>{item.label}</h3>
              </div>
              <time>{item.timestamp}</time>
            </article>
          ))}
        </div>
        <div className="contract-callout">
          <Landmark size={22} />
          <div>
            <strong>Local proof path</strong>
            <p>
              <code>forge test</code> covers collateral recording, credit
              opening, payroll funding, stream withdrawal, pause, resume, and
              repayment against <code>SatSalaryVault</code> plus{" "}
              <code>MockMUSD</code>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
