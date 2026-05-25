import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../lib/satSalary";
import { mezoTestnet } from "../lib/mezo";

// Block to start scanning from — just before the trove was deployed, so we
// capture every event without scanning the whole chain.
const FROM_BLOCK = 13262000n;
const explorerBase = mezoTestnet.blockExplorers.default.url;

interface FeedItem {
  key: string;
  label: string;
  detail: string;
  txHash: string;
  block: bigint;
}

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function musd(v: bigint, d = 0) {
  return `${Number(formatUnits(v, 18)).toFixed(d)} MUSD`;
}
function btc(v: bigint) {
  return `${Number(formatUnits(v, 18)).toFixed(4)} BTC`;
}

function describe(
  name: string,
  args: Record<string, unknown>,
): [string, string] {
  switch (name) {
    case "TroveOpened":
      return [
        "Trove opened",
        `${btc(args.btcCollateral as bigint)} collateral · ${musd(args.musdBorrowed as bigint)} borrowed`,
      ];
    case "PayrollFunded":
      return ["Payroll funded", musd(args.musdAmount as bigint)];
    case "StreamCreated":
      return ["Stream created", `→ ${short(args.payee as string)}`];
    case "PayeeClaimed":
      return [
        "Salary claimed",
        `${musd(args.amount as bigint, 2)} by ${short(args.payee as string)}`,
      ];
    case "Rebalanced":
      return ["Auto-rebalanced", `repaid ${musd(args.debtRepaid as bigint)}`];
    case "CollateralAdded":
      return ["Collateral added", btc(args.amount as bigint)];
    case "DebtRepaid":
      return ["Debt repaid", musd(args.amount as bigint)];
    case "StreamPaused":
      return ["Stream paused", `#${args.streamId}`];
    case "StreamResumed":
      return ["Stream resumed", `#${args.streamId}`];
    default:
      return [name, ""];
  }
}

export function ActivityFeed() {
  const client = usePublicClient();
  const [items, setItems] = useState<FeedItem[]>([]);

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
        const mapped: FeedItem[] = logs
          .map((l, i) => {
            const [label, detail] = describe(
              (l as { eventName: string }).eventName,
              (l as { args?: Record<string, unknown> }).args ?? {},
            );
            return {
              key: `${l.transactionHash}-${l.logIndex ?? i}`,
              label,
              detail,
              txHash: l.transactionHash!,
              block: l.blockNumber!,
            };
          })
          .sort((a, b) => Number(b.block - a.block));
        setItems(mapped);
      } catch {
        // transient RPC error — keep last good state
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client]);

  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <h3>On-chain activity</h3>
        <span>{items.length} events · live from Mezo</span>
      </div>
      {items.length === 0 && (
        <p className="activity-feed__empty">Loading on-chain events…</p>
      )}
      <div className="activity-feed__list">
        {items.map((it) => (
          <a
            key={it.key}
            className="activity-row"
            href={`${explorerBase}/tx/${it.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="activity-row__main">
              <span className="activity-row__label">{it.label}</span>
              <span className="activity-row__detail">{it.detail}</span>
            </div>
            <div className="activity-row__meta">
              <span>#{it.block.toString()}</span>
              <ArrowUpRight size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
