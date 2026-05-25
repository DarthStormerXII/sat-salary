import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { display, mono } from "../fonts";
import { fadeUp, popScale, stagger } from "../utils";

/** Per-scene wrapper: cross-fades in/out so plain <Series> reads like soft cuts. */
export const SceneWrap = ({
  dur,
  children,
  align = "center",
  justify = "center",
  pad = "120px 150px",
}: {
  dur: number;
  children: ReactNode;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  pad?: string;
}) => {
  const f = useCurrentFrame();
  const opacity = Math.min(
    interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(f, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp" }),
  );
  return (
    <AbsoluteFill
      style={{
        opacity,
        padding: pad,
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        justifyContent: justify,
        fontFamily: display,
        color: COLORS.text,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Small uppercase section label. */
export const Kicker = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        ...fadeUp(f, delay, 14),
        fontFamily: mono,
        fontSize: 26,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: COLORS.accent,
        marginBottom: 30,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span
        style={{
          width: 40,
          height: 2,
          background: COLORS.accent,
          display: "inline-block",
        }}
      />
      {children}
    </div>
  );
};

/** Big headline with per-word stagger. Pass an array of words for stagger, or a string. */
export const Headline = ({
  text,
  delay = 6,
  size = 92,
  maxWidth = 1500,
  accentWords = [],
}: {
  text: string;
  delay?: number;
  size?: number;
  maxWidth?: number;
  accentWords?: string[];
}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <h1
      style={{
        margin: 0,
        fontSize: size,
        lineHeight: 1.04,
        fontWeight: 700,
        letterSpacing: -1.5,
        maxWidth,
        display: "flex",
        flexWrap: "wrap",
        gap: "0 0.28em",
      }}
    >
      {words.map((w, i) => {
        const clean = w.replace(/[.,—]/g, "");
        const isAccent = accentWords.includes(clean);
        return (
          <span
            key={i}
            style={{
              ...fadeUp(f, stagger(delay, i, 4), 16),
              color: isAccent ? COLORS.accent : COLORS.text,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </h1>
  );
};

/** Supporting line under a headline. */
export const Sub = ({
  children,
  delay = 20,
  size = 40,
  maxWidth = 1250,
}: {
  children: ReactNode;
  delay?: number;
  size?: number;
  maxWidth?: number;
}) => {
  const f = useCurrentFrame();
  return (
    <p
      style={{
        ...fadeUp(f, delay, 18),
        margin: "34px 0 0",
        fontSize: size,
        lineHeight: 1.4,
        color: COLORS.textDim,
        maxWidth,
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
};

/** Oversized stat: a big mono number + a caption. */
export const Stat = ({
  value,
  caption,
  delay = 0,
  accent = true,
}: {
  value: string;
  caption: string;
  delay?: number;
  accent?: boolean;
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ ...fadeUp(f, delay, 18) }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 130,
          fontWeight: 700,
          lineHeight: 1,
          color: accent ? COLORS.accent : COLORS.text,
          letterSpacing: -3,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 34,
          color: COLORS.textDim,
          marginTop: 18,
          maxWidth: 760,
        }}
      >
        {caption}
      </div>
    </div>
  );
};

/** A step chip used in the solution flow. */
export const StepChip = ({
  index,
  label,
  note,
  delay,
}: {
  index: number;
  label: string;
  note?: string;
  delay: number;
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        ...fadeUp(f, delay, 16),
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: "30px 38px",
        minWidth: 360,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 24, color: COLORS.accent }}>
        {String(index).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 42, fontWeight: 700 }}>{label}</span>
      {note ? (
        <span style={{ fontSize: 28, color: COLORS.textDim }}>{note}</span>
      ) : null}
    </div>
  );
};

/** Sat Salary wordmark. */
export const BrandMark = ({
  delay = 0,
  size = 64,
}: {
  delay?: number;
  size?: number;
}) => {
  const f = useCurrentFrame();
  const s = popScale(f, delay);
  return (
    <div
      style={{
        transform: `scale(${0.9 + s * 0.1})`,
        opacity: s,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: display,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: -1,
      }}
    >
      <span
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: "50%",
          background: COLORS.accent,
          boxShadow: `0 0 40px ${COLORS.accent}`,
          display: "inline-block",
        }}
      />
      <span>
        Sat<span style={{ color: COLORS.accent }}>Salary</span>
      </span>
    </div>
  );
};

/** Lower-third caption shown OVER the demo recordings (VO/on-screen duet — keep short). */
export const CaptionBar = ({
  step,
  caption,
}: {
  step: string;
  caption: string;
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        bottom: 72,
        right: 64,
        ...fadeUp(f, 6, 14),
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 26,
          color: COLORS.bg,
          background: COLORS.accent,
          padding: "10px 18px",
          borderRadius: 10,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {step}
      </span>
      <span
        style={{
          fontSize: 38,
          fontWeight: 600,
          color: COLORS.text,
          background: "rgba(8,8,10,0.72)",
          backdropFilter: "blur(8px)",
          padding: "12px 24px",
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {caption}
      </span>
    </div>
  );
};

/**
 * Placeholder slot shown where a real app screen recording will go.
 * Replace by setting `clip` in demoShots.ts → it swaps to <OffthreadVideo>.
 */
export const PlaceholderSlot = ({ record }: { record: string }) => {
  const f = useCurrentFrame();
  const pulse = interpolate(f % 60, [0, 30, 60], [0.4, 1, 0.4]);
  return (
    <AbsoluteFill
      style={{
        margin: 56,
        borderRadius: 22,
        border: `3px dashed ${COLORS.borderAccent}`,
        background:
          "repeating-linear-gradient(45deg, rgba(247,147,26,0.05), rgba(247,147,26,0.05) 22px, transparent 22px, transparent 44px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 80,
        gap: 26,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 30,
          color: COLORS.accent,
          opacity: pulse,
        }}
      >
        ● REC — DROP APP SCREEN RECORDING HERE
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          maxWidth: 1300,
          lineHeight: 1.25,
        }}
      >
        {record}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 24,
          color: COLORS.textFaint,
          maxWidth: 1100,
        }}
      >
        Set this shot&apos;s <span style={{ color: COLORS.textDim }}>clip</span>{" "}
        in src/demoShots.ts to a file under public/demo/ to replace this
        placeholder.
      </div>
    </AbsoluteFill>
  );
};
