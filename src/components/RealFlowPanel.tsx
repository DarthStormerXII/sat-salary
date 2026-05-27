import { useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ArrowUpRight, Coins, Plus, Wallet } from "lucide-react";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
  INTEREST_RATE_MANAGER,
  INTEREST_RATE_MANAGER_ABI,
  MEZO_EARN_APR_BPS,
} from "../lib/satSalary";
import { mezoTestnet } from "../lib/mezo";
import { TxStepsDialog, type StepStatus, type TxStep } from "./TxStepsDialog";
import { TreasuryGauge } from "./TreasuryGauge";

const TROVE = {
  address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
  abi: SAT_SALARY_TROVE_ABI,
} as const;

const SECONDS_PER_MONTH = 30 * 24 * 3600;
const explorerBase = mezoTestnet.blockExplorers.default.url;

const employeeCache: Record<string, { name: string; role?: string } | null> =
  {};

async function fetchEmployeeInfo(
  addr: string,
): Promise<{ name: string; role?: string } | null> {
  const key = addr.toLowerCase();
  if (key in employeeCache) return employeeCache[key];
  try {
    const res = await fetch(
      `https://sat-salary-api.gabrielaxy.workers.dev/profile/${key}`,
    );
    if (!res.ok) {
      employeeCache[key] = null;
      return null;
    }
    const data = (await res.json()) as {
      personName?: string;
      jobTitle?: string;
    };
    if (!data.personName || data.personName === "_cleared") {
      employeeCache[key] = null;
      return null;
    }
    const info = { name: data.personName.trim(), role: data.jobTitle?.trim() };
    employeeCache[key] = info;
    return info;
  } catch {
    employeeCache[key] = null;
    return null;
  }
}

function getEmployeeInfo(
  address: string,
): { name: string; role?: string } | null {
  const key = address.toLowerCase();
  if (key in employeeCache) return employeeCache[key];
  fetchEmployeeInfo(address);
  return null;
}

function fmtMonthly(ratePerSec: bigint): string {
  const monthly = (Number(ratePerSec) * SECONDS_PER_MONTH) / 1e18;
  return Math.round(monthly).toLocaleString();
}

function fmt(v: bigint | undefined, decimals = 2, unit = 18): string {
  if (v === undefined) return "—";
  const whole = v / 10n ** BigInt(unit);
  if (decimals === 0) return whole.toLocaleString();
  const frac = (v % 10n ** BigInt(unit))
    .toString()
    .padStart(unit, "0")
    .slice(0, decimals);
  return `${whole}.${frac}`;
}

interface StreamRow {
  id: number;
  payee: `0x${string}`;
  ratePerSecond: bigint;
  paused: boolean;
  exists: boolean;
  pending: bigint;
}

interface RealFlowPanelProps {
  view?: "dashboard" | "treasury" | "team" | "earnings";
}

export function RealFlowPanel({ view = "dashboard" }: RealFlowPanelProps) {
  const { address } = useAccount();
  const { data: employerAddr } = useReadContract({
    ...TROVE,
    functionName: "employer",
    query: { refetchInterval: 15000 },
  });
  const isOwner =
    !!address &&
    !!employerAddr &&
    (employerAddr as string).toLowerCase() === address.toLowerCase();

  // --- Live trove + payroll reads ---
  const { data: core, refetch: refetchCore } = useReadContracts({
    contracts: [
      { ...TROVE, functionName: "btcPrice" },
      { ...TROVE, functionName: "troveColl" },
      { ...TROVE, functionName: "troveDebt" },
      { ...TROVE, functionName: "healthFactor" },
      { ...TROVE, functionName: "payrollReserve" },
      { ...TROVE, functionName: "unallocatedMusd" },
      { ...TROVE, functionName: "nextStreamId" },
      { ...TROVE, functionName: "totalStreamRate" },
    ],
    query: { refetchInterval: 15000 },
  });

  const btcPrice = core?.[0]?.result as bigint | undefined;
  const coll = core?.[1]?.result as bigint | undefined;
  const debt = core?.[2]?.result as bigint | undefined;
  const health = core?.[3]?.result as bigint | undefined;
  const reserve = core?.[4]?.result as bigint | undefined;
  const unallocated = core?.[5]?.result as bigint | undefined;
  const streamCount = Number((core?.[6]?.result as bigint | undefined) ?? 0n);
  const totalRate = core?.[7]?.result as bigint | undefined;

  // --- Derived treasury analytics (all from real reads) ---
  const n = (v: bigint | undefined) =>
    v === undefined ? null : Number(v) / 1e18;
  const collBtc = n(coll);
  const btcUsd = n(btcPrice);
  const collUsd = collBtc !== null && btcUsd !== null ? collBtc * btcUsd : null;
  const debtMusd = n(debt);
  const equity =
    collUsd !== null && debtMusd !== null ? collUsd - debtMusd : null;
  const ltv =
    collUsd !== null && debtMusd !== null && collUsd > 0
      ? (debtMusd / collUsd) * 100
      : null;
  const healthPct = health !== undefined ? Number(health) / 1e16 : null;
  const ratePerSec = n(totalRate) ?? 0;
  const reserveMusd = n(reserve) ?? 0;
  const unallocatedMusd = n(unallocated) ?? 0;
  const totalAvailableMusd = reserveMusd + unallocatedMusd;
  const runwayDays =
    ratePerSec > 0 ? totalAvailableMusd / (ratePerSec * 86400) : null;
  // Gauge thresholds: Mezo MCR (liquidation) 110%, contract REBALANCE_THRESHOLD
  // 180%, TARGET_RATIO_AFTER_REBALANCE 250%.
  const MCR = 110;
  const REBAL = 180;
  const TARGET = 250;

  // --- Stream rows (streams(i) + pending(i)) ---
  const streamContracts = useMemo(() => {
    const c = [];
    for (let i = 0; i < streamCount; i++) {
      c.push({ ...TROVE, functionName: "streams", args: [BigInt(i)] } as const);
      c.push({ ...TROVE, functionName: "pending", args: [BigInt(i)] } as const);
    }
    return c;
  }, [streamCount]);

  const { data: streamData, refetch: refetchStreams } = useReadContracts({
    contracts: streamContracts,
    query: { enabled: streamCount > 0, refetchInterval: 10000 },
  });

  const streams: StreamRow[] = useMemo(() => {
    if (!streamData) return [];
    const rows: StreamRow[] = [];
    for (let i = 0; i < streamCount; i++) {
      const s = streamData[i * 2]?.result as
        | readonly [`0x${string}`, bigint, bigint, bigint, boolean, boolean]
        | undefined;
      const pending =
        (streamData[i * 2 + 1]?.result as bigint | undefined) ?? 0n;
      if (!s || !s[5]) continue;
      rows.push({
        id: i,
        payee: s[0],
        ratePerSecond: s[1],
        paused: s[4],
        exists: s[5],
        pending,
      });
    }
    return rows;
  }, [streamData, streamCount]);

  // --- Tx plumbing ---
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    steps: TxStep[];
  } | null>(null);
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [txError, setTxError] = useState<string | null>(null);
  useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  async function runTx(
    title: string,
    stepId: string,
    label: string,
    send: () => Promise<`0x${string}`>,
  ) {
    setDialog({ title, steps: [{ id: stepId, label }] });
    setStatuses({ [stepId]: "active" });
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await send();
      setTxHash(hash);
      setStatuses({ [stepId]: "done" });
      refetchCore();
      refetchStreams();
    } catch (err) {
      setStatuses({ [stepId]: "error" });
      setTxError(
        err instanceof Error ? err.message.slice(0, 160) : "Transaction failed",
      );
    }
  }

  // --- Owner: create stream ---
  const [payee, setPayee] = useState("");
  const [monthly, setMonthly] = useState("");

  function createStream() {
    const monthlyNum = Number(monthly);
    if (!payee.startsWith("0x") || payee.length !== 42 || !monthlyNum) return;
    const rate =
      (BigInt(Math.floor(monthlyNum * 1e6)) * 10n ** 12n) /
      BigInt(SECONDS_PER_MONTH);
    runTx("Create payroll stream", "create", "Creating stream on-chain", () =>
      writeContractAsync({
        ...TROVE,
        functionName: "createStream",
        args: [payee as `0x${string}`, rate],
      }),
    ).then(() => {
      setPayee("");
      setMonthly("");
    });
  }

  const [alloc, setAlloc] = useState("");
  function allocate() {
    const n = Number(alloc);
    if (!n) return;
    runTx("Allocate to payroll", "alloc", "Allocating MUSD to payroll", () =>
      writeContractAsync({
        ...TROVE,
        functionName: "allocateToPayroll",
        args: [BigInt(Math.floor(n * 1e6)) * 10n ** 12n],
      }),
    ).then(() => setAlloc(""));
  }

  function claim(streamId: number) {
    runTx("Claim streamed MUSD", "claim", "Transferring MUSD to you", () =>
      writeContractAsync({
        ...TROVE,
        functionName: "claim",
        args: [BigInt(streamId)],
      }),
    );
  }

  // Live borrow rate from Mezo's InterestRateManager (bps).
  const { data: borrowBpsRaw } = useReadContract({
    address: INTEREST_RATE_MANAGER,
    abi: INTEREST_RATE_MANAGER_ABI,
    functionName: "interestRate",
    query: { refetchInterval: 60000 },
  });
  const borrowBps = borrowBpsRaw !== undefined ? Number(borrowBpsRaw) : null;
  // Net payroll funding cost = borrow rate − Mezo Earn (mainnet Savings Vault) APR.
  const netCostBps = borrowBps !== null ? borrowBps - MEZO_EARN_APR_BPS : null;

  const showTreasury = view === "dashboard" || view === "treasury";
  const showStreams =
    view === "dashboard" || (view === "team" && isOwner) || view === "earnings";
  const showOwnerControls = false; // handled by AddEmployeeForm in AppShell
  const showOnlyMine = view === "earnings";
  const showTeamEmpty = view === "team" && !isOwner;

  const headings: Record<string, string> = {
    dashboard: "Payroll Overview",
    treasury: "Treasury",
    team: "Team Management",
    earnings: "My Earnings",
  };

  return (
    <section className="real-flow">
      <div className="real-flow__header">
        <div>
          <p className="eyebrow">Live on Mezo Testnet</p>
          <h3>{headings[view] ?? "Overview"}</h3>
        </div>
        <a
          className="real-flow__contract"
          href={`${explorerBase}/address/${SAT_SALARY_TROVE_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {SAT_SALARY_TROVE_ADDRESS.slice(0, 6)}…
          {SAT_SALARY_TROVE_ADDRESS.slice(-4)}
          <ArrowUpRight size={13} />
        </a>
      </div>

      {showTeamEmpty && (
        <div className="real-flow__empty-team">
          <div className="real-flow__empty-icon">
            <Plus size={28} />
          </div>
          <h4>No team members yet</h4>
          <p>
            You'll be able to add employees and stream MUSD payroll once you've
            opened a payroll trove. Post BTC collateral to get started.
          </p>
        </div>
      )}

      {showTreasury && (
        <>
          <div className="real-flow__treasury">
            <TreasuryGauge
              healthPct={healthPct}
              mcrPct={MCR}
              rebalancePct={REBAL}
              targetPct={TARGET}
            />
            <div className="real-flow__valuation">
              <div className="real-flow__bigval">
                <span>Collateral value</span>
                <strong>
                  {collUsd !== null
                    ? `$${collUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : "—"}
                </strong>
                <em>
                  {collBtc !== null ? `${collBtc.toFixed(4)} BTC retained` : ""}
                </em>
              </div>
              <div className="real-flow__valgrid">
                <div>
                  <span>Equity</span>
                  <strong>
                    {equity !== null
                      ? `$${equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "—"}
                  </strong>
                </div>
                <div>
                  <span>Loan-to-value</span>
                  <strong>{ltv !== null ? `${ltv.toFixed(1)}%` : "—"}</strong>
                </div>
                <div>
                  <span>Payroll runway</span>
                  <strong>
                    {runwayDays !== null
                      ? `${runwayDays.toFixed(0)} days`
                      : "∞"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="real-flow__metrics">
            <div>
              <span>BTC oracle</span>
              <strong>${fmt(btcPrice, 0)}</strong>
            </div>
            <div>
              <span>Collateral</span>
              <strong>{fmt(coll, 4)} BTC</strong>
            </div>
            <div>
              <span>MUSD debt</span>
              <strong>{fmt(debt, 0)}</strong>
            </div>
            <div>
              <span>Health</span>
              <strong>{health ? `${fmt(health, 0, 16)}%` : "—"}</strong>
            </div>
            <div>
              <span>Payroll reserve</span>
              <strong>{fmt(reserve, 0)} MUSD</strong>
            </div>
            <div>
              <span>Buffer</span>
              <strong>{fmt(unallocated, 0)} MUSD</strong>
            </div>
          </div>
          {borrowBps !== null && (
            <div className="real-flow__netcost">
              <div>
                <span>Net payroll funding cost</span>
                <strong className={netCostBps! <= 0 ? "is-negative" : ""}>
                  {(netCostBps! / 100).toFixed(1)}% / yr
                </strong>
              </div>
              <p>
                Borrow {(borrowBps / 100).toFixed(1)}% APR (live on-chain) −
                Mezo Earn ~{(MEZO_EARN_APR_BPS / 100).toFixed(0)}% APR
                {netCostBps! <= 0 ? " → payroll funds itself." : "."} Earn rate
                is the live mainnet MUSD Savings Vault (sMUSD); testnet has no
                vault yet, so idle-reserve deposit is projected, not on-chain
                here.
              </p>
            </div>
          )}
        </>
      )}

      {showStreams &&
        (() => {
          const displayStreams = showOnlyMine
            ? streams.filter(
                (s) =>
                  !!address && s.payee.toLowerCase() === address.toLowerCase(),
              )
            : streams;
          const myStreamCount = streams.filter(
            (s) => !!address && s.payee.toLowerCase() === address.toLowerCase(),
          ).length;

          return (
            <>
              {/* Streams */}
              <div className="real-flow__streams">
                <h4>
                  {showOnlyMine ? "Your salary streams" : "All payroll streams"}{" "}
                  <span>
                    {showOnlyMine
                      ? `${displayStreams.length} stream${displayStreams.length !== 1 ? "s" : ""}`
                      : `${streams.length} active · ${(ratePerSec * 3600).toFixed(2)}/hr · ${(ratePerSec * 2592000).toFixed(0)} MUSD/mo`}
                  </span>
                </h4>
                {displayStreams.length === 0 && (
                  <p className="real-flow__empty">
                    {showOnlyMine
                      ? "No salary streams for your wallet yet. Share your address with your employer to get added."
                      : isOwner
                        ? "No streams yet. Create one below."
                        : "No active streams on this trove yet."}
                  </p>
                )}
                {displayStreams.map((s) => {
                  const mine =
                    !!address &&
                    s.payee.toLowerCase() === address.toLowerCase();
                  return (
                    <div
                      key={s.id}
                      className={`real-flow__stream ${mine ? "is-mine" : ""}`}
                    >
                      <div>
                        <span className="real-flow__payee">
                          {getEmployeeInfo(s.payee)?.name ||
                            `${s.payee.slice(0, 6)}…${s.payee.slice(-4)}`}
                          {getEmployeeInfo(s.payee)?.role && (
                            <em
                              style={{
                                color: "var(--text-muted)",
                                fontWeight: 400,
                              }}
                            >
                              {" · "}
                              {getEmployeeInfo(s.payee)!.role}
                            </em>
                          )}
                          {mine && <em> (you)</em>}
                        </span>
                        <span className="real-flow__rate">
                          {fmtMonthly(s.ratePerSecond)} MUSD/mo
                          {s.paused && " · paused"}
                        </span>
                      </div>
                      <div className="real-flow__claimable">
                        <span>{fmt(s.pending, 2)} MUSD</span>
                        {mine && (
                          <button
                            className="action-btn action-btn--primary"
                            onClick={() => claim(s.id)}
                            disabled={s.pending === 0n}
                          >
                            <Wallet size={14} /> Claim
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

      {/* Owner controls */}
      {showOwnerControls && isOwner && (
        <div className="real-flow__owner">
          <h4>Employer controls</h4>
          <div className="real-flow__form">
            <input
              type="text"
              inputMode="text"
              placeholder="Employee wallet 0x…"
              value={payee}
              onChange={(e) => setPayee(e.target.value.trim())}
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="MUSD / month"
              value={monthly}
              onChange={(e) =>
                setMonthly(e.target.value.replace(/[^0-9.]/g, ""))
              }
            />
            <button
              className="action-btn action-btn--primary"
              onClick={createStream}
            >
              <Plus size={14} /> Create stream
            </button>
          </div>
          <div className="real-flow__form">
            <input
              type="text"
              inputMode="decimal"
              placeholder={`Allocate MUSD (buffer ${fmt(unallocated, 0)})`}
              value={alloc}
              onChange={(e) => setAlloc(e.target.value.replace(/[^0-9.]/g, ""))}
            />
            <button
              className="action-btn action-btn--secondary"
              onClick={allocate}
            >
              <Coins size={14} /> Allocate to payroll
            </button>
          </div>
        </div>
      )}

      <TxStepsDialog
        open={!!dialog}
        title={dialog?.title ?? ""}
        steps={dialog?.steps ?? []}
        statuses={statuses}
        error={txError}
        txHash={txHash}
        explorerBase={explorerBase}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}
