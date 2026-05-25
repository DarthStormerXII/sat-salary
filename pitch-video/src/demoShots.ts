import { sec } from "./constants";

export type DemoShot = {
  id: string;
  /** Short label shown in the on-screen step chip. */
  step: string;
  /** Short caption over the recording (the VO/on-screen "duet" — keep it short). */
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

// A GUIDED PRODUCT WALKTHROUGH — show a watcher how to actually USE Sat Salary,
// step by step, like onboarding a new user. Not a "proof showcase". Real app, real
// flow, narrated as "here's how you run payroll on this." 5 shots == 60s.
export const DEMO_SHOTS: DemoShot[] = [
  {
    id: "d1",
    step: "01 · Connect",
    caption: "Connect your Bitcoin wallet — no new keys",
    record:
      "WALKTHROUGH: click Connect → Mezo Passport opens → pick your BTC wallet (Xverse/Unisat/OKX) → approve. Show your Mezo address land in the nav. Narrate as onboarding a brand-new user.",
    durationInFrames: sec(10),
    // clip: "01-connect.mp4",
  },
  {
    id: "d2",
    step: "02 · Fund payroll",
    caption: "Post BTC, borrow mUSD — your payroll treasury",
    record:
      "WALKTHROUGH: open the treasury panel → enter BTC collateral + how much mUSD to borrow → confirm in wallet → show collateral, mUSD balance and health factor update. Frame it as 'set up your treasury — your BTC keeps working, you never sell.'",
    durationInFrames: sec(14),
    // clip: "02-fund-treasury.mp4",
  },
  {
    id: "d3",
    step: "03 · Add your team",
    caption: "Add an employee, set a salary — streaming starts",
    record:
      "WALKTHROUGH: add an employee (paste address + set rate) → start the stream → show the per-second accrual counter begin ticking on the worker card. Frame as 'now you're paying someone — by the second.'",
    durationInFrames: sec(14),
    // clip: "03-add-team.mp4",
  },
  {
    id: "d4",
    step: "04 · Get paid",
    caption: "Your team claims mUSD anytime — paid by the second",
    record:
      "WALKTHROUGH (employee's view): open the dashboard → watch salary accrue live → click Claim → approve → mUSD balance increases. Frame as 'this is what your employee sees — they claim whenever they want.'",
    durationInFrames: sec(12),
    // clip: "04-claim.mp4",
  },
  {
    id: "d5",
    step: "05 · Set & forget",
    caption: "Auto-protection keeps your treasury safe",
    record:
      "WALKTHROUGH: show the health factor → trigger the BTC stress control → health dips → the keeper auto-rebalances → healthy again. Frame as 'you never babysit it — if BTC drops, Sat Salary protects your treasury and payroll keeps running.'",
    durationInFrames: sec(10),
    // clip: "05-protect.mp4",
  },
];
