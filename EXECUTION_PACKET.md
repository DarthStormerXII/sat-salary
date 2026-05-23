# Execution Packet

## Product

**Sat Salary** — Stream payroll in MUSD without selling Bitcoin. Post BTC collateral, borrow MUSD at 1% fixed rate via Mezo troves, and stream it to employees with auto-rebalance protection.

## One-Line Pitch

"Stream payroll in MUSD without selling Bitcoin. Companies post BTC collateral, mint MUSD at 1% fixed rate, and stream it in real time to Mezo-Passport-verified employees. 1% borrow rate means payroll funding costs less than wire transfers."

## Demo Script (for video recording)

1. (10s) "Sat-Salary: payroll in MUSD, backed by Bitcoin, at 1% borrow rate."
2. (15s) Show company dashboard — BTC collateral retained, MUSD debt, health factor, streaming rate. Point out live BTC price from Mezo PriceFeed oracle.
3. (20s) Click "Start payroll streams" — two contractor streams begin accruing MUSD in real time.
4. (15s) Pause Rafael's stream (dispute). Show Lina continues streaming. Resume after review.
5. (20s) Click "Stress BTC -18%" — show health ratio dropping. Explain auto-rebalance triggers at 180% to restore 250% — no liquidation.
6. (15s) Click "Repay 2,400 MUSD" — debt drops, risk band improves.
7. (10s) Scroll to Mezo Integration section — show BorrowerOperations, oracle price, auto-rebalance status, Earn yield.
8. (10s) Scroll to Proof section — show deployed contract addresses linked to Mezo Testnet explorer.
9. (10s) "1% fixed rate. Auto-rebalance. Mezo Earn yield offsets borrow cost. Mainnet pilot planned Q2."

## Video Script (voiceover)

"Bitcoin-native teams have a simple problem: payroll comes due before they want to sell BTC. Sat Salary turns Mezo's MUSD credit line into a payroll control room. Post BTC collateral, borrow MUSD at 1% through BorrowerOperations, and stream it to contractors in real time. If Bitcoin drops, auto-rebalance triggers — repaying debt from reserves to keep the trove healthy. No liquidation risk above a 30% BTC drawdown. The borrow rate is 1%, Mezo Earn yields 2-5% on your BTC collateral — net cost is near zero. Cheaper than wire transfers."

## Judging Criteria Mapping

- **Mezo Integration (30%):** MUSD borrowing via BorrowerOperations, live BTC oracle from PriceFeed, TroveManager health factor, auto-rebalance logic, Mezo Earn yield reference, Passport wallet target.
- **Technical Implementation:** SatSalaryTrove + SatSalaryVault contracts, 12 Foundry tests, live oracle reads in frontend, typed simulation engine.
- **Business Viability (30%):** Agencies and remote teams with BTC treasuries. 1% borrow minus 3% Earn = net negative payroll cost. Clear mainnet path with SMB pilot.
- **UX:** First-screen BTC oracle price, health factor, streaming rate. Mezo integration section with contract links. Auto-rebalance status indicator.
- **Presentation:** Clear state transitions, live oracle data, explorer-linked proof.

## Links

- Repo: https://github.com/DarthStormerXII/sat-salary
- App: https://sat-salary-mezo.vercel.app
- SatSalaryTrove: https://explorer.test.mezo.org/address/0x12D2162F47AAAe1B0591e898648605daA186D644
- SatSalaryVault: https://explorer.test.mezo.org/address/0x48B051F3e565E394ED8522ac453d87b3Fa40ad62
- Deploy Tx (Trove): https://explorer.test.mezo.org/tx/0x8d5f512e6f87e9ee851875bd0fa5975190681a2174153479f62e670aa48b5ed3
- Demo video: pending (Gabriel records)
- Hackathon: https://www.encodeclub.com/programmes/mezo-hackathon-building-bitcoins-future

## Final Checklist

- [x] SatSalaryTrove integrates BorrowerOperations, TroveManager, PriceFeed, HintHelpers, SortedTroves
- [x] Auto-rebalance logic deployed (repays debt when health < 180%)
- [x] 12 Foundry tests passing (trove, streams, rebalance, oracle)
- [x] Frontend reads live BTC price from Mezo PriceFeed oracle
- [x] Mezo integration section in UI (MUSD, oracle, rebalance, Earn)
- [x] Mainnet roadmap section
- [x] Both contracts deployed to Mezo Testnet
- [x] Public repo pushed (DarthStormerXII/sat-salary)
- [x] App deployed to Vercel (sat-salary-mezo.vercel.app)
- [x] Encode Club prefill draft with deep integration messaging
- [x] X post draft with Mezo-native narrative
- [ ] Demo video recorded (Gabriel)
- [ ] Encode Club account created for darthstormer.ai@gmail.com (Gabriel)
- [ ] Submission portal filled and submitted (Gabriel)
