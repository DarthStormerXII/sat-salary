import { AbsoluteFill, useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { Headline, Kicker, SceneWrap, Stat } from "../components/ui";
import { BrollOpener } from "../components/BrollOpener";
import { fadeUp } from "../utils";

// 0:15–0:40 — PROBLEM. Opens on the "wound" b-roll (founder, night, dread), which
// dissolves into the type. One problem, sized big and simple (Marshall: stick to one).
const HOLD = 100; // frames the wound clip holds before clearing to the type

export const Problem = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SceneWrap dur={D.problem} align="flex-start">
        <Kicker delay={HOLD - 28}>The Problem</Kicker>
        <Headline
          text="Every payday, treasuries face the same trap."
          delay={HOLD - 20}
          size={78}
          accentWords={["trap"]}
          maxWidth={1450}
        />
        <div
          style={{
            display: "flex",
            gap: 120,
            marginTop: 70,
            alignItems: "flex-end",
          }}
        >
          {/* NOTE: verify/update this figure before recording — see PITCH.md. */}
          <Stat
            value="1,000,000+ BTC"
            caption="held in corporate treasuries — meant to be held, not spent."
            delay={HOLD + 12}
          />
          <div style={{ ...fadeUp(f, HOLD + 24, 16), maxWidth: 560 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: COLORS.text,
                lineHeight: 1.3,
              }}
            >
              So to make payroll, you sell.
            </div>
            <div
              style={{
                fontSize: 34,
                color: COLORS.textDim,
                marginTop: 16,
                lineHeight: 1.4,
              }}
            >
              A taxable event. A locked-in price. The upside you were holding
              for — gone.
            </div>
          </div>
        </div>
      </SceneWrap>

      <BrollOpener clip="broll/wound.mp4" hold={HOLD} />
    </AbsoluteFill>
  );
};
