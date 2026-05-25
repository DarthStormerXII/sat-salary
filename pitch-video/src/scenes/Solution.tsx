import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { Headline, Kicker, SceneWrap, StepChip } from "../components/ui";
import { fadeUp } from "../utils";
import { mono } from "../fonts";

// 0:40–1:00 — SOLUTION. One sentence, end-user POV, then the 3-step flow + yield loop.
export const Solution = () => {
  const f = useCurrentFrame();
  return (
    <SceneWrap dur={D.solution} align="flex-start">
      <Kicker delay={0}>The Solution</Kicker>
      <Headline
        text="Sat Salary turns your Bitcoin into a payroll engine."
        delay={6}
        size={72}
        accentWords={["payroll", "engine."]}
        maxWidth={1500}
      />
      <div
        style={{
          display: "flex",
          gap: 34,
          marginTop: 64,
          alignItems: "stretch",
        }}
      >
        <StepChip
          index={1}
          label="Post BTC"
          note="collateral stays yours"
          delay={36}
        />
        <Arrow delay={48} />
        <StepChip
          index={2}
          label="Borrow mUSD"
          note="1% fixed on Mezo"
          delay={52}
        />
        <Arrow delay={64} />
        <StepChip
          index={3}
          label="Stream payroll"
          note="per-second, in mUSD"
          delay={68}
        />
      </div>
      <div
        style={{
          ...fadeUp(f, 84, 16),
          marginTop: 48,
          fontFamily: mono,
          fontSize: 32,
          color: COLORS.green,
          background: "rgba(61,220,132,0.08)",
          border: "1px solid rgba(61,220,132,0.35)",
          borderRadius: 14,
          padding: "18px 28px",
        }}
      >
        BTC keeps earning → offsets the 1% → payroll funds itself (net cost ≈
        0%)
      </div>
    </SceneWrap>
  );
};

const Arrow = ({ delay }: { delay: number }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        ...fadeUp(f, delay, 12),
        display: "flex",
        alignItems: "center",
        fontSize: 48,
        color: COLORS.accent,
      }}
    >
      →
    </div>
  );
};
