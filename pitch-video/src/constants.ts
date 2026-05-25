export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const sec = (s: number) => Math.round(s * FPS);

// Scene durations in SECONDS. Total = 180s (3:00) — the Mezo hackathon pitch length.
// Hook lands the anchor line in the first ~10s (Marshall: "hook in under 15 seconds").
export const SCENE_SECONDS = {
  hook: 15,
  problem: 25,
  solution: 20,
  demo: 60,
  team: 20,
  business: 25,
  close: 15,
} as const;

export const D = {
  hook: sec(SCENE_SECONDS.hook),
  problem: sec(SCENE_SECONDS.problem),
  solution: sec(SCENE_SECONDS.solution),
  demo: sec(SCENE_SECONDS.demo),
  team: sec(SCENE_SECONDS.team),
  business: sec(SCENE_SECONDS.business),
  close: sec(SCENE_SECONDS.close),
} as const;

export const TOTAL_FRAMES = Object.values(D).reduce((a, b) => a + b, 0); // 5400

// Toggle these on once you have recorded/produced the audio tracks and dropped
// them into public/audio/. Left false so the project renders cleanly before audio exists.
export const HAS_VOICEOVER = false; // public/audio/voiceover.mp3
export const HAS_MUSIC = false; // public/audio/music.mp3
