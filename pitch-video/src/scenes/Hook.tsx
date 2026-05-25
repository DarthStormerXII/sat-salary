import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { BrandMark, Headline, SceneWrap, Sub } from "../components/ui";
import { fadeUp } from "../utils";

// 0:00–0:15 — HOOK. Anchor line in the first ~10s (Marshall: hook in 15s).
export const Hook = () => {
  const f = useCurrentFrame();
  return (
    <SceneWrap dur={D.hook} align="flex-start">
      <div style={{ ...fadeUp(f, 0, 12), marginBottom: 54 }}>
        <BrandMark delay={0} size={52} />
      </div>
      <Headline
        text="Pay your team without selling a satoshi."
        delay={8}
        size={104}
        accentWords={["satoshi"]}
      />
      <Sub delay={42} size={42}>
        Today, making payroll means selling the Bitcoin you are trying to hold.
      </Sub>
      <div
        style={{
          ...fadeUp(f, 64, 16),
          marginTop: 40,
          fontSize: 30,
          color: COLORS.textFaint,
        }}
      >
        Sat Salary fixes that.
      </div>
    </SceneWrap>
  );
};
