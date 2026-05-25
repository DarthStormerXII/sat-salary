# Asset drop folders

Drop your real media here, then flip the matching flags/paths in `src/`.

## `demo/` — app screen recordings (the placeholders)
Record each shot from the **live app**, export as **.mp4 (H.264), 1920×1080, 30fps**, and name them:

| File | Shot | Set in |
|---|---|---|
| `01-connect.mp4`     | Connect via Mezo Passport        | `src/demoShots.ts` → d1 `clip` |
| `02-open-trove.mp4`  | Post BTC, borrow mUSD            | `src/demoShots.ts` → d2 `clip` |
| `03-stream.mp4`      | Create payroll stream           | `src/demoShots.ts` → d3 `clip` |
| `04-claim.mp4`       | Employee claims mUSD            | `src/demoShots.ts` → d4 `clip` |
| `05-rebalance.mp4`   | BTC stress → keeper rebalance   | `src/demoShots.ts` → d5 `clip` |

Uncomment the `clip:` line for each shot once the file exists. Until then, a
labeled placeholder renders in its place.

**Trim each clip to its shot length** (10–14s — see `durationInFrames` in
`demoShots.ts`). If a clip is longer than its slot it gets cut off; if shorter,
the last frame freezes. Record at 30fps to match the composition (no judder).

## `audio/` — voiceover + music
- `voiceover.mp3` — the narration (script in `../PITCH.md`). Then set `HAS_VOICEOVER = true` in `src/constants.ts`.
- `music.mp3` — low bed (optional). Then set `HAS_MUSIC = true`.

Normalize VO before dropping it in:
```bash
ffmpeg -i raw-vo.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 voiceover.mp3
```

## `brand/` — optional
- Team photos for the Team scene (wire paths into `MEMBERS` in `src/scenes/Team.tsx`).
- `logo.png` if you want to swap the text wordmark for the real Sat Salary mark.
