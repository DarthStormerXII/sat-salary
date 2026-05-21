# Sat Salary

Stream payroll in MUSD without selling Bitcoin. Companies post BTC collateral, borrow MUSD at 1% fixed rate via Mezo's Liquity-style trove system, and stream it in real time to employees.

## How It Works

1. **Post BTC collateral** → Opens a Mezo MUSD trove (min 110% collateral ratio)
2. **Borrow MUSD** → 1-5% fixed interest, locked at trove opening
3. **Stream to employees** → Real-time MUSD payroll streams with pause/resume
4. **Auto-rebalance** → If BTC drops below 180% health factor, contract auto-repays to 250% target
5. **Mezo Earn yield** → Collateral earns passive BTC yield to offset borrow cost

## Mezo Integration

| Integration | Contract | Status |
|---|---|---|
| MUSD borrowing | BorrowerOperations (`openTrove`, `adjustTrove`, `repayMUSD`) | Deployed |
| BTC price oracle | PriceFeed (`fetchPrice()`) — Skip Connect precompile | Live reads |
| Health factor | TroveManager (`getCurrentICR`) | On-chain |
| Auto-rebalance | SatSalaryTrove (`rebalance()`) | Deployed |
| Payroll streams | SatSalaryTrove (`createStream`, `claim`, `pauseStream`) | Deployed |
| Mezo Passport | Wallet connection target (RainbowKit + BTC wallets) | Referenced |
| Mezo Earn | Yield reference for collateral (ve(3,3) gauge) | UI display |

## Deployed Contracts (Mezo Testnet)

| Contract | Address | Explorer |
|---|---|---|
| SatSalaryTrove | `0x12D2162F47AAAe1B0591e898648605daA186D644` | [View](https://explorer.test.mezo.org/address/0x12D2162F47AAAe1B0591e898648605daA186D644) |
| SatSalaryVault | `0x48B051F3e565E394ED8522ac453d87b3Fa40ad62` | [View](https://explorer.test.mezo.org/address/0x48B051F3e565E394ED8522ac453d87b3Fa40ad62) |

- **Chain:** Mezo Testnet (31611)
- **BTC oracle price:** ~$76,700 (live from PriceFeed)
- **MUSD Token:** `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`

## Stack

- React + TypeScript + Vite
- Solidity + Foundry (SatSalaryTrove + SatSalaryVault + MockMUSD)
- viem for Mezo chain metadata + on-chain reads
- EIP-1193 wallet auth gate (Mezo Passport target)
- Live PriceFeed oracle integration in frontend

## Run Locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run verify    # RPC check + Vitest + Foundry + build
```

## Deploy Contracts

```bash
# Simple vault
MEZO_PRIVATE_KEY=0x... forge script script/DeployMezo.s.sol --rpc-url https://rpc.test.mezo.org --broadcast --legacy

# Full trove integration
MEZO_PRIVATE_KEY=0x... forge script script/DeployTrove.s.sol --rpc-url https://rpc.test.mezo.org --broadcast --legacy
```

## Foundry Tests (12 passing)

- `testOpenTroveAndBorrowMusd` — Opens trove with BTC, borrows MUSD
- `testCreateStreamAndClaim` — Creates stream, payee claims accrued MUSD
- `testPauseStopsAccrual` — Pause freezes accrual, resume restarts
- `testRebalanceRepaysDebtWhenUnhealthy` — Auto-repays when health drops
- `testRebalanceRevertsWhenHealthy` — No-op when ratio is safe
- `testAddCollateralImprovesHealth` — Adding BTC improves health factor
- `testOnlyPayeeCanClaim` — Access control on claims
- `testBtcPriceFromOracle` — Reads price from PriceFeed mock

## Mainnet Roadmap

- **Pilot:** 1 SMB streaming $10k-$100k/mo MUSD payroll
- **KYB:** Mezo Passport business-tier for employer verification
- **Compliance:** Per-employee MUSD receipts for tax reporting (1099)
- **Insurance:** Liquidation-loss coverage via partner
- **Mainnet:** Q2 launch with first design-partner SMB
- **Grant ask:** MUSD-native payroll for crypto-native SMBs and remote teams
