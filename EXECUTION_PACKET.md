# Execution Packet

## Product

**Sat Salary** lets a small agency preserve BTC exposure while paying contractors in MUSD from a BTC-backed treasury.

## README Spine

1. Problem: small Bitcoin-native agencies need payroll liquidity without selling BTC.
2. Solution: open a BTC-backed MUSD payroll treasury, stream worker pay, and manage risk/repayment.
3. Mezo fit: MUSD as payroll liquidity, BTC as retained collateral, Mezo Testnet proof path, Passport wallet target.
4. Demo: start streams, pause one, repay debt, inspect proof.
5. Honesty: local fixture/contract proof is labeled until a funded Mezo Testnet wallet is selected.

## Demo Script

1. "This agency has 1.20 BTC it refuses to sell."
2. "Sat Salary converts that balance sheet into 18,000 MUSD of payroll liquidity."
3. "Two contractors start receiving MUSD streams."
4. "A project dispute pauses Rafael's stream while Lina continues."
5. "The agency repays 2,400 MUSD and the risk band improves."
6. "The proof panel shows exactly what is local demo data and what is ready to become a Mezo testnet receipt."

## Video Script

"Bitcoin-native teams have a simple problem: payroll comes due before they want to sell BTC. Sat Salary turns a Mezo MUSD credit line into a payroll control room. The agency keeps its BTC exposure, starts contractor streams in MUSD, pauses a disputed stream, and repays debt when revenue arrives. The demo is scoped honestly: local contract proof is available now, and the Mezo Testnet path is ready once the selected profile has testnet BTC and MUSD."

## Judging Criteria Mapping

- Mezo Integration: MUSD payroll, BTC collateral-retained state, Mezo Testnet config, Passport target.
- Technical Implementation: Solidity stream/treasury contracts, deterministic reducer, typed UI, tests.
- Business Viability: agencies and contractors with Bitcoin treasuries and recurring payroll obligations.
- UX: first-screen collateral/payroll proof, visible stream controls, proof drawer.
- Presentation: one clear state transition and one human operator story.

## Links

- Repo URL: blocked until submitter selected.
- App URL: local preview running at `http://127.0.0.1:5181/`.
- Local visual proof: `outputs/screenshots/sat-salary-375.png`, `outputs/screenshots/sat-salary-768.png`, `outputs/screenshots/sat-salary-1440.png`.
- Demo video URL: pending.
- Mezo docs: `https://mezo.org/docs/developers/getting-started`
- Hackathon page: `https://www.competehub.dev/en/competitions/encodeclub_mezo-hackathon-building-bitcoins-future`

## Final Checklist

- [x] Required planning files written.
- [x] App implemented.
- [x] Contracts implemented.
- [x] Unit/contract tests pass.
- [x] Browser proof captured with local `agent-browser` fallback at 375, 768, and 1440.
- [x] Formal polish blocker recorded: M2 `playwright-cli-sessions` SSH timeout.
- [x] Builder report written.
- [ ] Primary submitter selected.
- [ ] Public repo created and pushed.
- [ ] Submission portal draft prepared, stopping before irreversible actions.
