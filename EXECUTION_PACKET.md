# Execution Packet

## Product

**Sat Salary** lets a small agency preserve BTC exposure while paying contractors in MUSD from a BTC-backed treasury.

## README Spine

1. Problem: small Bitcoin-native agencies need payroll liquidity without selling BTC.
2. Solution: open a BTC-backed MUSD payroll treasury, stream worker pay, and manage risk/repayment.
3. Mezo fit: MUSD as payroll liquidity, BTC as retained collateral, Mezo Testnet deployment, Passport wallet target.
4. Demo: start streams, pause one, repay debt, inspect proof.
5. Honesty: fixture UI data is labeled; contract is deployed on Mezo Testnet.

## Demo Script

1. "This agency has 1.20 BTC it refuses to sell."
2. "Sat Salary converts that balance sheet into 18,000 MUSD of payroll liquidity."
3. "Two contractors start receiving MUSD streams."
4. "A project dispute pauses Rafael's stream while Lina continues."
5. "The agency repays 2,400 MUSD and the risk band improves."
6. "The proof panel links to the live SatSalaryVault on Mezo Testnet explorer."

## Video Script

"Bitcoin-native teams have a simple problem: payroll comes due before they want to sell BTC. Sat Salary turns a Mezo MUSD credit line into a payroll control room. The agency keeps its BTC exposure, starts contractor streams in MUSD, pauses a disputed stream, and repays debt when revenue arrives. SatSalaryVault is deployed on Mezo Testnet — the proof is on-chain."

## Judging Criteria Mapping

- Mezo Integration: MUSD payroll, BTC collateral-retained state, deployed SatSalaryVault on Mezo Testnet, Passport target.
- Technical Implementation: Solidity stream/treasury contracts, deterministic reducer, typed UI, Foundry + Vitest tests.
- Business Viability: agencies and contractors with Bitcoin treasuries and recurring payroll obligations.
- UX: first-screen collateral/payroll proof, visible stream controls, deployed contract explorer link.
- Presentation: one clear state transition and one human operator story.

## Links

- Repo URL: https://github.com/DarthStormerXII/sat-salary
- App URL: https://sat-salary-mezo.vercel.app
- Contract: https://explorer.test.mezo.org/address/0x48B051F3e565E394ED8522ac453d87b3Fa40ad62
- Deploy Tx: https://explorer.test.mezo.org/tx/0x855bb686ec01b57b1e55f5c1bb10b850cbe7341115b72f27a432f4ca426a2822
- Demo video URL: pending (Gabriel records).
- Mezo docs: https://mezo.org/docs/developers/getting-started
- Hackathon page: https://www.encodeclub.com/programmes/mezo-hackathon-building-bitcoins-future

## Final Checklist

- [x] Required planning files written.
- [x] App implemented.
- [x] Contracts implemented.
- [x] Unit/contract tests pass (Vitest 7/7, Foundry 4/4).
- [x] SatSalaryVault deployed to Mezo Testnet.
- [x] Frontend patched with deployed contract address.
- [x] Primary submitter selected (Darth Stormer XII).
- [x] Public repo created and pushed (DarthStormerXII/sat-salary).
- [x] App deployed to Vercel (sat-salary-mezo.vercel.app).
- [x] Encode Club prefill draft written.
- [x] X post draft written.
- [ ] Demo video recorded (Gabriel).
- [ ] Encode Club account created for darthstormer.ai@gmail.com (Gabriel).
- [ ] Submission portal draft prepared (after account creation).
- [ ] Final submission (Gabriel).
