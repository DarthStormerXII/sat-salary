import { D } from "../constants";
import { COLORS } from "../theme";
import { Headline, Kicker, SceneWrap, Stat } from "../components/ui";

// 0:15–0:40 — PROBLEM. One problem, sized big and simple (Marshall: stick to one).
export const Problem = () => {
  return (
    <SceneWrap dur={D.problem} align="flex-start">
      <Kicker delay={0}>The Problem</Kicker>
      <Headline
        text="Every payday, treasuries face the same trap."
        delay={6}
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
          delay={40}
        />
        <div style={{ maxWidth: 560 }}>
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
            A taxable event. A locked-in price. The upside you were holding for
            — gone.
          </div>
        </div>
      </div>
    </SceneWrap>
  );
};
