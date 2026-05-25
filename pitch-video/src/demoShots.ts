import { sec } from "./constants";

export type DemoShot = {
  id: string;
  /** Short label shown in the on-screen step chip. */
  step: string;
  /** Short caption shown over the recording (the VO/on-screen "duet" — keep it short). */
  caption: string;
  /** What to actually record on screen for this shot. Shown inside the placeholder. */
  record: string;
  durationInFrames: number;
  /**
   * Real recording filename under public/demo/ (e.g. "01-connect.mp4").
   * Leave undefined to show the placeholder. Set it once you've recorded the clip.
   */
  clip?: string;
};

// 5 shots == 60s of demo. Durations sum to D.demo (see constants.ts).
export const DEMO_SHOTS: DemoShot[] = [
  {
    id: "d1",
    step: "01 · Connect",
    caption: "Connect with a Bitcoin wallet — Passport does the rest",
    record:
      "Click Connect → Mezo Passport modal → choose Xverse/Unisat/OKX → approve. Show the derived Mezo address land in the nav.",
    durationInFrames: sec(10),
    // clip: "01-connect.mp4",
  },
  {
    id: "d2",
    step: "02 · Post BTC, borrow mUSD",
    caption: "Post BTC, borrow mUSD at 1% — without selling",
    record:
      "Open the trove flow → enter BTC collateral + mUSD amount → confirm in wallet → trove opens, mUSD balance + health factor update. Cut to the explorer tx hash.",
    durationInFrames: sec(14),
    // clip: "02-open-trove.mp4",
  },
  {
    id: "d3",
    step: "03 · Stream payroll",
    caption: "Add your team — salaries stream by the second",
    record:
      "Add an employee (address + rate) → create-stream tx → the per-second accrual counter starts ticking live on the worker card.",
    durationInFrames: sec(14),
    // clip: "03-stream.mp4",
  },
  {
    id: "d4",
    step: "04 · Claim",
    caption: "Employees claim real mUSD, any time",
    record:
      "Switch to the employee wallet → open dashboard → click Claim → approve → mUSD balance increases. Cut to the explorer tx.",
    durationInFrames: sec(12),
    // clip: "04-claim.mp4",
  },
  {
    id: "d5",
    step: "05 · Auto-protect",
    caption:
      "BTC drops → keeper auto-rebalances on-chain. Zero liquidation risk",
    record:
      "Trigger BTC stress → health factor dips → keeper fires rebalance() → position restored to target ratio. Cut to the rebalance tx on explorer.",
    durationInFrames: sec(10),
    // clip: "05-rebalance.mp4",
  },
];
