# Sat Salary

BTC-collateral payroll streams on Mezo.

Sat Salary is a BitcoinFi payroll treasury for small agencies. The employer keeps BTC exposure, opens a BTC-backed MUSD credit line, and streams MUSD payroll to contractors. The UI demo uses fixture data (labeled as such); the SatSalaryVault contract is deployed and verified on Mezo Testnet.

## Demo State Transition

1. BTC collateral is retained in the agency treasury.
2. MUSD payroll liquidity is opened against the collateral state.
3. Two worker streams start accruing MUSD.
4. One stream can pause/resume for operator review.
5. A repayment action reduces debt and improves risk.

## Deployed Contracts (Mezo Testnet)

| Contract | Address | Explorer |
|---|---|---|
| SatSalaryVault | `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62` | [View](https://explorer.test.mezo.org/address/0x48B051F3e565E394ED8522ac453d87b3Fa40ad62) |

- **Chain:** Mezo Testnet (31611)
- **MUSD Token:** `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`
- **Deploy Tx:** [`0x855bb6…2822`](https://explorer.test.mezo.org/tx/0x855bb686ec01b57b1e55f5c1bb10b850cbe7341115b72f27a432f4ca426a2822)

## Stack

- React + TypeScript + Vite
- Hand-authored CSS (premium fintech aesthetic)
- viem for Mezo chain metadata
- EIP-1193 wallet auth gate for Mezo Testnet operator signatures
- Solidity + Foundry (SatSalaryVault + MockMUSD for tests)

## Run Locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run verify    # RPC check + Vitest + Foundry + build
npm run test:e2e  # Playwright readiness suite
```

## Deploy Contract

```bash
MEZO_PRIVATE_KEY=0x... forge script script/DeployMezo.s.sol --rpc-url https://rpc.test.mezo.org --broadcast --legacy
```
