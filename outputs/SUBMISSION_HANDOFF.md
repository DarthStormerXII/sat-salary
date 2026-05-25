# Sat Salary — Submission Hand-off

Generated 2026-05-25. Branch `feat/real-onchain-flow` merged to `main`.

## Live

| Asset | URL |
|---|---|
| App | https://sat-salary-mezo.vercel.app |
| Repo | https://github.com/DarthStormerXII/sat-salary |
| SatSalaryTrove | https://explorer.test.mezo.org/address/0x306919805eed1ad4772d92e18d00a1c132b07c19 |

## What's done (real + verified)

- **Real on-chain flow** (chain 31611): openTrove → allocateToPayroll → createStream → claim — all live signed txs, verified **in CLI and from the deployed browser UI** (tx hashes in `encode-club-prefill-draft.md`). Employee received real MUSD.
- **Mezo Passport** (mandatory): Unisat/OKX/Xverse BTC wallets via OrangeKit + EVM wallets for the employer.
- **Net payroll cost** live number: on-chain borrow rate (1.0%) − Mezo Earn (~5%) = −4%/yr.
- **Auto-rebalance keeper** (`keeper/`): monitors healthFactor, fires rebalance < 180%.
- Foundry 12/12 + fork wiring tests pass. Build + deploy green.

## Demo video script (~2.5 min) — YOU record

1. **Problem (15s):** "Companies holding Bitcoin can't pay salaries without selling. Sat Salary streams payroll in MUSD, backed by BTC, on Mezo."
2. **Connect (15s):** open https://sat-salary-mezo.vercel.app → Connect Wallet → show Unisat/OKX/Xverse (Mezo Passport) + employer EVM wallet. Connect as employer.
3. **Real trove (25s):** point at the "Real payroll trove" panel — live BTC oracle, 0.05 BTC collateral, 2001.8 MUSD debt, 192% health, payroll reserve. Click the contract link → explorer.
4. **Net cost (15s):** highlight "Net payroll funding cost −4%/yr — payroll funds itself" (borrow 1% − Earn 5%).
5. **Create stream (20s):** in employer controls, enter an employee wallet + MUSD/month → Create stream → TxStepsDialog → explorer link. Real tx.
6. **Employee claim (25s):** disconnect, connect as the employee (BTC wallet via Passport) → their stream shows "(you)" with live-accruing MUSD → Claim → real MUSD lands. Show balance.
7. **Auto-rebalance (20s):** show the keeper (`keeper/`) monitoring health; explain it auto-repays from the buffer if BTC drops below 180% (TrovePilot-style protection).
8. **Close (10s):** "1% fixed-rate BTC-backed payroll, cheaper than a wire — live on Mezo."

## Encode submission steps — YOU do

1. Create Encode account for `darthstormer.ai@gmail.com` at encodeclub.com (KYB takes time — do early).
2. New submission, **Track: Bank on Bitcoin**.
3. Paste fields from `outputs/encode-club-prefill-draft.md` (project name, descriptions, repo, demo URL, contract, proof tx hashes, team, stack).
4. Add the video URL once recorded.
5. List team: Darth Stormer XII (primary), Marsella (`RealMarsella`), JoelOffBeat.
6. Submit before the deadline (June 5 2026 finale).

## Honest gaps (disclose if asked)

- **rebalance() on-chain firing** is unit-tested + keeper-monitored, but not fired live (the demo trove is healthy at 192%; the contract has no borrow-more fn to dip it on demand without a real BTC drop). Optional: redeploy with a `withdrawMUSD` fn + open a near-threshold trove to demo a live rebalance (needs ~0.03 more BTC).
- **Passport BTC-wallet signing** is integrated + shown in the modal; full Unisat/Xverse connect+sign needs the real extension (the EVM path is fully proven end-to-end).
- **MUSD Savings Vault** is mainnet-only (testnet has no vault), so the net-cost Earn figure is the live mainnet rate, projected — transparently labeled in the UI.

## Recommended follow-ups

- Run `/polish` on the landing route before the video (the dashboard is connect-gated).
- If funding allows, do the live rebalance demo (above) for a stronger Technical score.
