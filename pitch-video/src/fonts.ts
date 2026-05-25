import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Space Grotesk = display/headlines (distinct, not generic Inter).
// JetBrains Mono = figures, addresses, on-chain values, step labels.
export const display = loadDisplay().fontFamily;
export const mono = loadMono().fontFamily;
