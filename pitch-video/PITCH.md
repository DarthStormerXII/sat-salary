# Sat Salary — 3-Minute Pitch Video Playbook

Everything you need to finish the pitch video: the script (what to say), the demo
recording script (what to do on screen), and how to render. The Remotion project
in `src/` already lays out all 7 sections — the demo section is **placeholders**
waiting for your real app recordings.

---

## Why it's built this way (the two sources)

**Mezo's own pitch workshop (Emmanuel Marshall, Validation Cloud — the hackathon
pitch coach):**
- The hackathon pitch is **3 minutes**. **Hook in the first 15 seconds** or they stop watching.
- Judges score **business viability over technical** — *"the best technical solution is not always the best idea."*
- Structure: **Team → Problem (just ONE, sized big & simple) → Solution (one sentence, end-user POV) → short Demo → Users/ICP → why it matters for the Mezo ecosystem.**
- **Bookend with the same anchor sentence** so it sticks. Ours: *"Pay your team without ever selling a satoshi."*
- Demo: **keep it short, pick only the most impactful moments, show the user outcome — not the tech.** Rehearse 20–50×; make sure it runs even offline.
- Slides: **every word costs $100.** Fewer words, more impact. Keep your own voice — don't let AI flatten it.

**Motion-video council (craft layer):** 8-beat spine, the **three-texture rule**
(Remotion graphics + real screen capture + restraint), **30fps locked**, *"Remotion
owns text/UI/captions/logos; real capture owns the demo,"* **silence is a beat**,
and the no-AI-slop checklist. We use 30fps (not 24) on purpose — it matches screen
recordings and avoids UI judder.

---

## Structure & timecodes (180s total)

| # | Section | Time | Job | Maps to Mezo criterion |
|---|---|---|---|---|
| 1 | Hook | 0:00–0:15 | Anchor line + the wound | Business viability |
| 2 | Problem | 0:15–0:40 | One problem, sized big | Business viability |
| 3 | Solution | 0:40–1:00 | One sentence, end-user POV | Viability + Integration |
| 4 | **Demo (placeholders)** | 1:00–2:00 | Product working, live on Mezo | Mezo Integration + Technical |
| 5 | Team | 2:00–2:20 | Why you're the team to back | (Marshall: ~50% of the bet) |
| 6 | Why Mezo | 2:20–2:45 | ICP + value to the ecosystem | Business viability |
| 7 | Close | 2:45–3:00 | Repeat anchor line + CTA + sting | Presentation |

---

## FULL VOICEOVER TRANSCRIPT (record this)

Pace ≈ 150 wpm, dry and declarative — **no smile in the voice, no up-talk.** Let the
screen breathe; don't read the on-screen text verbatim. `[ … ]` = fill in your real details.

### 1 · HOOK — 0:00–0:15
> "Pay your team — without ever selling a satoshi.
> Because right now, every Bitcoin treasury hits the same wall: when payday comes, the only way to pay people is to sell the asset you're trying to hold."

### 2 · PROBLEM — 0:15–0:40
> "Companies are holding more Bitcoin than ever — over a million coins sit in corporate treasuries, meant to be held, not spent.
> But payroll doesn't wait. So every cycle forces an impossible trade: sell your Bitcoin to pay salaries — a taxable event, at a locked-in price — and hand back the upside you were holding for in the first place."

### 3 · SOLUTION — 0:40–1:00
> "Sat Salary turns that same Bitcoin into a payroll engine.
> You post BTC as collateral, borrow mUSD against it at one percent on Mezo, and stream salaries to your team in real time.
> Your Bitcoin never leaves — and it keeps earning, offsetting the borrow cost, so payroll funds itself."

### 4 · DEMO — 1:00–2:00 *(narrate over your screen recordings — see the recording script below)*
- **01 · Connect (1:00–1:10):** "Here it is, live on Mezo. Your team connects with a Bitcoin wallet — Passport handles everything from there."
- **02 · Post BTC, borrow mUSD (1:10–1:24):** "The company posts BTC and borrows mUSD in a single step. No selling, no middleman — the collateral stays yours, on-chain."
- **03 · Stream payroll (1:24–1:38):** "Add your team, set a salary, and the stream begins. Every employee earns mUSD by the second — not once a month."
- **04 · Claim (1:38–1:50):** "An employee opens their dashboard and claims real mUSD whenever they want — a paycheck that arrives continuously."
- **05 · Auto-protect (1:50–2:00):** "And if Bitcoin drops? A keeper rebalances the position automatically, on-chain. Payroll keeps running — zero liquidation risk."

### 5 · TEAM — 2:00–2:20  ⚠️ FILL THIS IN — do NOT let AI write it
> "You don't bet on an idea — you bet on the team.
> We're [names]. We've [shipped X / built Y in crypto and AI / prior startups].
> We built Sat Salary because we've lived this problem — and we're the team to take it all the way."

### 6 · WHY MEZO — 2:20–2:45
> "We're starting where the pain is sharpest: Bitcoin-native startups and remote crypto teams running payroll today.
> And here's why it matters for Mezo — every salary we stream borrows mUSD and locks BTC as collateral.
> As Sat Salary grows, it drives exactly the activity Mezo is built for: real stablecoin demand, real collateral, and real-world utility for Bitcoin."

### 7 · CLOSE — 2:45–3:00
> "Payroll is the first bill every company pays. Sat Salary makes it the first real thing Bitcoin can do for them.
> Pay your team — without ever selling a satoshi.
> Try it at sat-salary-mezo.vercel.app."

*(Then ~2s of silence under the logo sting — let it land.)*

---

## DEMO RECORDING SCRIPT — what to actually DO on screen

Record from the **live testnet app** with the finished build. **Capture at 1920×1080, 30fps**
(Screen Studio / QuickTime / OBS). Use a clean wallet, hide seed phrases, zoom the
browser to ~125% so text is legible at video size. Rehearse each take until it's
clean — you're trimming to 10–14 seconds per shot, so there's no room for fumbling.

> The on-screen captions and the "LIVE ON MEZO TESTNET" badge are added **by Remotion
> on top** of your recording — so you don't need to add any text in the recording itself.
> Just capture the raw screen action.

### Shot 01 — Connect (target 10s) → `public/demo/01-connect.mp4`
**Do:** From the landing/dashboard, click **Connect** → the **Mezo Passport** modal opens →
pick a Bitcoin wallet (Xverse/Unisat/OKX) → approve the signature → show the derived
**Mezo address** appear in the nav. **End on** the connected state.
**Why it's first:** proves the mandatory Passport + BTC-wallet integration immediately.

### Shot 02 — Post BTC, borrow mUSD (target 14s) → `public/demo/02-open-trove.mp4`
**Do:** Open the trove / borrow flow → enter **BTC collateral** + **mUSD** amount →
confirm the tx in the wallet → the trove opens, **mUSD balance** and **health factor**
update on the dashboard. **Then cut** to the Mezo explorer showing the real tx hash.
**Capture the explorer tab** — the on-chain proof is the point.

### Shot 03 — Stream payroll (target 14s) → `public/demo/03-stream.mp4`
**Do:** Add an employee (paste address + set a rate) → submit the **create-stream** tx →
approve → show the **per-second accrual counter** start ticking live on the worker card.
**Let it tick for ~3s** on camera — the live counter is the "wow".

### Shot 04 — Claim (target 12s) → `public/demo/04-claim.mp4`
**Do:** Switch to the **employee wallet** → open their dashboard → click **Claim** →
approve → the employee's **mUSD balance increases**. Cut to the explorer tx.
**Show it's a different account** claiming — that sells "real payroll", not a self-demo.

### Shot 05 — Auto-protect / keeper (target 10s) → `public/demo/05-rebalance.mp4`
**Do:** Trigger the **BTC stress** control → **health factor dips** toward the threshold →
the **keeper fires `rebalance()`** → position restored to target ratio. Cut to the
**rebalance tx** on the explorer. **End on** the healthy position.
**Why last:** it's the differentiator — "no liquidation risk" shown as a live mechanism.

### Recording checklist
- [ ] Clean browser profile, no personal tabs/bookmarks, 125% zoom.
- [ ] Wallet funded so every tx confirms fast; rehearse so nothing reverts on camera.
- [ ] Each take trimmed to its shot length (see `durationInFrames` in `src/demoShots.ts`).
- [ ] Real explorer tx hashes visible in shots 02, 04, 05 (on-chain proof).
- [ ] Mouse movement deliberate and slow — no frantic cursor.
- [ ] Export H.264 .mp4, 30fps, name per the table in `public/README.md`.

---

## Numbers to verify before recording
- ⚠️ **"over a million BTC in corporate treasuries"** (Problem scene + VO) — update to the
  current, citable figure before you record. Edit the `Stat` in `src/scenes/Problem.tsx`
  and the matching VO line. Don't ship a number you can't defend if a judge asks.

---

## How to render

```bash
cd pitch-video
npm install

# Preview / iterate in the studio (placeholders visible):
npm run studio

# Quick still to sanity-check a frame:
npm run still            # -> out/preview.png  (frame 20)

# Final video (single-threaded for reliability with video clips):
npm run render           # -> out/sat-salary-pitch.mp4
```

**Workflow:** render once now to verify it plays end-to-end with placeholders →
record the 5 demo clips → drop them in `public/demo/` and set each `clip` in
`src/demoShots.ts` → record + normalize the VO, set `HAS_VOICEOVER = true` →
re-render. Then run it past the smell test: after watching, can someone recite
(a) the product name, (b) one outcome, (c) one image? If not, recut.
