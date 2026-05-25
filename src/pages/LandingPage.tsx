import { useEffect, useState } from "react";
import { Bitcoin } from "lucide-react";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";
import { fetchBtcPrice } from "../lib/mezo";

interface LandingPageProps {
  onConnect: () => void;
  connecting: boolean;
}

export function LandingPage({ onConnect, connecting }: LandingPageProps) {
  const [btcPrice, setBtcPrice] = useState<bigint | null>(null);

  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    const interval = setInterval(() => {
      fetchBtcPrice().then(setBtcPrice);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <Bitcoin size={16} />
          </div>
          Sat Salary
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a
            href="https://github.com/DarthStormerXII/sat-salary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <button className="nav-connect-btn" onClick={onConnect}>
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
      </nav>
      <LandingHero
        btcPrice={btcPrice}
        onConnect={onConnect}
        connecting={connecting}
      />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingFooter />
    </div>
  );
}
