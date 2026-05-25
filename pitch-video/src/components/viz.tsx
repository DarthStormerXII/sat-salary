import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { popScale } from "../utils";

const OUT = Easing.out(Easing.cubic);
const INOUT = Easing.inOut(Easing.cubic);

/** Frame-driven count-up number (mono). */
export const Counter = ({
  value,
  start,
  dur = 45,
  prefix = "",
  suffix = "",
}: {
  value: number;
  start: number;
  dur?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  return (
    <>
      {prefix}
      {Math.round(value * p).toLocaleString("en-US")}
      {suffix}
    </>
  );
};

/** Returns stroke-dasharray/offset to "draw" an SVG path of length `len` in. */
export const drawPath = (
  f: number,
  start: number,
  dur: number,
  len: number,
) => ({
  strokeDasharray: len,
  strokeDashoffset:
    len *
    (1 -
      interpolate(f, [start, start + dur], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: INOUT,
      })),
});

/**
 * A glowing dot that travels a CSS offset-path. Place inside a relatively-
 * positioned box whose pixel size matches the SVG viewBox the `d` was authored in.
 */
export const PulseDot = ({
  d,
  start,
  dur = 60,
  color = COLORS.accent,
  size = 18,
}: {
  d: string;
  start: number;
  dur?: number;
  color?: string;
  size?: number;
}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const t = ((((f - start) % dur) + dur) % dur) / dur;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size}px ${size / 2}px ${color}`,
        offsetPath: `path('${d}')`,
        offsetDistance: `${t * 100}%`,
        offsetRotate: "0deg",
      }}
    />
  );
};

/** Consistent isometric/3D tilt for cards & stages. */
export const iso = (rotX = 8, rotY = -16, z = 0): CSSProperties => ({
  transform: `perspective(1600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${z}px)`,
  transformStyle: "preserve-3d",
});

/** A depth card that flips in (rotateY) on a spring. */
export const FlipCard = ({
  delay,
  children,
  width,
  style,
}: {
  delay: number;
  children: ReactNode;
  width?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const s = popScale(f, delay);
  return (
    <div
      style={{
        width,
        opacity: s,
        transform: `perspective(1500px) rotateY(${(1 - s) * -35}deg) translateY(${(1 - s) * 26}px)`,
        transformOrigin: "left center",
        background: `linear-gradient(155deg, ${COLORS.panelSoft}, ${COLORS.panel})`,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        boxShadow: "0 30px 70px -30px rgba(0,0,0,0.7)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Animated aurora / mesh glow accent for a scene background. */
export const MeshGlow = ({ tint = COLORS.accent }: { tint?: string }) => {
  const f = useCurrentFrame();
  const a = interpolate(f % 240, [0, 120, 240], [0, 60, 0]);
  const b = interpolate(f % 300, [0, 150, 300], [0, -50, 0]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(40% 50% at ${30 + a / 6}% ${40 + b / 8}%, ${tint}22, transparent 70%), radial-gradient(35% 45% at ${72 + b / 8}% ${66 - a / 8}%, ${tint}18, transparent 70%)`,
        filter: "blur(10px)",
      }}
    />
  );
};

/** Slow drifting particle field (deterministic — render-safe). */
export const Particles = ({
  count = 18,
  color = COLORS.accent,
}: {
  count?: number;
  color?: string;
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const seedX = (i * 73) % 100;
        const spd = 0.18 + (i % 5) * 0.07;
        const y = (((i * 149) % 120) - ((f * spd) % 120) + 120) % 120;
        const size = 2 + (i % 3);
        const op = 0.12 + (i % 4) * 0.07;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${seedX}%`,
              top: `${y - 10}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: op,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/** A glowing pill/node used in flow diagrams (3D-tilted). */
export const FlowNode = ({
  icon,
  label,
  note,
  delay,
  accent = COLORS.accent,
}: {
  icon: string;
  label: string;
  note?: string;
  delay: number;
  accent?: string;
}) => {
  const f = useCurrentFrame();
  const s = popScale(f, delay);
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${0.8 + s * 0.2})`,
        width: 300,
        padding: "28px 26px",
        borderRadius: 22,
        background: `linear-gradient(160deg, ${COLORS.panelSoft}, ${COLORS.bgAlt})`,
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 60px -18px ${accent}, 0 24px 50px -28px rgba(0,0,0,0.8)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 40 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.text }}>
        {label}
      </div>
      {note ? (
        <div style={{ fontFamily: mono, fontSize: 22, color: accent }}>
          {note}
        </div>
      ) : null}
    </div>
  );
};
