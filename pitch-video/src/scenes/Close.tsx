import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { BrandMark, Headline } from "../components/ui";
import { fadeIn, fadeUp } from "../utils";
import { AbsoluteFill } from "remotion";

// 2:45–3:00 — CLOSE. Repeat the anchor line (sticks in the brain), CTA, sting + silence.
export const Close = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(
          fadeIn(f, 0, 12),
          // hold to the very end (no fade-out — land the plane)
          1,
        ),
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
          ...fadeUp(f, 4, 14),
          marginBottom: 28,
        }}
      >
        Payroll is the first bill every company pays.
      </div>
      <Headline
        text="Pay your team without selling a satoshi."
        delay={14}
        size={92}
        maxWidth={1500}
        accentWords={["satoshi."]}
      />
      <div
        style={{
          ...fadeUp(f, 58, 16),
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
        <BrandMark delay={86} size={58} />
      </div>
    </AbsoluteFill>
  );
};
