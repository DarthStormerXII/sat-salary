import { staticFile } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { FlipCard, MeshGlow } from "../components/viz";
import { stagger } from "../utils";

// 2:00–2:20 — TEAM. Marshall: "people invest in teams, not ideas" — ~50% of the bet.
// EDIT MEMBERS with real names / roles / one-line creds + photos (public/brand/).
// This is the one slide AI should NOT write for you.
type Member = { name: string; role: string; cred: string; photo?: string };

const MEMBERS: Member[] = [
  {
    name: "Darth Stormer XII",
    role: "Web3 & smart contracts",
    cred: "Web3 specialist — has shipped web3 products across multiple hackathons.",
    photo: "darth.jpg",
  },
  {
    name: "Joel Antony Xaviour",
    role: "Engineering & systems",
    cred: "Associate Tech Lead @ KLA · Data Science master's, PSG Tech · algorithms & systems.",
    photo: "joel.jpg",
  },
  {
    name: "Marsella",
    role: "Business & go-to-market",
    cred: "Business development, pitch & events · BA Business Enterprise & Events, LSPR Jakarta.",
    photo: "marsella.jpg",
  },
];

export const Team = () => {
  return (
    <SceneWrap dur={D.team} align="flex-start">
      <MeshGlow />
      <Kicker delay={0}>Who We Are</Kicker>
      <Headline
        text="You bet on the team."
        delay={6}
        size={70}
        accentWords={["team."]}
      />
      <div
        style={{ display: "flex", gap: 34, marginTop: 56, perspective: 1600 }}
      >
        {MEMBERS.map((m, i) => (
          <FlipCard
            key={i}
            delay={stagger(34, i, 9)}
            width={480}
            style={{ padding: 34 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: m.photo
                    ? `center/cover url(${staticFile(`brand/${m.photo}`)})`
                    : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.panelSoft})`,
                  backgroundColor: COLORS.panelSoft,
                  border: `2px solid ${COLORS.borderAccent}`,
                  boxShadow: `0 0 40px -10px ${COLORS.accent}`,
                }}
              />
              <div
                style={{ fontSize: 40, fontWeight: 700, color: COLORS.text }}
              >
                {m.name}
              </div>
              <div
                style={{ fontFamily: mono, fontSize: 24, color: COLORS.accent }}
              >
                {m.role}
              </div>
              <div
                style={{ fontSize: 27, color: COLORS.textDim, lineHeight: 1.4 }}
              >
                {m.cred}
              </div>
            </div>
          </FlipCard>
        ))}
      </div>
    </SceneWrap>
  );
};
