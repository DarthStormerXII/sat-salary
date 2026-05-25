import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./constants";

const OUT_CUBIC = Easing.out(Easing.cubic);

/** Fade + rise. Returns style for a word/line entering at `start` over `dur` frames. */
export const fadeUp = (frame: number, start: number, dur = 18, rise = 28) => {
  const t = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT_CUBIC,
  });
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * rise}px)`,
  };
};

/** Simple clamped fade in. */
export const fadeIn = (frame: number, start: number, dur = 16) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Spring-driven pop (scale) for logos / emphasis marks. */
export const popScale = (frame: number, start: number) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: { damping: 14, mass: 0.7, stiffness: 120 },
  });

/** Stagger helper — returns the start frame for index i. */
export const stagger = (base: number, i: number, step = 6) => base + i * step;
