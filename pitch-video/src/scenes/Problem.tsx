import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { BrollOpener } from "../components/BrollOpener";
import { Counter } from "../components/viz";
import { fadeUp } from "../utils";

// 0:15–0:40 — PROBLEM. Opens on the "wound" b-roll, dissolves to the type:
// a counting stat + a treasury column that visibly sells off each payday.
const HOLD = 100;

export const Problem = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneWrap dur={D.problem} align="flex-start">
        <Kicker delay={HOLD - 28}>The Problem</Kicker>
        <Headline
          text="Every payday, treasuries face the same trap."
          delay={HOLD - 20}
          size={76}
          accentWords={["trap"]}
          maxWidth={1450}
        />

        <div
          style={{
            display: "flex",
            gap: 130,
            marginTop: 64,
            alignItems: "center",
          }}
        >
          <div style={{ ...fadeUp(f, HOLD + 8, 16) }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 116,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: -3,
                color: COLORS.accent,
              }}
            >
              <Counter value={1000000} start={HOLD + 8} dur={42} suffix="+" />{" "}
              BTC
            </div>
            <div
              style={{
                fontSize: 32,
                color: COLORS.textDim,
                marginTop: 18,
                maxWidth: 620,
              }}
            >
              held in corporate treasuries — meant to be held, not spent.
            </div>
          </div>

          <SellOffStack startAt={HOLD + 30} />
        </div>
      </SceneWrap>

      <BrollOpener clip="broll/wound.mp4" hold={HOLD} />
    </AbsoluteFill>
  );
};

// A stacked treasury where the top blocks peel off and fall — "sold to make payroll".
const SellOffStack = ({ startAt }: { startAt: number }) => {
  const f = useCurrentFrame();
  const COUNT = 7;
  const SELLS = 4; // top 4 blocks get sold off
  const header = fadeUp(f, startAt - 6, 14);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          ...header,
          fontFamily: mono,
          fontSize: 24,
          color: COLORS.red,
          marginBottom: 8,
        }}
      >
        sold to make payroll →
      </div>
      {Array.from({ length: COUNT }).map((_, i) => {
        const isSold = i < SELLS;
        const sellFrame = startAt + (SELLS - 1 - i) * 9;
        const s = isSold
          ? interpolate(f, [sellFrame, sellFrame + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;
        const appear = interpolate(
          f,
          [startAt - 10 + i * 3, startAt + 4 + i * 3],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        return (
          <div
            key={i}
            style={{
              width: 300,
              height: 34,
              borderRadius: 7,
              background: s > 0.5 ? "transparent" : `${COLORS.accent}cc`,
              border: `2px solid ${s > 0.5 ? COLORS.red : COLORS.accent}`,
              opacity: appear * (1 - s * 0.75),
              transform: `translate(${s * 90}px, ${s * 80}px) rotate(${s * 10}deg)`,
            }}
          />
        );
      })}
      <div
        style={{
          ...fadeUp(f, startAt + 44, 14),
          fontSize: 28,
          color: COLORS.textDim,
          marginTop: 12,
          maxWidth: 320,
        }}
      >
        A taxable event. A locked-in price. The upside — gone.
      </div>
    </div>
  );
};
