export type StreamStatus = "ready" | "streaming" | "paused";

export type ProofType = "fixture" | "local-contract" | "mezo-testnet";

export type RiskBand = "safe" | "watch" | "danger";

export interface Treasury {
  agencyName: string;
  operatorName: string;
  collateralBtc: number;
  collateralUsd: number;
  btcSpotUsd: number;
  musdDebt: number;
  liquidityMusd: number;
  healthRatio: number;
  riskBand: RiskBand;
  realProofStatus:
    | "fixture-active"
    | "local-contract-ready"
    | "mezo-testnet-pending";
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  wallet: string;
  streamRateMusdPerHour: number;
  streamStatus: StreamStatus;
  paidMusd: number;
  accruedMusd: number;
  nextPayrollDate: string;
}

export interface TreasuryEvent {
  id: string;
  kind: string;
  label: string;
  amount?: string;
  timestamp: string;
  proofType: ProofType;
  txHash?: string;
  explorerUrl?: string;
}

export interface DemoState {
  treasury: Treasury;
  workers: Worker[];
  events: TreasuryEvent[];
  simulatedSeconds: number;
  started: boolean;
}
