import { useEffect, useState } from "react";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";
import { fetchBtcPrice } from "../lib/mezo";

interface LandingPageProps {
  onConnect: () => void;
  connecting: boolean;
  connectError: string | null;
}

export function LandingPage({
  onConnect,
  connecting,
  connectError,
}: LandingPageProps) {
  const [btcPrice, setBtcPrice] = useState<bigint | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    const interval = setInterval(() => {
      fetchBtcPrice().then(setBtcPrice);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <img src="/logo-mark.png" alt="Sat Salary logo" />
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
        connectError={connectError}
      />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingFooter />
    </div>
  );
}
