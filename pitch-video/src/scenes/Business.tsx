import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { MeshGlow, PulseDot, drawPath } from "../components/viz";
import { fadeUp, popScale, stagger } from "../utils";

// 2:20–2:45 — WHY IT MATTERS. ICP + a radial diagram: every salary stream feeds
// the Mezo hub (mUSD borrowed + BTC locked), value accruing into the network.
const S1 = "M150,90 C320,90 380,170 470,200";
const S2 = "M150,210 L470,210";
const S3 = "M150,330 C320,330 380,250 470,220";

export const Business = () => {
  const f = useCurrentFrame();
  const points = [
    {
      k: "Start with",
      v: "Bitcoin-native startups & remote crypto teams paying salaries today.",
    },
    {
      k: "Every stream",
      v: "borrows mUSD and locks BTC as collateral — the activity Mezo is built for.",
    },
    {
      k: "For Mezo",
      v: "real mUSD demand, real collateral TVL, real-world utility for Bitcoin.",
    },
  ];
  return (
    <SceneWrap dur={D.business} align="flex-start">
      <MeshGlow />
      <Kicker delay={0}>Why It Matters</Kicker>
      <Headline
        text="Built for Bitcoin teams. Built for Mezo."
        delay={6}
        size={66}
        accentWords={["Mezo."]}
        maxWidth={1500}
      />

      <div
        style={{
          display: "flex",
          gap: 90,
          marginTop: 40,
          alignItems: "center",
        }}
      >
        <HubDiagram />
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {points.map((p, i) => (
            <div
              key={i}
              style={{
                ...fadeUp(f, stagger(60, i, 12), 16),
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxWidth: 660,
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 24,
                  color: COLORS.accent,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {p.k}
              </span>
              <span
                style={{ fontSize: 36, color: COLORS.text, lineHeight: 1.3 }}
              >
                {p.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SceneWrap>
  );
};

const HubDiagram = () => {
  const f = useCurrentFrame();
  const R = 64;
  const circ = 2 * Math.PI * R;
  const fill = drawPath(f, 60, 90, circ); // ring fills as streams arrive
  const hubPop = popScale(f, 20);
  const sat = (delay: number) => popScale(f, delay);
  return (
    <div style={{ position: "relative", width: 620, height: 420 }}>
      <svg
        width={620}
        height={420}
        viewBox="0 0 620 420"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {[S1, S2, S3].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={COLORS.border}
            strokeWidth={2.5}
            {...drawPath(f, 30 + i * 8, 18, 460)}
          />
        ))}
        {/* hub accrual ring */}
        <circle
          cx={510}
          cy={210}
          r={R}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={5}
          strokeLinecap="round"
          transform="rotate(-90 510 210)"
          {...fill}
        />
      </svg>

      {/* satellite stream nodes */}
      {[90, 210, 330].map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 20,
            top: y - 26,
            opacity: sat(28 + i * 6),
            transform: `scale(${0.8 + sat(28 + i * 6) * 0.2})`,
            background: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontFamily: mono,
            fontSize: 22,
            color: COLORS.textDim,
            whiteSpace: "nowrap",
          }}
        >
          salary stream
        </div>
      ))}

      {/* hub */}
      <div
        style={{
          position: "absolute",
          left: 510 - 64,
          top: 210 - 64,
          width: 128,
          height: 128,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.panelSoft}, ${COLORS.bgAlt})`,
          border: `1px solid ${COLORS.borderAccent}`,
          boxShadow: `0 0 70px -10px ${COLORS.accent}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: hubPop,
          transform: `scale(${0.7 + hubPop * 0.3})`,
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.accent,
            letterSpacing: 1,
          }}
        >
          MEZO
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 14,
            color: COLORS.textDim,
            marginTop: 4,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          mUSD borrowed
          <br />
          BTC locked
        </div>
      </div>

      {/* inward value pulses */}
      <div style={{ position: "absolute", inset: 0, width: 620, height: 420 }}>
        <PulseDot d={S1} start={62} dur={64} size={14} />
        <PulseDot d={S2} start={72} dur={64} size={14} />
        <PulseDot d={S3} start={82} dur={64} size={14} />
      </div>
    </div>
  );
};
