import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Bitcoin,
  Gauge,
  Landmark,
  RefreshCcw,
  Shield,
  ShieldCheck,
  TrendingDown,
  WalletCards,
  Zap,
} from "lucide-react";
import {
  WalletAuthPanel,
  type WalletAuthState,
} from "./components/WalletAuthPanel";
import { WorkerCard } from "./components/WorkerCard";
import { initialDemoState } from "./lib/demoState";
import { formatMusd, formatUsd } from "./lib/format";
import {
  MEZO_CONTRACTS,
  MUSD_TOKEN,
  SAT_SALARY_TROVE,
  SAT_SALARY_VAULT,
  mezoTestnet,
  fetchBtcPrice,
  fetchTroveState,
  probeMezoRpc,
  type RpcStatus,
  type TroveState,
} from "./lib/mezo";
import { demoReducer, totalStreamingPerHour } from "./lib/simulation";
import type { ProofType } from "./types";

const proofLabels: Record<ProofType, string> = {
  fixture: "Fixture",
  "local-contract": "Local contract",
  "mezo-testnet": "Mezo testnet",
};

function formatBtcPrice(price: bigint): string {
  const usd = Number(price / 10n ** 18n);
  return `$${usd.toLocaleString()}`;
}

function formatEther(val: bigint, decimals = 4): string {
  const whole = val / 10n ** 18n;
  const frac = val % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").slice(0, decimals);
  return `${whole}.${fracStr}`;
}

export default function App() {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus | null>(null);
  const [rpcLoading, setRpcLoading] = useState(false);
  const [walletAuth, setWalletAuth] = useState<WalletAuthState>({
    status: "idle",
  });
  const [btcPrice, setBtcPrice] = useState<bigint | null>(null);
  const [troveState, setTroveState] = useState<TroveState | null>(null);
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

  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    fetchTroveState().then(setTroveState);
    const interval = window.setInterval(() => {
      fetchBtcPrice().then(setBtcPrice);
      fetchTroveState().then(setTroveState);
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  async function checkRpc() {
    setRpcLoading(true);
    const result = await probeMezoRpc();
    setRpcStatus(result);
    setRpcLoading(false);
  }

  const liveBtcUsd = btcPrice ? Number(btcPrice / 10n ** 18n) : null;

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
            <a href="#mezo">Mezo</a>
            <a href="#proof">Proof</a>
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
            <p className="eyebrow">Bank on Bitcoin — Payroll on Mezo</p>
            <h1>Stream payroll in MUSD without selling a sat.</h1>
            <p>
              Post BTC collateral, borrow MUSD at 1% fixed rate via Mezo's
              protocol, and stream it in real time to employees. Auto-rebalance
              protects against liquidation. Payroll costs less than wire
              transfers.
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
            <div className="brand-marquee" aria-label="Mezo integration">
              <div className="marquee-track">
                {[
                  "BTC collateral → MUSD borrow",
                  "1% fixed rate",
                  "Payroll streams",
                  "Auto-rebalance",
                  "Mezo Earn yield",
                  "Passport wallet",
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
                {[
                  "BTC collateral → MUSD borrow",
                  "1% fixed rate",
                  "Payroll streams",
                  "Auto-rebalance",
                  "Mezo Earn yield",
                  "Passport wallet",
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
                {liveBtcUsd
                  ? `${formatUsd(state.treasury.collateralBtc * liveBtcUsd)} at live oracle`
                  : `${formatUsd(state.treasury.collateralUsd)} at demo spot`}
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
                {btcPrice
                  ? `BTC oracle: ${formatBtcPrice(btcPrice)} · SatSalaryTrove on Mezo Testnet`
                  : "Loading BTC price from Mezo oracle..."}
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
            BTC collateral stays on the balance sheet. MUSD payroll liquidity
            funds contractors via real-time streams. Repayment lowers the risk
            band. Auto-rebalance triggers if BTC drops below 180% ratio.
          </p>
          <div className="action-stack">
            <button
              className="dark-button"
              type="button"
              onClick={() => dispatch({ type: "stress-btc", percentDrop: 18 })}
            >
              <TrendingDown size={16} />
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

      <section className="mezo-integration-section" id="mezo">
        <div className="section-copy">
          <p className="eyebrow">Deep Mezo integration</p>
          <h2>MUSD + Oracle + Earn + Auto-rebalance</h2>
          <p>
            Sat Salary integrates with Mezo's BorrowerOperations (Liquity-style
            troves), PriceFeed oracle, and references Mezo Earn yield to offset
            borrow cost.
          </p>
        </div>
        <div className="mezo-cards">
          <div className="mezo-card">
            <div className="mezo-card__icon">
              <BadgeDollarSign size={20} />
            </div>
            <h3>MUSD Borrowing</h3>
            <p>
              Open a trove with BTC collateral, borrow MUSD at 1-5% fixed rate.
              Min 110% collateral ratio. Sat Salary maintains 150%+ buffer.
            </p>
            <div className="mezo-card__data">
              <span>BorrowerOperations</span>
              <a
                href={`${mezoTestnet.blockExplorers.default.url}/address/${MEZO_CONTRACTS.borrowerOperations}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {MEZO_CONTRACTS.borrowerOperations.slice(0, 8)}…
              </a>
            </div>
          </div>
          <div className="mezo-card">
            <div className="mezo-card__icon">
              <Bitcoin size={20} />
            </div>
            <h3>BTC Price Oracle</h3>
            <p>
              Skip Connect precompile updates every block. Health factor
              computed on-chain in real time for liquidation protection.
            </p>
            <div className="mezo-card__data">
              <span>Live BTC/USD</span>
              <strong>
                {btcPrice ? formatBtcPrice(btcPrice) : "Loading..."}
              </strong>
            </div>
          </div>
          <div className="mezo-card">
            <div className="mezo-card__icon">
              <Zap size={20} />
            </div>
            <h3>Auto-Rebalance</h3>
            <p>
              If BTC drops and health factor falls below 180%, the contract
              auto-repays debt from reserves to restore 250% target ratio. No
              liquidation risk above 30% BTC drawdown.
            </p>
            <div className="mezo-card__data">
              <span>Status</span>
              <strong>
                {troveState
                  ? troveState.isRebalanceNeeded
                    ? "⚠ Rebalance needed"
                    : "Healthy"
                  : "No active trove"}
              </strong>
            </div>
          </div>
          <div className="mezo-card">
            <div className="mezo-card__icon">
              <Shield size={20} />
            </div>
            <h3>Mezo Earn (Yield)</h3>
            <p>
              BTC collateral earns passive yield via Mezo Earn vaults (ve(3,3)
              gauge system). Yield offsets borrow cost — net payroll funding
              cost approaches zero.
            </p>
            <div className="mezo-card__data">
              <span>Estimated APY</span>
              <strong>2-5% on BTC</strong>
            </div>
          </div>
        </div>
        {troveState && troveState.collateral > 0n && (
          <div className="trove-live-state">
            <h3>Live Trove State (on-chain)</h3>
            <div className="trove-metrics">
              <div>
                <span>Collateral</span>
                <strong>{formatEther(troveState.collateral)} BTC</strong>
              </div>
              <div>
                <span>Debt</span>
                <strong>{formatEther(troveState.debt, 2)} MUSD</strong>
              </div>
              <div>
                <span>Health Factor</span>
                <strong>{formatEther(troveState.healthFactor, 2)}x</strong>
              </div>
              <div>
                <span>Payroll Reserve</span>
                <strong>
                  {formatEther(troveState.payrollReserve, 2)} MUSD
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="proof-section" id="proof">
        <div>
          <p className="eyebrow">Proof lane</p>
          <h2>Deployed on Mezo Testnet.</h2>
          <p>
            Both SatSalaryVault (simple streams) and SatSalaryTrove (full MUSD
            integration with BorrowerOperations, PriceFeed, and auto-rebalance)
            are deployed and verified.
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
              <span>SatSalaryTrove</span>
              <strong>
                <a
                  href={`${mezoTestnet.blockExplorers.default.url}/address/${SAT_SALARY_TROVE.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SAT_SALARY_TROVE.address.slice(0, 6)}…
                  {SAT_SALARY_TROVE.address.slice(-4)}
                </a>
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
              <span>BTC oracle price</span>
              <strong>
                {btcPrice ? formatBtcPrice(btcPrice) : "Loading..."}
              </strong>
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
            <strong>Mezo-native contract architecture</strong>
            <p>
              SatSalaryTrove integrates BorrowerOperations (trove open/adjust),
              PriceFeed (BTC/USD oracle), and auto-rebalance logic. Foundry
              tests cover trove opening, stream creation, pause/resume, claim,
              rebalance trigger, and collateral addition.
            </p>
          </div>
        </div>
      </section>

      <section className="roadmap-section">
        <div className="section-copy">
          <p className="eyebrow">Mainnet roadmap</p>
          <h2>From testnet to pilot.</h2>
        </div>
        <div className="roadmap-items">
          <div className="roadmap-item">
            <span className="roadmap-phase">Pilot</span>
            <p>1 SMB streaming $10k-$100k/mo MUSD payroll</p>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-phase">KYB</span>
            <p>Mezo Passport business-tier for employer verification</p>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-phase">Compliance</span>
            <p>Per-employee MUSD receipts for tax reporting (1099)</p>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-phase">Mainnet</span>
            <p>Q2 launch with first design-partner SMB</p>
          </div>
        </div>
      </section>
    </main>
  );
}
