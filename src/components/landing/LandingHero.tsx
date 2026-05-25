import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bitcoin } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4";

interface LandingHeroProps {
  btcPrice: bigint | null;
  onConnect: () => void;
  connecting: boolean;
  connectError: string | null;
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

const blurUp = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(20px)", y: 40 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  transition: {
    duration: 1,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    delay,
  },
});

export function LandingHero({
  btcPrice,
  onConnect,
  connecting,
  connectError,
}: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="landing-hero">
      {/* Video background */}
      <div className="hero-video-wrap">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </div>

      {/* Bottom blur overlay — mask fades blur to transparent toward top */}
      <div className="hero-blur-mask" />

      {/* Centered blur blob for depth */}
      <div className="hero-center-blob" />

      {/* Film grain */}
      <div className="hero-grain" />

      {/* Content */}
      <div className="hero-content">
        <motion.div className="hero-badge" {...blurUp(0.1)}>
          <span className="hero-badge-dot" />
          Mezo Testnet — Live
        </motion.div>

        <motion.h1 {...blurUp(0.25)}>
          Stream payroll in <em>MUSD</em> without selling a sat.
        </motion.h1>

        <motion.p className="hero-sub" {...blurUp(0.4)}>
          Post BTC collateral, borrow MUSD at 1% fixed rate through Mezo's
          protocol, and stream it in real time to your team.
        </motion.p>

        <motion.div className="hero-cta-row" {...blurUp(0.55)}>
          <button
            className="hero-cta liquid-glass-btn"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
            <ArrowRight size={18} />
          </button>
        </motion.div>

        {connectError && <div className="hero-error">{connectError}</div>}

        <motion.div className="hero-oracle" {...blurUp(0.7)}>
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
        </motion.div>
      </div>

      <motion.div className="landing-marquee" {...blurUp(0.85)}>
        <div className="marquee-inner">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
