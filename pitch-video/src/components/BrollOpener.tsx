import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/**
 * Full-bleed AI b-roll that opens a scene, then dissolves out to reveal the type
 * underneath. A gradient + vignette grade it into the dark deck so it never reads
 * as dropped-in stock. Unmounts after `hold` so it costs nothing for the rest of
 * the scene. The clip plays from its own first frame (scene start == clip start).
 */
export const BrollOpener = ({
  clip,
  hold = 100,
  fade = 22,
}: {
  clip: string;
  hold?: number;
  fade?: number;
}) => {
  const f = useCurrentFrame();
  if (f >= hold) return null;
  const opacity = interpolate(f, [0, 10, hold - fade, hold], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity, zIndex: 20 }}>
      <OffthreadVideo
        src={staticFile(clip)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,0.35) 0%, rgba(8,8,10,0) 35%, rgba(8,8,10,0.6) 100%)",
        }}
      />
      <AbsoluteFill
        style={{ boxShadow: "inset 0 0 320px 90px rgba(0,0,0,0.72)" }}
      />
    </AbsoluteFill>
  );
};
