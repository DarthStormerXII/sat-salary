// SatSalaryTrove — deployed on Mezo Testnet (chain 31611).
// Owner-operated: the employer EOA owns the trove; employees claim streams.
export const SAT_SALARY_TROVE_ADDRESS =
  "0x306919805eed1ad4772d92e18d00a1c132b07c19" as const;

// The employer/owner EOA that operates the trove (openTrove, createStream).
export const SAT_SALARY_OWNER =
  "0x6B9ad963c764a06A7ef8ff96D38D0cB86575eC00" as const;

export const MUSD_ADDRESS =
  "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503" as const;

// Mezo InterestRateManager (testnet) — exposes the live MUSD borrow rate (bps).
export const INTEREST_RATE_MANAGER =
  "0xD4D6c36A592A2c5e86035A6bca1d57747a567f37" as const;

export const INTEREST_RATE_MANAGER_ABI = [
  {
    type: "function",
    name: "interestRate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

// Mezo MUSD Savings Vault (sMUSD) "Earn" APR. The vault is deployed on MAINNET
// only (testnet matsnet has no savings vault), so this is the live documented
// mainnet rate used to project net payroll cost — not a testnet on-chain yield.
export const MEZO_EARN_APR_BPS = 500; // ~5% APR, mainnet Savings Vault

export const SAT_SALARY_TROVE_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_borrowerOps", type: "address", internalType: "address" },
      { name: "_troveManager", type: "address", internalType: "address" },
      { name: "_priceFeed", type: "address", internalType: "address" },
      { name: "_musd", type: "address", internalType: "address" },
      { name: "_hintHelpers", type: "address", internalType: "address" },
      { name: "_sortedTroves", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "MIN_COLLATERAL_RATIO",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "REBALANCE_THRESHOLD",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TARGET_RATIO_AFTER_REBALANCE",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addCollateral",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "allocateToPayroll",
    inputs: [{ name: "_amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "borrowerOps",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IBorrowerOperations",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "btcPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claim",
    inputs: [{ name: "_streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createStream",
    inputs: [
      { name: "_payee", type: "address", internalType: "address" },
      { name: "_ratePerSecond", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fundPayroll",
    inputs: [{ name: "_amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "healthFactor",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hintHelpers",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IHintHelpers" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRebalanceNeeded",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "musd",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IMUSD" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextStreamId",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "openTrove",
    inputs: [{ name: "_musdAmount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pauseStream",
    inputs: [{ name: "_streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "payrollReserve",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pending",
    inputs: [{ name: "_streamId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceFeed",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IPriceFeed" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rebalance",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repayDebt",
    inputs: [{ name: "_amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resumeStream",
    inputs: [{ name: "_streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sortedTroves",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract ISortedTroves" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "streams",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "payee", type: "address", internalType: "address" },
      { name: "ratePerSecond", type: "uint256", internalType: "uint256" },
      { name: "accrued", type: "uint256", internalType: "uint256" },
      { name: "lastUpdated", type: "uint256", internalType: "uint256" },
      { name: "paused", type: "bool", internalType: "bool" },
      { name: "exists", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sweepMusd",
    inputs: [
      { name: "_to", type: "address", internalType: "address" },
      { name: "_amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalStreamRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "troveColl",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "troveDebt",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "troveManager",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract ITroveManager" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unallocatedMusd",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CollateralAdded",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newHealthFactor",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DebtRepaid",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "remainingDebt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayeeClaimed",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "payee",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayrollFunded",
    inputs: [
      {
        name: "musdAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Rebalanced",
    inputs: [
      {
        name: "debtRepaid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newHealthFactor",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamCreated",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "payee",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ratePerSecond",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamPaused",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamResumed",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TroveOpened",
    inputs: [
      {
        name: "btcCollateral",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "musdBorrowed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "healthFactor",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

export const MUSD_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "a", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "s", type: "address" },
      { name: "v", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
