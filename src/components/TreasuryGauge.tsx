interface TreasuryGaugeProps {
  healthPct: number | null; // e.g. 192 for 192%
  mcrPct: number; // liquidation floor (Mezo MCR ~110)
  rebalancePct: number; // keeper threshold (180)
  targetPct: number; // rebalance target (250)
}

// Semicircular health gauge mapping 100%–300% collateral ratio onto a 180° arc,
// with colored liquidation / rebalance / safe zones and a needle at the live
// health factor.
export function TreasuryGauge({
  healthPct,
  mcrPct,
  rebalancePct,
  targetPct,
}: TreasuryGaugeProps) {
  const MIN = 100;
  const MAX = 300;
  const clamp = (v: number) => Math.max(MIN, Math.min(MAX, v));
  const toAngle = (v: number) => 180 - ((clamp(v) - MIN) / (MAX - MIN)) * 180;
  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)] as const;
  };
  const arc = (start: number, end: number, r = 80) => {
    const [x1, y1] = polar(100, 100, r, start);
    const [x2, y2] = polar(100, 100, r, end);
    const large = Math.abs(start - end) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const liqEnd = toAngle(mcrPct);
  const rebEnd = toAngle(rebalancePct);
  const needle = healthPct !== null ? toAngle(clamp(healthPct)) : null;
  const healthy = healthPct !== null && healthPct >= rebalancePct;
  const warn =
    healthPct !== null && healthPct >= mcrPct && healthPct < rebalancePct;
  const [tx, ty] = polar(100, 100, 80, toAngle(targetPct));

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 116" className="gauge__svg" aria-hidden="true">
        {/* zones */}
        <path
          d={arc(180, liqEnd)}
          className="gauge__zone gauge__zone--danger"
        />
        <path
          d={arc(liqEnd, rebEnd)}
          className="gauge__zone gauge__zone--warn"
        />
        <path d={arc(rebEnd, 0)} className="gauge__zone gauge__zone--safe" />
        {/* target marker */}
        <circle cx={tx} cy={ty} r="3.5" className="gauge__target" />
        {/* needle */}
        {needle !== null && (
          <>
            <line
              x1="100"
              y1="100"
              x2={polar(100, 100, 72, needle)[0]}
              y2={polar(100, 100, 72, needle)[1]}
              className="gauge__needle"
            />
            <circle cx="100" cy="100" r="5" className="gauge__hub" />
          </>
        )}
      </svg>
      <div className="gauge__readout">
        <strong
          className={
            healthy
              ? "is-safe"
              : warn
                ? "is-warn"
                : healthPct !== null
                  ? "is-danger"
                  : ""
          }
        >
          {healthPct !== null ? `${healthPct.toFixed(0)}%` : "—"}
        </strong>
        <span>collateral health</span>
      </div>
      <div className="gauge__legend">
        <span>
          <i className="gauge__dot gauge__dot--danger" /> Liq {mcrPct}%
        </span>
        <span>
          <i className="gauge__dot gauge__dot--warn" /> Rebal {rebalancePct}%
        </span>
        <span>
          <i className="gauge__dot gauge__dot--safe" /> Target {targetPct}%
        </span>
      </div>
    </div>
  );
}
