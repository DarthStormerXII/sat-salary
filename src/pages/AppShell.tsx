import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  Droplet,
  LayoutDashboard,
  LogOut,
  Activity as ActivityIcon,
  Users,
  Wallet,
} from "lucide-react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useBitcoinAccount } from "@mezo-org/passport";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";
import {
  OnboardingFlow,
  type UserProfile,
} from "../components/app/OnboardingFlow";
import { SAT_SALARY_OWNER } from "../lib/satSalary";

type Tab = "dashboard" | "team" | "earnings" | "activity";

const FAUCET_URL = "https://faucet.test.mezo.org/";
const MIN_GAS_WEI = 100_000_000_000_000n;
const PROFILE_STORAGE_KEY = "sat-salary-profile";

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBtcBalance(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${frac}`;
}

function loadProfile(address: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(
      `${PROFILE_STORAGE_KEY}-${address.toLowerCase()}`,
    );
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {}
  return null;
}

function saveProfile(address: string, profile: UserProfile) {
  try {
    localStorage.setItem(
      `${PROFILE_STORAGE_KEY}-${address.toLowerCase()}`,
      JSON.stringify(profile),
    );
  } catch {}
}

export function AppShell() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { btcAddress } = useBitcoinAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  });

  const isOwner =
    !!address && address.toLowerCase() === SAT_SALARY_OWNER.toLowerCase();

  const gasWei = balance?.value ?? 0n;
  const gasChecked = !balanceLoading && balance !== undefined;
  const insufficientGas = gasChecked && gasWei < MIN_GAS_WEI;

  const [profile, setProfile] = useState<UserProfile | null>(() =>
    address ? loadProfile(address) : null,
  );

  useEffect(() => {
    if (address && !profile) {
      const saved = loadProfile(address);
      if (saved) setProfile(saved);
    }
  }, [address, profile]);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  function handleOnboardingComplete(p: UserProfile) {
    setProfile(p);
    if (address) saveProfile(address, p);
    setActiveTab("dashboard");
  }

  if (!profile) {
    return (
      <OnboardingFlow
        walletAddress={address ?? "0x"}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const role = profile.role;
  const displayName =
    profile.role === "employer" ? profile.orgName : profile.personName;

  const employerTabs: { id: Tab; label: string; icon: typeof Bitcoin }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "team", label: "Team", icon: Users },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  const employeeTabs: { id: Tab; label: string; icon: typeof Bitcoin }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "earnings", label: "My Earnings", icon: Wallet },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  const tabs = role === "employer" ? employerTabs : employeeTabs;

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__top">
          <div className="app-sidebar__brand">
            <img
              src="/logo-mark.png"
              alt="Sat Salary"
              className="app-sidebar__logo"
            />
            <span>Sat Salary</span>
          </div>

          <div className="app-sidebar__profile">
            <span className="app-sidebar__name">{displayName}</span>
            <span className="app-sidebar__role-badge">
              {role === "employer" ? "Employer" : "Employee"}
            </span>
          </div>

          <nav className="app-sidebar__nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`app-sidebar__tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="app-sidebar__bottom">
          {btcAddress && (
            <div className="app-sidebar__btc">
              <Bitcoin size={12} />
              <span>{shortAddr(btcAddress)}</span>
            </div>
          )}
          {gasChecked && (
            <div className="app-sidebar__balance">
              <Bitcoin size={12} />
              <span>{formatBtcBalance(gasWei)} BTC</span>
            </div>
          )}
          {address && (
            <div className="app-sidebar__addr">
              <span>{shortAddr(address)}</span>
            </div>
          )}
          <button
            className="app-sidebar__disconnect"
            onClick={() => disconnect()}
          >
            <LogOut size={12} /> Disconnect
          </button>
        </div>
      </aside>

      <main className="app-content">
        {insufficientGas && (
          <div className="dash-faucet-banner">
            <div className="dash-faucet-banner__icon">
              <Droplet size={18} />
            </div>
            <div className="dash-faucet-banner__body">
              <strong>You need testnet BTC for gas</strong>
              <span>
                Your wallet holds {formatBtcBalance(gasWei)} BTC. Claim free
                testnet BTC before sending any transaction.
              </span>
            </div>
            <a
              className="dash-faucet-btn"
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim BTC
              <ArrowRight size={15} />
            </a>
          </div>
        )}

        {activeTab === "dashboard" && <RealFlowPanel view="dashboard" />}
        {activeTab === "team" && <RealFlowPanel view="team" />}
        {activeTab === "earnings" && <RealFlowPanel view="earnings" />}
        {activeTab === "activity" && <ActivityFeed />}
      </main>
    </div>
  );
}
