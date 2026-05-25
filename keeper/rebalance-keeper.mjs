#!/usr/bin/env node
// Sat Salary auto-rebalance keeper.
// Polls SatSalaryTrove.healthFactor() on Mezo testnet and calls rebalance()
// whenever the position drops below REBALANCE_THRESHOLD (1.8e18 = 180%),
// repaying debt from the MUSD buffer to restore the target ratio — protecting
// the payroll position against a BTC drawdown without manual intervention.
//
// Run:
//   KEEPER_PRIVATE_KEY=0x... node keeper/rebalance-keeper.mjs
// Options (env):
//   POLL_MS        polling interval (default 30000)
//   RPC_URL        Mezo testnet RPC (default https://rpc.test.mezo.org)
//   TROVE_ADDRESS  SatSalaryTrove (default the deployed contract)
//   ONCE=1         run a single check and exit (CI / cron mode)

import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL ?? "https://rpc.test.mezo.org";
const TROVE = (
  process.env.TROVE_ADDRESS ?? "0x306919805eed1ad4772d92e18d00a1c132b07c19"
).toLowerCase();
const POLL_MS = Number(process.env.POLL_MS ?? 30000);
const THRESHOLD = 1_800_000_000_000_000_000n; // 1.8e18 = 180%

const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const ABI = [
  { type: "function", name: "healthFactor", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isRebalanceNeeded", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "troveDebt", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "unallocatedMusd", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "rebalance", stateMutability: "nonpayable", inputs: [], outputs: [] },
];

const pub = createPublicClient({ chain: mezoTestnet, transport: http(RPC_URL) });

const pk = process.env.KEEPER_PRIVATE_KEY;
const wallet = pk
  ? createWalletClient({
      chain: mezoTestnet,
      transport: http(RPC_URL),
      account: privateKeyToAccount(pk.startsWith("0x") ? pk : `0x${pk}`),
    })
  : null;

function log(...a) {
  console.log(new Date().toISOString(), ...a);
}

async function checkOnce() {
  const [hf, needed, debt, buffer] = await Promise.all([
    pub.readContract({ address: TROVE, abi: ABI, functionName: "healthFactor" }),
    pub.readContract({ address: TROVE, abi: ABI, functionName: "isRebalanceNeeded" }),
    pub.readContract({ address: TROVE, abi: ABI, functionName: "troveDebt" }),
    pub.readContract({ address: TROVE, abi: ABI, functionName: "unallocatedMusd" }),
  ]);

  const hfPct = Number(formatUnits(hf, 16)).toFixed(1);
  log(
    `health=${hfPct}% debt=${formatUnits(debt, 18)} MUSD buffer=${formatUnits(buffer, 18)} MUSD needed=${needed}`,
  );

  if (!needed || hf >= THRESHOLD) {
    log("position healthy — no action");
    return false;
  }
  if (!wallet) {
    log("REBALANCE NEEDED but no KEEPER_PRIVATE_KEY set — skipping send");
    return false;
  }
  if (buffer === 0n) {
    log("REBALANCE NEEDED but MUSD buffer is empty — cannot repay; alerting owner");
    return false;
  }

  log("REBALANCE NEEDED — sending rebalance() ...");
  const hash = await wallet.writeContract({
    address: TROVE,
    abi: ABI,
    functionName: "rebalance",
  });
  log("rebalance tx:", hash);
  const receipt = await pub.waitForTransactionReceipt({ hash });
  const after = await pub.readContract({
    address: TROVE,
    abi: ABI,
    functionName: "healthFactor",
  });
  log(`rebalance ${receipt.status} — health now ${Number(formatUnits(after, 16)).toFixed(1)}%`);
  return true;
}

async function main() {
  log(`Sat Salary keeper watching ${TROVE} (threshold 180%)`);
  if (process.env.ONCE === "1") {
    await checkOnce();
    return;
  }
  for (;;) {
    try {
      await checkOnce();
    } catch (err) {
      log("error:", err?.shortMessage ?? err?.message ?? String(err));
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
