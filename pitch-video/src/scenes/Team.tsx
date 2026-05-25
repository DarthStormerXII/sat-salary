import { useCurrentFrame } from "remotion";
import { D } from "../constants";
import { COLORS } from "../theme";
import { mono } from "../fonts";
import { Headline, Kicker, SceneWrap } from "../components/ui";
import { fadeUp, stagger } from "../utils";

// 2:00–2:20 — TEAM. Marshall: "people invest in teams, not ideas" — ~50% of the call.
// EDIT the MEMBERS array with your real names / roles / one-line creds + drop photos
// into public/brand/ (see PITCH.md). This is the one slide AI should NOT write for you.
type Member = { name: string; role: string; cred: string; photo?: string };

const MEMBERS: Member[] = [
  {
    name: "[Your name]",
    role: "[Role]",
    cred: "[Background that makes you the right person — prior crypto/AI projects, shipped products]",
  },
  { name: "[Teammate]", role: "[Role]", cred: "[One concrete, credible line]" },
  { name: "[Teammate]", role: "[Role]", cred: "[One concrete, credible line]" },
];

export const Team = () => {
  return (
    <SceneWrap dur={D.team} align="flex-start">
      <Kicker delay={0}>Who We Are</Kicker>
      <Headline
        text="You bet on the team."
        delay={6}
        size={70}
        accentWords={["team."]}
      />
      <div style={{ display: "flex", gap: 34, marginTop: 60 }}>
        {MEMBERS.map((m, i) => (
          <MemberCard key={i} m={m} delay={stagger(34, i, 10)} />
        ))}
      </div>
    </SceneWrap>
  );
};

const MemberCard = ({ m, delay }: { m: Member; delay: number }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        ...fadeUp(f, delay, 16),
        width: 480,
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 34,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: m.photo
            ? `center/cover url(${m.photo})`
            : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.panelSoft})`,
          border: `2px solid ${COLORS.borderAccent}`,
        }}
      />
      <div style={{ fontSize: 40, fontWeight: 700 }}>{m.name}</div>
      <div style={{ fontFamily: mono, fontSize: 24, color: COLORS.accent }}>
        {m.role}
      </div>
      <div style={{ fontSize: 27, color: COLORS.textDim, lineHeight: 1.4 }}>
        {m.cred}
      </div>
    </div>
  );
};
