import { initialDemoState } from "./demoState";
import type { DemoState, RiskBand, TreasuryEvent, Worker } from "../types";

export type DemoAction =
  | { type: "tick"; seconds: number }
  | { type: "start-streams" }
  | { type: "pause-worker"; workerId: string }
  | { type: "resume-worker"; workerId: string }
  | { type: "repay"; amount: number }
  | { type: "stress-btc"; percentDrop: number }
  | { type: "reset" };

function nowLabel(simulatedSeconds: number): string {
  return `Demo +${simulatedSeconds}s`;
}

function event(
  id: string,
  label: string,
  simulatedSeconds: number,
  kind = "operator",
): TreasuryEvent {
  return {
    id: `${id}-${simulatedSeconds}`,
    kind,
    label,
    timestamp: nowLabel(simulatedSeconds),
    proofType: "fixture",
  };
}

function riskBand(healthRatio: number): RiskBand {
  if (healthRatio >= 3) return "safe";
  if (healthRatio >= 2) return "watch";
  return "danger";
}

function accrueWorker(worker: Worker, seconds: number): Worker {
  if (worker.streamStatus !== "streaming") return worker;
  const earned = (worker.streamRateMusdPerHour / 3600) * seconds;
  return {
    ...worker,
    accruedMusd: worker.accruedMusd + earned,
    paidMusd: worker.paidMusd + earned,
  };
}

function accruedPayroll(workers: Worker[], seconds: number): number {
  return workers.reduce(
    (total, worker) =>
      total +
      (worker.streamStatus === "streaming"
        ? (worker.streamRateMusdPerHour / 3600) * seconds
        : 0),
    0,
  );
}

function recomputeHealth(state: DemoState): DemoState {
  const healthRatio =
    state.treasury.musdDebt <= 0
      ? 9.99
      : Number(
          (
            state.treasury.collateralUsd /
            state.treasury.musdDebt /
            1.54
          ).toFixed(2),
        );

  return {
    ...state,
    treasury: {
      ...state.treasury,
      healthRatio,
      riskBand: riskBand(healthRatio),
    },
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "tick": {
      if (!state.started) return state;
      const accruedMusd = accruedPayroll(state.workers, action.seconds);
      return {
        ...state,
        simulatedSeconds: state.simulatedSeconds + action.seconds,
        treasury: {
          ...state.treasury,
          liquidityMusd: Math.max(
            0,
            state.treasury.liquidityMusd - accruedMusd,
          ),
        },
        workers: state.workers.map((worker) =>
          accrueWorker(worker, action.seconds),
        ),
      };
    }
    case "start-streams": {
      const simulatedSeconds = state.simulatedSeconds + 1;
      return {
        ...state,
        started: true,
        simulatedSeconds,
        treasury: {
          ...state.treasury,
          realProofStatus: "local-contract-ready",
        },
        workers: state.workers.map((worker) => ({
          ...worker,
          streamStatus: "streaming",
        })),
        events: [
          event(
            "start",
            "Started two MUSD payroll streams from the treasury.",
            simulatedSeconds,
          ),
          ...state.events,
        ],
      };
    }
    case "pause-worker": {
      const simulatedSeconds = state.simulatedSeconds + 1;
      return {
        ...state,
        simulatedSeconds,
        workers: state.workers.map((worker) =>
          worker.id === action.workerId
            ? { ...worker, streamStatus: "paused" }
            : worker,
        ),
        events: [
          event(
            "pause",
            `Paused ${action.workerId} stream for operator review.`,
            simulatedSeconds,
          ),
          ...state.events,
        ],
      };
    }
    case "resume-worker": {
      const simulatedSeconds = state.simulatedSeconds + 1;
      return {
        ...state,
        simulatedSeconds,
        workers: state.workers.map((worker) =>
          worker.id === action.workerId
            ? { ...worker, streamStatus: "streaming" }
            : worker,
        ),
        events: [
          event(
            "resume",
            `Resumed ${action.workerId} MUSD stream.`,
            simulatedSeconds,
          ),
          ...state.events,
        ],
      };
    }
    case "repay": {
      const simulatedSeconds = state.simulatedSeconds + 1;
      const nextDebt = Math.max(0, state.treasury.musdDebt - action.amount);
      return recomputeHealth({
        ...state,
        simulatedSeconds,
        treasury: {
          ...state.treasury,
          musdDebt: nextDebt,
          liquidityMusd: Math.max(
            0,
            state.treasury.liquidityMusd - action.amount,
          ),
        },
        events: [
          event(
            "repay",
            `Repaid ${action.amount.toLocaleString()} MUSD and improved risk.`,
            simulatedSeconds,
          ),
          ...state.events,
        ],
      });
    }
    case "stress-btc": {
      const simulatedSeconds = state.simulatedSeconds + 1;
      const collateralUsd = Math.round(
        state.treasury.collateralUsd * (1 - action.percentDrop / 100),
      );
      return recomputeHealth({
        ...state,
        simulatedSeconds,
        treasury: {
          ...state.treasury,
          collateralUsd,
          btcSpotUsd: Math.round(
            state.treasury.btcSpotUsd * (1 - action.percentDrop / 100),
          ),
        },
        events: [
          event(
            "stress",
            `BTC stress test applied: ${action.percentDrop}% drawdown.`,
            simulatedSeconds,
            "risk",
          ),
          ...state.events,
        ],
      });
    }
    case "reset":
      return structuredClone(initialDemoState);
    default:
      return state;
  }
}

export function totalStreamingPerHour(workers: Worker[]): number {
  return workers.reduce(
    (total, worker) =>
      total +
      (worker.streamStatus === "streaming" ? worker.streamRateMusdPerHour : 0),
    0,
  );
}
