import { Composition } from "remotion";
import { SatSalaryPitch } from "./SatSalaryPitch";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./constants";

export const RemotionRoot = () => {
  return (
    <Composition
      id="SatSalaryPitch"
      component={SatSalaryPitch}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
