# Sat Salary — Auto-Rebalance Keeper

An off-chain keeper that protects the payroll trove from liquidation without
manual intervention. It polls `SatSalaryTrove.healthFactor()` on Mezo testnet
and, whenever the position drops below the `REBALANCE_THRESHOLD` (1.8e18 =
180%), calls `rebalance()` — which repays debt from the unallocated MUSD buffer
to restore the target ratio (250%).

This matches the 2025 1st-place archetype (TrovePilot): autonomous trove health
management.

## Run

```bash
# Monitor only (no key needed — reports health, never sends):
ONCE=1 node keeper/rebalance-keeper.mjs

# Live keeper (sends rebalance() when unhealthy):
KEEPER_PRIVATE_KEY=0x<key> node keeper/rebalance-keeper.mjs
```

### Env

| Var | Default | Purpose |
|---|---|---|
| `KEEPER_PRIVATE_KEY` | — | Signer for `rebalance()`. Omit for monitor-only. |
| `RPC_URL` | `https://rpc.test.mezo.org` | Mezo testnet RPC |
| `TROVE_ADDRESS` | `0x3069…7c19` | SatSalaryTrove |
| `POLL_MS` | `30000` | Poll interval |
| `ONCE` | — | `1` = single check then exit (cron mode) |

`rebalance()` is permissionless (anyone can call it; it only acts when the
position is genuinely unhealthy), so the keeper key only needs BTC for gas.

## Demonstrating a firing

The live demo trove sits at ~192% health, so the keeper reports "healthy — no
action". To show an actual on-chain `rebalance()`:

- **Real drawdown:** run the keeper continuously; it fires automatically if BTC
  falls enough to push health < 180%.
- **Forced stress:** open a trove close to the threshold (≈180–185%). A modest
  BTC dip then trips the keeper. This needs enough testnet BTC to open a
  near-threshold trove (~0.03 BTC collateral for a 2,000 MUSD trove).

The UI's "Stress BTC −18%" toggle simulates the same scenario locally for the
walkthrough, while this keeper guards the real position.

## Deploy as a cron

```bash
# every 5 minutes
*/5 * * * * cd /path/to/repo && ONCE=1 KEEPER_PRIVATE_KEY=0x… node keeper/rebalance-keeper.mjs >> keeper.log 2>&1
```
