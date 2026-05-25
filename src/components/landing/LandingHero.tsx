import { motion } from "framer-motion";
import { ArrowRight, Bitcoin } from "lucide-react";

interface LandingHeroProps {
  btcPrice: bigint | null;
  onConnect: () => void;
  connecting: boolean;
}

function formatBtcPrice(price: bigint): string {
  const usd = Number(price / 10n ** 18n);
  return `$${usd.toLocaleString()}`;
}

const marqueeItems = [
  "BTC collateral",
  "MUSD borrow",
  "1% fixed rate",
  "Payroll streams",
  "Auto-rebalance",
  "Mezo Earn yield",
  "Liquidation protection",
  "Per-second accrual",
];

export function LandingHero({
  btcPrice,
  onConnect,
  connecting,
}: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <div className="hero-bg" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="hero-badge-dot" />
          Mezo Testnet — Live
        </motion.div>

        <h1>
          Stream payroll in <em>MUSD</em> without selling a sat.
        </h1>

        <p className="hero-sub">
          Post BTC collateral, borrow MUSD at 1% fixed rate through Mezo's
          protocol, and stream it in real time to your team.
        </p>

        <motion.button
          className="hero-cta"
          onClick={onConnect}
          disabled={connecting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
          <ArrowRight size={18} />
        </motion.button>

        <div className="hero-oracle">
          {btcPrice ? (
            <>
              <span>
                <Bitcoin size={14} style={{ verticalAlign: "middle" }} /> BTC
                Oracle: <strong>{formatBtcPrice(btcPrice)}</strong>
              </span>
              <span className="hero-oracle-divider" />
              <span>
                Chain: <strong>Mezo Testnet (31611)</strong>
              </span>
            </>
          ) : (
            <span>Loading oracle price…</span>
          )}
        </div>
      </motion.div>

      <div className="landing-marquee">
        <div className="marquee-inner">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
