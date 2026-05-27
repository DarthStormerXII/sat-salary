import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  Loader2,
  User,
  UserX,
  Wallet,
} from "lucide-react";

export type Role = "employer" | "employee";

export interface EmployerProfile {
  role: "employer";
  orgName: string;
  personName: string;
  companySize: string;
  industry: string;
}

export interface EmployeeProfile {
  role: "employee";
  personName: string;
  jobTitle: string;
}

export type UserProfile = EmployerProfile | EmployeeProfile;

interface OnboardingFlowProps {
  walletAddress: string;
  onComplete: (profile: UserProfile) => void;
}

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4";

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

const COMPANY_SIZES = [
  "1-5 people",
  "6-20 people",
  "21-50 people",
  "51-200 people",
  "200+ people",
];

const INDUSTRIES = [
  "Crypto / Web3",
  "Software / SaaS",
  "Finance / DeFi",
  "Design / Creative",
  "Consulting",
  "Other",
];

export function OnboardingFlow({
  walletAddress,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);

  const [orgName, setOrgName] = useState("");
  const [personName, setPersonName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeNotFound, setEmployeeNotFound] = useState(false);
  const [fetchedEmployee, setFetchedEmployee] = useState<{
    personName: string;
    jobTitle: string;
  } | null>(null);

  function selectRole(r: Role) {
    setRole(r);
    if (r === "employer") {
      setStep(1);
    } else {
      // Employee: fetch profile from Cloudflare
      setEmployeeLoading(true);
      setEmployeeNotFound(false);
      fetch(
        `https://sat-salary-api.gabrielaxy.workers.dev/profile/${walletAddress.toLowerCase()}`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { personName?: string; jobTitle?: string } | null) => {
          if (data?.personName && data.personName !== "_cleared") {
            setFetchedEmployee({
              personName: data.personName,
              jobTitle: data.jobTitle || "",
            });
            setPersonName(data.personName);
            setJobTitle(data.jobTitle || "");
            setStep(1); // confirmation step
          } else {
            setEmployeeNotFound(true);
            setStep(1); // "not found" step
          }
          setEmployeeLoading(false);
        })
        .catch(() => {
          setEmployeeNotFound(true);
          setEmployeeLoading(false);
          setStep(1);
        });
    }
  }

  function handleComplete() {
    if (role === "employer") {
      onComplete({
        role: "employer",
        orgName: orgName.trim() || "My Organization",
        personName: personName.trim() || "Employer",
        companySize,
        industry,
      });
    } else {
      onComplete({
        role: "employee",
        personName: personName.trim() || "Employee",
        jobTitle: jobTitle.trim() || "Team member",
      });
    }
  }

  const canProceedEmployer = step === 1 && orgName.trim() && personName.trim();

  return (
    <div className="onboarding">
      <div className="onboarding__video-wrap">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="onboarding__video"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </div>
      <div className="onboarding__blur-mask" />
      <div className="onboarding__center-blob" />
      <div className="onboarding__grain" />

      <div className="onboarding__card">
        {/* Logo */}
        <div className="onboarding__brand">
          <img
            src="/logo-mark.png"
            alt="Sat Salary"
            className="onboarding__logo"
          />
          <span>Sat Salary</span>
        </div>

        {/* Progress dots */}
        <div className="onboarding__progress">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`onboarding__dot ${step >= i ? "is-active" : ""}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Role selection */}
          {step === 0 && (
            <motion.div key="step-0" {...slideIn}>
              <h2>Welcome to Sat Salary</h2>
              <p className="onboarding__sub">
                Stream payroll in MUSD without selling a sat.
                <br />
                How will you use Sat Salary?
              </p>
              <div className="onboarding__choices">
                <button
                  className="onboarding__choice"
                  onClick={() => selectRole("employer")}
                >
                  <div className="onboarding__icon">
                    <Briefcase size={24} />
                  </div>
                  <h3>I'm an Employer</h3>
                  <p>
                    Post BTC collateral, borrow MUSD, and stream payroll to your
                    team.
                  </p>
                </button>
                <button
                  className="onboarding__choice"
                  onClick={() => selectRole("employee")}
                >
                  <div className="onboarding__icon">
                    <Wallet size={24} />
                  </div>
                  <h3>I'm an Employee</h3>
                  <p>
                    View your salary streams and claim accrued MUSD earnings
                    anytime.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Profile details */}
          {step === 1 && role === "employer" && (
            <motion.div key="step-1-employer" {...slideIn}>
              <h2>Set up your organization</h2>
              <p className="onboarding__sub">
                Tell us about your company so your team knows who's paying them.
              </p>
              <div className="onboarding__form">
                <div className="onboarding__field">
                  <label>
                    <Building2 size={14} /> Organization name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Labs"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="onboarding__field">
                  <label>
                    <User size={14} /> Your name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Rivera"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                </div>
                <div className="onboarding__row">
                  <div className="onboarding__field">
                    <label>Company size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="onboarding__field">
                    <label>Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="onboarding__actions">
                  <button
                    className="onboarding__back"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    className="onboarding__next"
                    onClick={() => setStep(2)}
                    disabled={!canProceedEmployer}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && role === "employee" && employeeLoading && (
            <motion.div key="step-1-loading" {...slideIn}>
              <div
                className="onboarding__icon"
                style={{ margin: "0 auto 20px" }}
              >
                <Loader2 size={28} className="spin" />
              </div>
              <h2>Checking your profile…</h2>
              <p className="onboarding__sub">
                Looking up your wallet to see if an employer has added you.
              </p>
            </motion.div>
          )}

          {step === 1 &&
            role === "employee" &&
            !employeeLoading &&
            fetchedEmployee && (
              <motion.div key="step-1-found" {...slideIn}>
                <div className="onboarding__welcome-icon">
                  <Check size={28} />
                </div>
                <h2>Welcome, {fetchedEmployee.personName}!</h2>
                <p className="onboarding__sub">
                  Your employer has added you to the payroll system. Confirm
                  your details to continue.
                </p>
                <div className="onboarding__summary">
                  <div className="onboarding__summary-row">
                    <span>Name</span>
                    <strong>{fetchedEmployee.personName}</strong>
                  </div>
                  {fetchedEmployee.jobTitle && (
                    <div className="onboarding__summary-row">
                      <span>Role</span>
                      <strong>{fetchedEmployee.jobTitle}</strong>
                    </div>
                  )}
                  <div className="onboarding__summary-row">
                    <span>Wallet</span>
                    <strong style={{ fontFamily: "'SF Mono', monospace" }}>
                      {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                    </strong>
                  </div>
                </div>
                <div className="onboarding__actions">
                  <button
                    className="onboarding__back"
                    onClick={() => {
                      setStep(0);
                      setFetchedEmployee(null);
                      setEmployeeNotFound(false);
                    }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    className="onboarding__next onboarding__next--go"
                    onClick={handleComplete}
                  >
                    Enter Dashboard <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

          {step === 1 &&
            role === "employee" &&
            !employeeLoading &&
            employeeNotFound && (
              <motion.div key="step-1-notfound" {...slideIn}>
                <div
                  className="onboarding__icon"
                  style={{
                    margin: "0 auto 20px",
                    background: "var(--red-dim)",
                    color: "var(--red)",
                  }}
                >
                  <UserX size={28} />
                </div>
                <h2>No profile found</h2>
                <p className="onboarding__sub">
                  Your employer hasn't added your wallet to their payroll yet.
                  Share your address with them to get started.
                </p>
                <div
                  className="empty-dashboard__addr"
                  style={{ maxWidth: 400, margin: "0 auto 24px" }}
                >
                  <span>Your wallet address</span>
                  <code>{walletAddress}</code>
                </div>
                <button
                  className="onboarding__back"
                  onClick={() => {
                    setStep(0);
                    setEmployeeNotFound(false);
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </motion.div>
            )}

          {/* Step 2: Welcome / confirmation */}
          {step === 2 && (
            <motion.div key="step-2" {...slideIn}>
              <div className="onboarding__welcome-icon">
                <Check size={32} />
              </div>
              <h2>You're all set!</h2>
              <p className="onboarding__sub">
                {role === "employer"
                  ? `Welcome, ${personName}. ${orgName} is ready to stream payroll on Mezo.`
                  : `Welcome, ${personName}. You're ready to receive MUSD salary streams.`}
              </p>
              <div className="onboarding__summary">
                {role === "employer" && (
                  <>
                    <div className="onboarding__summary-row">
                      <span>Organization</span>
                      <strong>{orgName}</strong>
                    </div>
                    <div className="onboarding__summary-row">
                      <span>Operator</span>
                      <strong>{personName}</strong>
                    </div>
                    {companySize && (
                      <div className="onboarding__summary-row">
                        <span>Size</span>
                        <strong>{companySize}</strong>
                      </div>
                    )}
                    {industry && (
                      <div className="onboarding__summary-row">
                        <span>Industry</span>
                        <strong>{industry}</strong>
                      </div>
                    )}
                  </>
                )}
                {role === "employee" && (
                  <>
                    <div className="onboarding__summary-row">
                      <span>Name</span>
                      <strong>{personName}</strong>
                    </div>
                    {jobTitle && (
                      <div className="onboarding__summary-row">
                        <span>Role</span>
                        <strong>{jobTitle}</strong>
                      </div>
                    )}
                  </>
                )}
                <div className="onboarding__summary-row">
                  <span>Wallet</span>
                  <strong style={{ fontFamily: "'SF Mono', monospace" }}>
                    {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                  </strong>
                </div>
              </div>
              <div className="onboarding__actions">
                <button className="onboarding__back" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  className="onboarding__next onboarding__next--go"
                  onClick={handleComplete}
                >
                  Enter Dashboard <ArrowRight size={14} />
                </button>
              </div>
              <p className="onboarding__mezo-badge">
                Powered by Mezo · Chain 31611
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
