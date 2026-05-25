import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { fadeUp, stagger } from "../utils";

// 2:20–2:45 — WHY IT MATTERS. ICP (never "everybody") + value back to the Mezo ecosystem.
export const Business = () => {
  const f = useCurrentFrame();
  const points = [
    {
      k: "Start with",
      v: "Bitcoin-native startups & remote crypto teams paying salaries today.",
    },
    {
      k: "Every stream",
      v: "borrows mUSD and locks BTC as collateral — the exact activity Mezo is built for.",
    },
    {
      k: "For Mezo",
      v: "real mUSD demand, real collateral TVL, real-world utility for Bitcoin.",
    },
  ];
  return (
    <SceneWrap dur={D.business} align="flex-start">
      <Kicker delay={0}>Why It Matters</Kicker>
      <Headline
        text="Built for Bitcoin teams. Built for Mezo."
        delay={6}
        size={70}
        accentWords={["Mezo."]}
        maxWidth={1500}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          marginTop: 56,
        }}
      >
        {points.map((p, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(f, stagger(38, i, 12), 16),
              display: "flex",
              alignItems: "baseline",
              gap: 28,
              fontSize: 40,
              lineHeight: 1.35,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 26,
                color: COLORS.accent,
                minWidth: 220,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {p.k}
            </span>
            <span style={{ color: COLORS.text, maxWidth: 1180 }}>{p.v}</span>
          </div>
        ))}
      </div>
    </SceneWrap>
  );
};
