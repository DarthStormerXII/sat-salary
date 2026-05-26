import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  Compass,
  Droplet,
  LayoutDashboard,
  LogOut,
  Activity as ActivityIcon,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { useAccount, useBalance, useDisconnect, useReadContract } from "wagmi";
import { useBitcoinAccount } from "@mezo-org/passport";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";
import { ExplorerTransactions } from "../components/ExplorerTransactions";
import { OpenTroveForm } from "../components/app/OpenTroveForm";
import { AddEmployeeForm } from "../components/app/AddEmployeeForm";
import {
  OnboardingFlow,
  type UserProfile,
} from "../components/app/OnboardingFlow";
import {
  SAT_SALARY_OWNER,
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../lib/satSalary";
import { fetchBtcPrice } from "../lib/mezo";
import {
  fetchProfile as fetchProfileRemote,
  saveProfileRemote,
} from "../lib/profileApi";

type Tab = "dashboard" | "team" | "earnings" | "explorer" | "activity";

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
  const [profileLoading, setProfileLoading] = useState(!profile && !!address);
  const [btcPriceNum, setBtcPriceNum] = useState<number | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  useEffect(() => {
    if (!address || profile) return;
    const local = loadProfile(address);
    if (local) {
      setProfile(local);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchProfileRemote(address).then((remote) => {
      if (remote) {
        setProfile(remote);
        saveProfile(address, remote);
      }
      setProfileLoading(false);
    });
  }, [address, profile]);

  useEffect(() => {
    fetchBtcPrice().then((p) => setBtcPriceNum(Number(p / 10n ** 18n)));
  }, []);

  // Detect if the connected wallet has an active trove
  const { data: troveColl, refetch: refetchTrove } = useReadContract({
    address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
    abi: SAT_SALARY_TROVE_ABI,
    functionName: "troveColl",
    query: { refetchInterval: 15000 },
  });
  const hasTrove = !!troveColl && (troveColl as bigint) > 0n;

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  function handleOnboardingComplete(p: UserProfile) {
    setProfile(p);
    if (address) {
      saveProfile(address, p);
      saveProfileRemote(address, p);
    }
    setActiveTab("dashboard");
  }

  if (profileLoading) {
    return (
      <div
        className="app-shell"
        style={{ display: "grid", placeItems: "center" }}
      >
        <span style={{ color: "#999" }}>Loading profile…</span>
      </div>
    );
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
    { id: "explorer", label: "Explorer", icon: Compass },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  const employeeTabs: { id: Tab; label: string; icon: typeof Bitcoin }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "earnings", label: "My Earnings", icon: Wallet },
    { id: "explorer", label: "Explorer", icon: Compass },
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

        {activeTab === "dashboard" &&
          role === "employer" &&
          (isOwner && hasTrove ? (
            <RealFlowPanel view="treasury" />
          ) : (
            <div className="empty-dashboard">
              <OpenTroveForm
                btcBalance={gasWei}
                btcPrice={btcPriceNum}
                onSuccess={() => refetchTrove()}
              />
            </div>
          ))}
        {activeTab === "dashboard" && role === "employee" && (
          <div className="empty-dashboard">
            <div className="empty-dashboard__card">
              <div className="empty-dashboard__icon">
                <Wallet size={28} />
              </div>
              <h3>No salary streams yet</h3>
              <p>
                Your employer hasn't added you to a payroll stream yet. Share
                your wallet address with them to get started.
              </p>
              {address && (
                <div className="empty-dashboard__addr">
                  <span>Your address</span>
                  <code>{address}</code>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "team" && isOwner && hasTrove && !showAddEmployee && (
          <>
            <RealFlowPanel view="team" />
            <button
              className="add-employee-cta"
              onClick={() => setShowAddEmployee(true)}
            >
              <Plus size={16} /> Add Employee
            </button>
          </>
        )}
        {activeTab === "team" && isOwner && hasTrove && showAddEmployee && (
          <AddEmployeeForm
            onSuccess={() => {
              setShowAddEmployee(false);
            }}
            onCancel={() => setShowAddEmployee(false)}
          />
        )}
        {activeTab === "team" && (!isOwner || !hasTrove) && (
          <RealFlowPanel view="team" />
        )}
        {activeTab === "earnings" && <RealFlowPanel view="earnings" />}
        {activeTab === "explorer" && (
          <div className="protocol-explorer">
            <h3>Mezo Protocol</h3>
            <p className="protocol-explorer__sub">
              Live data from Mezo Testnet (chain 31611)
            </p>
            <div className="protocol-explorer__grid">
              <div className="protocol-explorer__card">
                <span>BTC Oracle</span>
                <strong>
                  {btcPriceNum
                    ? `$${btcPriceNum.toLocaleString()}`
                    : "Loading…"}
                </strong>
                <em>Skip Connect precompile</em>
              </div>
              <div className="protocol-explorer__card">
                <span>Network</span>
                <strong>Mezo Testnet</strong>
                <em>Chain ID 31611</em>
              </div>
              <div className="protocol-explorer__card">
                <span>MUSD Borrow Rate</span>
                <strong>1.0% APR</strong>
                <em>Fixed at trove opening</em>
              </div>
              <div className="protocol-explorer__card">
                <span>Mezo Earn Yield</span>
                <strong>~5% APR</strong>
                <em>MUSD Savings Vault (mainnet)</em>
              </div>
            </div>
            <div className="protocol-explorer__links">
              <h4>Deployed contracts</h4>
              <a
                href="https://explorer.test.mezo.org/address/0x306919805eed1ad4772d92e18d00a1c132b07c19"
                target="_blank"
                rel="noopener noreferrer"
              >
                SatSalaryTrove →
              </a>
              <a
                href="https://explorer.test.mezo.org/address/0xCdF7028ceAB81fA0C6971208e83fa7872994beE5"
                target="_blank"
                rel="noopener noreferrer"
              >
                BorrowerOperations →
              </a>
              <a
                href="https://explorer.test.mezo.org/address/0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
                target="_blank"
                rel="noopener noreferrer"
              >
                MUSD Token →
              </a>
              <a
                href="https://explorer.test.mezo.org/address/0x86bCF0841622a5dAC14A313a15f96A95421b9366"
                target="_blank"
                rel="noopener noreferrer"
              >
                PriceFeed →
              </a>
            </div>
            <ExplorerTransactions />
          </div>
        )}
        {activeTab === "activity" && <ActivityFeed />}
      </main>
    </div>
  );
}
