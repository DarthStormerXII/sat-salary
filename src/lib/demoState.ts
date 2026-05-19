import type { DemoState } from "../types";

export const initialDemoState: DemoState = {
  treasury: {
    agencyName: "Lumen Coast Studio",
    operatorName: "Ana Ribeiro",
    collateralBtc: 1.2,
    collateralUsd: 126000,
    btcSpotUsd: 105000,
    musdDebt: 18000,
    liquidityMusd: 18000,
    healthRatio: 4.55,
    riskBand: "safe",
    realProofStatus: "fixture-active",
  },
  workers: [
    {
      id: "lina",
      name: "Lina Park",
      role: "Motion designer",
      wallet: "0x71b2...c9a1",
      streamRateMusdPerHour: 82,
      streamStatus: "ready",
      paidMusd: 720,
      accruedMusd: 0,
      nextPayrollDate: "2026-05-29",
    },
    {
      id: "rafael",
      name: "Rafael Stone",
      role: "Frontend engineer",
      wallet: "0xa44d...18f0",
      streamRateMusdPerHour: 96,
      streamStatus: "ready",
      paidMusd: 1120,
      accruedMusd: 0,
      nextPayrollDate: "2026-05-29",
    },
  ],
  events: [
    {
      id: "evt-fixture",
      kind: "fixture",
      label: "Demo fixture loaded. Not a live Mezo transaction.",
      timestamp: "2026-05-21 06:30 IST",
      proofType: "fixture",
    },
    {
      id: "evt-local",
      kind: "contract",
      label: "Local Foundry contract path ready for MUSD stream proof.",
      timestamp: "2026-05-21 06:31 IST",
      proofType: "local-contract",
    },
  ],
  simulatedSeconds: 0,
  started: false,
};
