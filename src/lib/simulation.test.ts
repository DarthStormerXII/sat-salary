import { describe, expect, it } from "vitest";
import { initialDemoState } from "./demoState";
import { demoReducer, totalStreamingPerHour } from "./simulation";

describe("sat salary simulation", () => {
  it("starts payroll streams and accrues MUSD only while streaming", () => {
    const started = demoReducer(initialDemoState, { type: "start-streams" });
    const ticked = demoReducer(started, { type: "tick", seconds: 3600 });

    expect(totalStreamingPerHour(ticked.workers)).toBe(178);
    expect(ticked.workers[0].accruedMusd).toBeCloseTo(82);
    expect(ticked.workers[1].accruedMusd).toBeCloseTo(96);
    expect(ticked.treasury.liquidityMusd).toBeCloseTo(17_822);
  });

  it("pauses one worker without stopping the other stream", () => {
    const started = demoReducer(initialDemoState, { type: "start-streams" });
    const paused = demoReducer(started, { type: "pause-worker", workerId: "rafael" });
    const ticked = demoReducer(paused, { type: "tick", seconds: 3600 });

    expect(ticked.workers.find((worker) => worker.id === "lina")?.accruedMusd).toBeCloseTo(82);
    expect(ticked.workers.find((worker) => worker.id === "rafael")?.accruedMusd).toBeCloseTo(0);
    expect(ticked.treasury.liquidityMusd).toBeCloseTo(17_918);
  });

  it("repayment improves the health ratio", () => {
    const before = initialDemoState.treasury.healthRatio;
    const after = demoReducer(initialDemoState, { type: "repay", amount: 2400 });

    expect(after.treasury.musdDebt).toBe(15600);
    expect(after.treasury.healthRatio).toBeGreaterThan(before);
    expect(after.treasury.riskBand).toBe("safe");
  });

  it("btc drawdown can move risk into watch", () => {
    const stressed = demoReducer(initialDemoState, { type: "stress-btc", percentDrop: 50 });

    expect(stressed.treasury.riskBand).toBe("watch");
  });
});
