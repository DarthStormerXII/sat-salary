import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { BrandMark, Headline, SceneWrap, Sub } from "../components/ui";
import { MeshGlow, Particles } from "../components/viz";
import { fadeUp } from "../utils";

// 0:00–0:15 — HOOK. Anchor line in the first ~10s (Marshall: hook in 15s).
export const Hook = () => {
  const f = useCurrentFrame();
  const underline = interpolate(f, [34, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <MeshGlow />
      <Particles count={20} />
      <SceneWrap dur={D.hook} align="flex-start">
        <div style={{ ...fadeUp(f, 0, 12), marginBottom: 54 }}>
          <BrandMark delay={0} size={52} />
        </div>
        <Headline
          text="Pay your team without selling a satoshi."
          delay={8}
          size={104}
          accentWords={["satoshi."]}
        />
        <div
          style={{
            marginTop: 18,
            width: 520,
            height: 4,
            borderRadius: 4,
            background: `linear-gradient(90deg, ${COLORS.accent}, transparent)`,
            transform: `scaleX(${underline})`,
            transformOrigin: "left center",
          }}
        />
        <Sub delay={48} size={42}>
          Today, making payroll means selling the Bitcoin you are trying to
          hold.
        </Sub>
        <div
          style={{
            ...fadeUp(f, 68, 16),
            marginTop: 40,
            fontSize: 30,
            color: COLORS.textFaint,
          }}
        >
          Sat Salary fixes that.
        </div>
      </SceneWrap>
    </AbsoluteFill>
  );
};
