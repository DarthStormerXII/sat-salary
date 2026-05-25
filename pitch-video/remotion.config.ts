import { Config } from "@remotion/cli/config";

// Mixed compositions (screen-recording MP4s + heavy motion graphics) render most
// reliably single-threaded — see motion-video-council findings.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
