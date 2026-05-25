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
- SatSalaryTrove (real-flow core): `0x306919805eed1ad4772d92e18d00a1c132b07c19`
- SatSalaryVault (early streaming vault): `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62`

**Explorer:**
- https://explorer.test.mezo.org/address/0x306919805eed1ad4772d92e18d00a1c132b07c19

**Real on-chain proof (every headline action is a live signed tx):**
- openTrove (0.05 BTC → 2001.8 MUSD, 192% health): `0xd19b742e63f7d7353346183ef2fb53178cefdd3f4bad588f2bfc6658ee74225d`
- allocateToPayroll (1500 MUSD → reserve): `0x5131be0aaa06943965922235d61f0c43d840739f3cd1ef9d1671358f97f44154`
- createStream: `0x26742332d3bd2e43604c6cff1c42cf9fd7516d317c229a892ed52e503afa3834`
- claim (employee received real MUSD): `0xb6f3fd7451d12599e4e6d9dc07ad6b96f5890951f9d2117597eb9e734f739632`
- createStream **from the deployed UI**: `0x4c12883e19e077feafc21d17ccb617af82118015777a77371605691a8a41fff2`
- claim **from the deployed UI**: `0xa9b0639300ff2635ff95850d6c373b7c4e848e606a932652bd64860d9686d699`

**Mezo Passport:** integrated (mandatory) — connect modal offers Unisat/OKX/Xverse Bitcoin wallets via OrangeKit (derived EVM smart account) plus EVM wallets for the employer.

**Differentiator — net payroll cost:** dashboard shows a live number = on-chain borrow rate (1.0% APR, read from InterestRateManager) minus Mezo Earn Savings Vault APR (~5%) = **−4%/yr**, i.e. "payroll that funds itself".

**Auto-rebalance keeper:** off-chain keeper (`keeper/`) monitors healthFactor() and fires rebalance() below 180%.

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
