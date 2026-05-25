import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

/**
 * Persistent cinematic background: deep black, a slowly breathing orange radial
 * glow (so content "emanates from something", per ui-rules dark-hero rule),
 * a faint grid, and a vignette. Sits behind every scene.
 */
export const Bg = () => {
  const frame = useCurrentFrame();
  // Very slow breathe over ~6s loop.
  const breathe = interpolate(frame % 180, [0, 90, 180], [0.85, 1.05, 0.85]);
  const drift = interpolate(frame % 600, [0, 600], [0, 40]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      {/* breathing radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift / 10}% 38%, rgba(247,147,26,0.18), rgba(247,147,26,0.05) 30%, transparent 60%)`,
          transform: `scale(${breathe})`,
          opacity: 0.9,
        }}
      />
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at 50% 45%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black, transparent 75%)",
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 380px 120px rgba(0,0,0,0.85)",
        }}
      />
    </AbsoluteFill>
  );
};
