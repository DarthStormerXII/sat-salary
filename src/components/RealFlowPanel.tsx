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
  SAT_SALARY_OWNER,
} from "../lib/satSalary";
import { mezoTestnet } from "../lib/mezo";
import { TxStepsDialog, type StepStatus, type TxStep } from "./TxStepsDialog";

const TROVE = {
  address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
  abi: SAT_SALARY_TROVE_ABI,
} as const;

const SECONDS_PER_MONTH = 30 * 24 * 3600;
const explorerBase = mezoTestnet.blockExplorers.default.url;

function fmt(v: bigint | undefined, decimals = 2, unit = 18): string {
  if (v === undefined) return "—";
  const whole = v / 10n ** BigInt(unit);
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

export function RealFlowPanel() {
  const { address } = useAccount();
  const isOwner =
    !!address && address.toLowerCase() === SAT_SALARY_OWNER.toLowerCase();

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

  const netCostNote =
    debt && reserve !== undefined
      ? "Borrow rate 1% APR · streamed in real MUSD"
      : "";

  return (
    <section className="real-flow">
      <div className="real-flow__header">
        <div>
          <p className="eyebrow">Live on Mezo Testnet</p>
          <h3>Real payroll trove</h3>
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
      {netCostNote && <p className="real-flow__note">{netCostNote}</p>}

      {/* Streams */}
      <div className="real-flow__streams">
        <h4>
          Payroll streams{" "}
          <span>
            {streams.length} active ·{" "}
            {totalRate ? `${fmt(totalRate * 3600n, 2)} MUSD/hr` : "—"}
          </span>
        </h4>
        {streams.length === 0 && (
          <p className="real-flow__empty">
            No streams yet.{" "}
            {isOwner
              ? "Create one below."
              : "The employer hasn't created your stream yet."}
          </p>
        )}
        {streams.map((s) => {
          const mine =
            !!address && s.payee.toLowerCase() === address.toLowerCase();
          return (
            <div
              key={s.id}
              className={`real-flow__stream ${mine ? "is-mine" : ""}`}
            >
              <div>
                <span className="real-flow__payee">
                  {s.payee.slice(0, 6)}…{s.payee.slice(-4)}
                  {mine && <em> (you)</em>}
                </span>
                <span className="real-flow__rate">
                  {fmt(s.ratePerSecond * BigInt(SECONDS_PER_MONTH), 0)} MUSD/mo
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

      {/* Owner controls */}
      {isOwner && (
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
