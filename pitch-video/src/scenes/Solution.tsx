import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { FlowNode, MeshGlow, PulseDot, drawPath } from "../components/viz";
import { fadeUp } from "../utils";

// 0:40–1:00 — SOLUTION. The circular Bitcoin economy as an animated flow diagram:
// Post BTC → Borrow mUSD → Stream payroll, with a green yield loop returning to
// "Borrow" (the 1% offset). Forward = orange value pulses; return = green yield pulse.
const FWD_A = "M330,150 L600,150"; // Post BTC -> Borrow
const FWD_B = "M900,150 L1170,150"; // Borrow -> Stream
const LOOP = "M1320,250 C1320,348 750,348 750,250"; // Stream -> Borrow (yield)

export const Solution = () => {
  const f = useCurrentFrame();
  return (
    <SceneWrap dur={D.solution} align="flex-start">
      <MeshGlow />
      <Kicker delay={0}>The Solution</Kicker>
      <Headline
        text="Sat Salary turns your Bitcoin into a payroll engine."
        delay={6}
        size={68}
        accentWords={["payroll", "engine."]}
        maxWidth={1500}
      />

      {/* Flow stage — fixed 1500×380 coordinate space shared by nodes + SVG. */}
      <div
        style={{
          position: "relative",
          width: 1500,
          height: 380,
          marginTop: 40,
        }}
      >
        {/* perspective floor for depth */}
        <div
          style={{
            position: "absolute",
            inset: "120px 0 0 0",
            backgroundImage:
              "linear-gradient(rgba(247,147,26,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,0.10) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: "perspective(900px) rotateX(62deg)",
            transformOrigin: "center top",
            maskImage: "linear-gradient(black, transparent 70%)",
            WebkitMaskImage: "linear-gradient(black, transparent 70%)",
            opacity: 0.6,
          }}
        />

        {/* connectors (behind nodes) */}
        <svg
          width={1500}
          height={380}
          viewBox="0 0 1500 380"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflow: "visible",
          }}
        >
          <path
            d={FWD_A}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={3}
            strokeLinecap="round"
            {...drawPath(f, 42, 16, 270)}
          />
          <path
            d={FWD_B}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={3}
            strokeLinecap="round"
            {...drawPath(f, 58, 16, 270)}
          />
          <path
            d={LOOP}
            fill="none"
            stroke={COLORS.green}
            strokeWidth={3}
            strokeLinecap="round"
            {...drawPath(f, 78, 26, 760)}
          />
        </svg>

        {/* nodes */}
        <div style={{ position: "absolute", left: 30, top: 64, zIndex: 2 }}>
          <FlowNode
            icon="₿"
            label="Post BTC"
            note="collateral stays yours"
            delay={8}
          />
        </div>
        <div style={{ position: "absolute", left: 600, top: 64, zIndex: 2 }}>
          <FlowNode
            icon="$"
            label="Borrow mUSD"
            note="1% fixed on Mezo"
            delay={26}
          />
        </div>
        <div style={{ position: "absolute", left: 1170, top: 64, zIndex: 2 }}>
          <FlowNode
            icon="⇶"
            label="Stream payroll"
            note="per second, in mUSD"
            delay={44}
          />
        </div>

        {/* loop label */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 320,
            textAlign: "center",
            zIndex: 2,
            fontFamily: mono,
            fontSize: 24,
            color: COLORS.green,
            ...fadeUp(f, 92, 14),
          }}
        >
          ↩ Mezo Earn yield offsets the borrow cost
        </div>

        {/* travelling pulses (on top) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: 1500,
            height: 380,
            zIndex: 3,
          }}
        >
          <PulseDot d={FWD_A} start={60} dur={46} />
          <PulseDot d={FWD_B} start={74} dur={46} />
          <PulseDot
            d={LOOP}
            start={96}
            dur={80}
            color={COLORS.green}
            size={16}
          />
        </div>
      </div>

      <div
        style={{
          ...fadeUp(f, 104, 16),
          marginTop: 18,
          fontFamily: mono,
          fontSize: 30,
          color: COLORS.green,
          background: "rgba(61,220,132,0.08)",
          border: "1px solid rgba(61,220,132,0.35)",
          borderRadius: 14,
          padding: "16px 26px",
        }}
      >
        payroll funds itself · net cost ≈ 0%
      </div>
    </SceneWrap>
  );
};
