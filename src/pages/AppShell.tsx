import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  Briefcase,
  Droplet,
  LayoutDashboard,
  LogOut,
  Activity as ActivityIcon,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useBitcoinAccount } from "@mezo-org/passport";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";
import { SAT_SALARY_OWNER } from "../lib/satSalary";

type Role = "employer" | "employee";
type Tab = "dashboard" | "team" | "earnings" | "activity";

const FAUCET_URL = "https://faucet.test.mezo.org/";
const MIN_GAS_WEI = 100_000_000_000_000n;
const ROLE_STORAGE_KEY = "sat-salary-role";

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatBtcBalance(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${frac}`;
}

function getSavedRole(address: string): Role | null {
  try {
    const saved = localStorage.getItem(
      `${ROLE_STORAGE_KEY}-${address.toLowerCase()}`,
    );
    if (saved === "employer" || saved === "employee") return saved;
  } catch {}
  return null;
}

function saveRole(address: string, role: Role) {
  try {
    localStorage.setItem(`${ROLE_STORAGE_KEY}-${address.toLowerCase()}`, role);
  } catch {}
}

function Onboarding({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="onboarding">
      <motion.div
        className="onboarding__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Welcome to Sat Salary</h2>
        <p>How will you use Sat Salary on Mezo?</p>

        <div className="onboarding__choices">
          <button
            className="onboarding__choice"
            onClick={() => onSelect("employer")}
          >
            <div className="onboarding__icon">
              <Briefcase size={24} />
            </div>
            <h3>I'm an Employer</h3>
            <p>
              Post BTC collateral, borrow MUSD, and stream payroll to your team.
            </p>
          </button>

          <button
            className="onboarding__choice"
            onClick={() => onSelect("employee")}
          >
            <div className="onboarding__icon">
              <Wallet size={24} />
            </div>
            <h3>I'm an Employee</h3>
            <p>
              View your salary streams and claim accrued MUSD earnings anytime.
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
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

  const [role, setRole] = useState<Role | null>(() => {
    if (isOwner) return "employer";
    if (address) return getSavedRole(address);
    return null;
  });

  useEffect(() => {
    if (isOwner && role !== "employer") setRole("employer");
  }, [isOwner, role]);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  function handleRoleSelect(r: Role) {
    setRole(r);
    if (address) saveRole(address, r);
    setActiveTab("dashboard");
  }

  if (!role) {
    return <Onboarding onSelect={handleRoleSelect} />;
  }

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

          <div className="app-sidebar__role">
            {role === "employer" ? "Employer" : "Employee"}
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
