import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { BrandMark, Headline } from "../components/ui";
import { BrollOpener } from "../components/BrollOpener";
import { fadeIn, fadeUp } from "../utils";

// 2:45–3:00 — CLOSE. Opens on the "relief" b-roll (same founder, calm, dawn) — the
// payoff of the wound — then dissolves to the repeated anchor line, CTA, sting + silence.
const HOLD = 95;

export const Close = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: fadeIn(f, 0, 12), // no fade-out — land the plane
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 160px",
          color: COLORS.text,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 26,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: COLORS.textFaint,
            ...fadeUp(f, HOLD - 22, 14),
            marginBottom: 28,
          }}
        >
          Payroll is the first bill every company pays.
        </div>
        <Headline
          text="Pay your team without selling a satoshi."
          delay={HOLD - 12}
          size={92}
          maxWidth={1500}
          accentWords={["satoshi."]}
        />
        <div
          style={{
            ...fadeUp(f, HOLD + 30, 16),
            marginTop: 56,
            fontFamily: mono,
            fontSize: 40,
            color: COLORS.accent,
            border: `1px solid ${COLORS.borderAccent}`,
            borderRadius: 14,
            padding: "16px 34px",
          }}
        >
          sat-salary-mezo.vercel.app
        </div>
        <div style={{ marginTop: 70 }}>
          <BrandMark delay={HOLD + 60} size={58} />
        </div>
      </AbsoluteFill>

      <BrollOpener clip="broll/relief.mp4" hold={HOLD} />
    </AbsoluteFill>
  );
};
