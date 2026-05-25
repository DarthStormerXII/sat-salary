import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { COLORS } from "./theme";
import { D, HAS_MUSIC, HAS_VOICEOVER } from "./constants";
import { Bg } from "./components/Bg";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Solution } from "./scenes/Solution";
import { Demo } from "./scenes/Demo";
import { Team } from "./scenes/Team";
import { Business } from "./scenes/Business";
import { Close } from "./scenes/Close";

export const SatSalaryPitch = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Bg />

      <Series>
        <Series.Sequence durationInFrames={D.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.problem}>
          <Problem />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.solution}>
          <Solution />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.demo}>
          <Demo />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.team}>
          <Team />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.business}>
          <Business />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.close}>
          <Close />
        </Series.Sequence>
      </Series>

      {/* Audio — enable in constants.ts once recorded. VO is the spine; music sits low. */}
      {HAS_VOICEOVER ? <Audio src={staticFile("audio/voiceover.mp3")} /> : null}
      {HAS_MUSIC ? (
        <Audio src={staticFile("audio/music.mp3")} volume={0.12} />
      ) : null}
    </AbsoluteFill>
  );
};
