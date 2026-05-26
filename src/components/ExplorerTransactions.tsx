import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../lib/satSalary";
import { mezoTestnet } from "../lib/mezo";

const FROM_BLOCK = 13262000n;
const explorerBase = mezoTestnet.blockExplorers.default.url;

type TxType =
  | "vault"
  | "payroll"
  | "salary"
  | "rebalance"
  | "collateral"
  | "debt"
  | "stream";

interface TxItem {
  key: string;
  type: TxType;
  label: string;
  detail: string;
  txHash: string;
  block: bigint;
  eventName: string;
}

const TYPE_META: Record<TxType, { badge: string; color: string }> = {
  vault: { badge: "Vault", color: "#d4a017" },
  payroll: { badge: "Payroll", color: "#4ade80" },
  salary: { badge: "Salary", color: "#60a5fa" },
  rebalance: { badge: "Rebalance", color: "#f87171" },
  collateral: { badge: "Collateral", color: "#fbbf24" },
  debt: { badge: "Debt", color: "#c084fc" },
  stream: { badge: "Stream", color: "#34d399" },
};

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function musd(v: bigint, d = 0) {
  return `${Number(formatUnits(v, 18)).toFixed(d)} MUSD`;
}
function btc(v: bigint) {
  return `${Number(formatUnits(v, 18)).toFixed(4)} BTC`;
}

function classify(
  name: string,
  args: Record<string, unknown>,
): [TxType, string, string] {
  switch (name) {
    case "TroveOpened":
      return [
        "vault",
        "Opened employer vault",
        `${btc(args.btcCollateral as bigint)} collateral · ${musd(args.musdBorrowed as bigint)} borrowed · ${Number(formatUnits(args.healthFactor as bigint, 16)).toFixed(0)}% health`,
      ];
    case "PayrollFunded":
      return [
        "payroll",
        "Funded payroll reserve",
        musd(args.musdAmount as bigint),
      ];
    case "StreamCreated":
      return [
        "stream",
        "Created salary stream",
        `Employee ${short(args.payee as string)}`,
      ];
    case "PayeeClaimed":
      return [
        "salary",
        "Salary payout claimed",
        `${musd(args.amount as bigint, 2)} → ${short(args.payee as string)}`,
      ];
    case "Rebalanced":
      return [
        "rebalance",
        "Auto-rebalance triggered",
        `Repaid ${musd(args.debtRepaid as bigint)} · ${Number(formatUnits(args.newHealthFactor as bigint, 16)).toFixed(0)}% health`,
      ];
    case "CollateralAdded":
      return [
        "collateral",
        "Added collateral",
        `${btc(args.amount as bigint)} · ${Number(formatUnits(args.newHealthFactor as bigint, 16)).toFixed(0)}% health`,
      ];
    case "DebtRepaid":
      return [
        "debt",
        "Repaid debt",
        `${musd(args.amount as bigint)} · ${musd(args.remainingDebt as bigint)} remaining`,
      ];
    case "StreamPaused":
      return ["stream", "Paused stream", `Stream #${args.streamId}`];
    case "StreamResumed":
      return ["stream", "Resumed stream", `Stream #${args.streamId}`];
    default:
      return ["vault", name, ""];
  }
}

const ALL_TYPES: TxType[] = [
  "vault",
  "payroll",
  "salary",
  "rebalance",
  "collateral",
  "debt",
  "stream",
];

export function ExplorerTransactions() {
  const client = usePublicClient();
  const [items, setItems] = useState<TxItem[]>([]);
  const [filter, setFilter] = useState<TxType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    async function load() {
      try {
        const logs = await client!.getContractEvents({
          address: SAT_SALARY_TROVE_ADDRESS,
          abi: SAT_SALARY_TROVE_ABI,
          fromBlock: FROM_BLOCK,
          toBlock: "latest",
        });
        if (cancelled) return;
        const mapped: TxItem[] = logs
          .map((l, i) => {
            const eventName = (l as { eventName: string }).eventName;
            const args = (l as { args?: Record<string, unknown> }).args ?? {};
            const [type, label, detail] = classify(eventName, args);
            return {
              key: `${l.transactionHash}-${l.logIndex ?? i}`,
              type,
              label,
              detail,
              txHash: l.transactionHash!,
              block: l.blockNumber!,
              eventName,
            };
          })
          .sort((a, b) => Number(b.block - a.block));
        setItems(mapped);
      } catch {}
      setLoading(false);
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client]);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  const typeCounts = items.reduce(
    (acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="explorer-txs">
      <div className="explorer-txs__header">
        <h4>Transaction history</h4>
        <span className="explorer-txs__count">
          {items.length} on-chain events
        </span>
      </div>

      <div className="explorer-txs__filters">
        <button
          className={`explorer-txs__filter ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({items.length})
        </button>
        {ALL_TYPES.filter((t) => typeCounts[t]).map((t) => (
          <button
            key={t}
            className={`explorer-txs__filter ${filter === t ? "is-active" : ""}`}
            onClick={() => setFilter(t)}
            style={
              {
                "--filter-color": TYPE_META[t].color,
              } as React.CSSProperties
            }
          >
            {TYPE_META[t].badge} ({typeCounts[t]})
          </button>
        ))}
      </div>

      {loading && (
        <p className="explorer-txs__empty">Loading on-chain events…</p>
      )}
      {!loading && filtered.length === 0 && (
        <p className="explorer-txs__empty">No transactions found.</p>
      )}

      <div className="explorer-txs__list">
        {filtered.map((it) => (
          <a
            key={it.key}
            className="explorer-tx-row"
            href={`${explorerBase}/tx/${it.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className="explorer-tx-row__badge"
              style={{ background: TYPE_META[it.type].color }}
            >
              {TYPE_META[it.type].badge}
            </span>
            <div className="explorer-tx-row__main">
              <span className="explorer-tx-row__label">{it.label}</span>
              <span className="explorer-tx-row__detail">{it.detail}</span>
            </div>
            <div className="explorer-tx-row__meta">
              <span>#{it.block.toString()}</span>
              <ArrowUpRight size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
