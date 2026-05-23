# Encode Club Submission — Prefill Draft

Portal: https://www.encodeclub.com/programmes/mezo-hackathon-building-bitcoins-future
Account: `darthstormer.ai@gmail.com` (must be created first by Gabriel)

## Field Values

**Project Name:** Sat Salary

**Short Description:** Stream payroll in MUSD without selling Bitcoin. Post BTC collateral, borrow MUSD at 1% fixed rate via Mezo troves, stream to employees in real time with auto-rebalance protection.

**Long Description:**
Sat Salary is a BitcoinFi payroll treasury built natively on Mezo. Companies post BTC as collateral and borrow MUSD through Mezo's Liquity-style BorrowerOperations at 1-5% fixed interest. The borrowed MUSD is streamed in real time to employees via on-chain payroll streams with pause/resume controls.

Key Mezo integrations:
- **MUSD Borrowing**: Opens troves via BorrowerOperations with real BTC collateral, maintaining 150%+ buffer above the 110% liquidation threshold.
- **BTC Price Oracle**: Reads live BTC/USD from Mezo's PriceFeed (Skip Connect precompile, updates every block) for real-time health factor computation.
- **Auto-Rebalance**: If BTC drops and health factor falls below 180%, the contract automatically repays debt from reserves to restore 250% target ratio — zero liquidation risk above 30% BTC drawdown.
- **Mezo Earn Reference**: Collateral earns passive BTC yield (2-5% APY) via Mezo Earn vaults (ve(3,3) gauge system), offsetting borrow cost.
- **Mezo Passport**: Wallet connection target for Bitcoin-native users via RainbowKit integration.

The payroll funding cost (1% borrow rate minus ~3% Earn yield) approaches zero or negative — cheaper than wire transfers.

**Track:** Bank on Bitcoin — Paying & Receiving BTC on Mezo

**GitHub Repo:** https://github.com/DarthStormerXII/sat-salary

**Demo URL:** https://sat-salary-mezo.vercel.app

**Video URL:** (pending — Gabriel records)

**Contract Addresses:**
- SatSalaryTrove: `0x12D2162F47AAAe1B0591e898648605daA186D644`
- SatSalaryVault: `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`

**Explorer:**
- https://explorer.test.mezo.org/address/0x12D2162F47AAAe1B0591e898648605daA186D644
- https://explorer.test.mezo.org/address/0x48B051F3e565E394ED8522ac453d87b3Fa40ad62

**Team Members:**
- Darth Stormer XII (primary) — `darthstormer.ai@gmail.com` / `DarthStormerXII`
- Marsella — `testerbuster564@gmail.com` / `RealMarsella`
- JoelOffBeat — `defiusmaximus@gmail.com`

**Tech Stack:** React, TypeScript, Vite, Solidity, Foundry, viem, Mezo BorrowerOperations, PriceFeed, TroveManager

**Continuation / Grant Narrative:**
MUSD-native payroll for crypto-native SMBs and remote teams. Pilot: 1 SMB streaming $10k-$100k/mo. Mainnet target Q2 with first design-partner. KYB via Mezo Passport business-tier. Tax-compliant per-employee MUSD receipts (1099).

## Notes

- DO NOT submit until Gabriel creates the Encode Club account for `darthstormer.ai@gmail.com`
- DO NOT submit until demo video is recorded
- Track: "Bank on Bitcoin" fits best — payroll settlement via BTC-backed MUSD
