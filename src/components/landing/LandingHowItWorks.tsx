import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    title: "Post BTC",
    desc: "Deposit Bitcoin as collateral into a Mezo trove. Your BTC stays on the balance sheet — never sold.",
  },
  {
    num: "2",
    title: "Borrow MUSD",
    desc: "Mint MUSD at 1% fixed rate via BorrowerOperations. The stablecoin funds your payroll treasury.",
  },
  {
    num: "3",
    title: "Stream Payroll",
    desc: "Create per-second MUSD streams to each contractor. They claim accrued earnings anytime.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="landing-how" id="how">
      <div className="landing-how-header">
        <p className="eyebrow">How it works</p>
        <h2>Three steps to payroll.</h2>
      </div>
      <div className="how-steps">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            className="how-step"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.12,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="step-number">{s.num}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
