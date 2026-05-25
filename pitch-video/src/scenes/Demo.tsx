import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { CaptionBar, PlaceholderSlot } from "../components/ui";
import { DEMO_SHOTS, type DemoShot } from "../demoShots";

// 1:00–2:00 — DEMO. The product working, live on Mezo. Each shot is a labeled slot:
// shows a placeholder until you set `clip` in demoShots.ts, then plays the recording.
export const Demo = () => {
  const f = useCurrentFrame();
  const intro = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const outro = interpolate(f, [D.demo - 12, D.demo], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: Math.min(intro, outro) }}>
      <Series>
        {DEMO_SHOTS.map((shot) => (
          <Series.Sequence
            key={shot.id}
            durationInFrames={shot.durationInFrames}
          >
            <DemoShotView shot={shot} />
          </Series.Sequence>
        ))}
      </Series>
      {/* persistent "live" badge across the whole demo */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 64,
          fontFamily: mono,
          fontSize: 24,
          color: COLORS.text,
          background: "rgba(8,8,10,0.7)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 999,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: COLORS.green,
            boxShadow: `0 0 14px ${COLORS.green}`,
          }}
        />
        LIVE ON MEZO TESTNET
      </div>
    </AbsoluteFill>
  );
};

const DemoShotView = ({ shot }: { shot: DemoShot }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgAlt }}>
      {shot.clip ? (
        <OffthreadVideo src={staticFile(`demo/${shot.clip}`)} />
      ) : (
        <PlaceholderSlot record={shot.record} />
      )}
      <CaptionBar step={shot.step} caption={shot.caption} />
    </AbsoluteFill>
  );
};
