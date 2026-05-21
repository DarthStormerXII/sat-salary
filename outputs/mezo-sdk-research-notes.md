# Mezo SDK Research Notes

Verified 2026-05-25 via official docs + GitHub + npm.

## MUSD (Liquity v1 trove model)

| Contract | Testnet Address |
|---|---|
| MUSD Token | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| BorrowerOperations | `0xCdF7028ceAB81fA0C6971208e83fa7872994beE5` |
| TroveManager | `0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0` |
| HintHelpers | `0x4e4cBA3779d56386ED43631b4dCD6d8EacEcBCF6` |
| SortedTroves | `0x722E4D24FD6Ff8b0AC679450F3D91294607268fA` |
| PriceFeed | `0x86bCF0841622a5dAC14A313a15f96A95421b9366` |

### Key functions (BorrowerOperations)

```solidity
function openTrove(uint256 _debtAmount, address _upperHint, address _lowerHint) external payable;
function adjustTrove(uint256 _collWithdrawal, uint256 _debtChange, bool _isDebtIncrease, address _upperHint, address _lowerHint) external payable;
function closeTrove() external;
function addColl(address _upperHint, address _lowerHint) external payable;
function repayMUSD(uint256 _amount, address _upperHint, address _lowerHint) external;
```

- Min debt: 2,000 MUSD (1,800 borrowed + 200 gas deposit)
- Min collateral ratio: 110%
- Interest: 1-5% fixed, locked at open
- No MUSD faucet — must open trove with testnet BTC

### PriceFeed

```solidity
function fetchPrice() external view returns (uint256); // 18-decimal BTC/USD
```

Testnet: `0x86bCF0841622a5dAC14A313a15f96A95421b9366`

### Skip Oracle (precompile, same address both networks)

`0x7b7c000000000000000000000000000000000015` — Chainlink AggregatorV3 compatible, updates every block.

## Mezo Passport — NOT an on-chain KYC contract

Passport is a **wallet connection library** (RainbowKit + Bitcoin wallets). No `isVerified()` function.
- npm: `@mezo-org/passport`
- Creates ERC-4337 smart accounts mapping BTC wallet → EVM address
- For hackathon: integrate as wallet connector, not KYC gate

## Mezo Earn — ve(3,3) gauge system

No single vault contract address. Uses Mellow vault architecture + Tigris DEX/gauge system.
- GitHub: `mezo-org/tigris`
- Vaults accessed via web UI, not direct contract calls for deposits
- For hackathon: reference yield opportunity in UI, show APY data

## npm Packages

- `@mezo-org/passport` — wallet connection
- `@mezo-org/musd-contracts` — MUSD ABIs (v1.0.2)
- `@mezo-org/contracts` — portal/bridge ABIs (v0.4.0-dev.1)

## Integration Strategy

1. **MUSD borrowing**: Real BorrowerOperations integration — openTrove with BTC, borrow MUSD
2. **Passport**: Use as wallet connector (replace raw EIP-1193)
3. **Price oracle**: Use PriceFeed.fetchPrice() for health factor
4. **Earn**: Reference in UI as yield source, not direct vault deposit (no public contract)
5. **Auto-rebalance**: Use adjustTrove to add collateral or repay when health drops
