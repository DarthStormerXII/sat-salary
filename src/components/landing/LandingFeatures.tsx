import { motion } from "framer-motion";
import { BadgeDollarSign, RefreshCcw, Zap } from "lucide-react";

const features = [
  {
    icon: BadgeDollarSign,
    title: "MUSD Borrowing",
    desc: "Open a Liquity-style trove with BTC collateral. Borrow MUSD at 1-5% fixed interest, locked at trove opening. Minimum 110% collateral ratio.",
  },
  {
    icon: Zap,
    title: "Real-time Streams",
    desc: "Stream MUSD to contractors per-second. Pause, resume, or adjust individual streams without affecting others. Employees claim accrued MUSD anytime.",
  },
  {
    icon: RefreshCcw,
    title: "Auto-Rebalance",
    desc: "If BTC drops below 180% health factor, the contract auto-repays debt to restore 250% target. Zero liquidation risk above a 30% BTC drawdown.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function LandingFeatures() {
  return (
    <section className="landing-features" id="features">
      <div className="landing-features-header">
        <p className="eyebrow">Built on Mezo</p>
        <h2>BTC stays. Team gets paid.</h2>
        <p>Deep protocol integration — not a wrapper.</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="feature-card"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={cardVariants}
          >
            <div className="feature-icon">
              <f.icon size={22} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
