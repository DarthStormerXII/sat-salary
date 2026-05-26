import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Bitcoin, Check, Shield } from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../../lib/satSalary";

interface OpenTroveFormProps {
  btcBalance: bigint;
  btcPrice: number | null;
  onSuccess: () => void;
}

const slideIn = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

export function OpenTroveForm({
  btcBalance,
  btcPrice,
  onSuccess,
}: OpenTroveFormProps) {
  const [step, setStep] = useState(0);
  const [btcAmount, setBtcAmount] = useState("");
  const [musdAmount, setMusdAmount] = useState("");
  const [txState, setTxState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const btcNum = Number(btcAmount) || 0;
  const musdNum = Number(musdAmount) || 0;
  const btcBalanceNum = Number(btcBalance / 10n ** 12n) / 1e6;

  const collUsd = btcPrice ? btcNum * btcPrice : 0;
  const healthPct = musdNum > 0 && collUsd > 0 ? (collUsd / musdNum) * 100 : 0;
  const isHealthy = healthPct >= 150;
  const minMusd = 1800;
  const maxSafeMusd = btcPrice ? Math.floor((btcNum * btcPrice) / 2.5) : 0;

  async function handleSubmit() {
    if (!btcNum || musdNum < minMusd) return;
    setTxState("pending");
    setTxError(null);
    try {
      const collWei = parseEther(btcAmount);
      const debtWei = parseEther(musdAmount);
      await writeContractAsync({
        address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
        abi: SAT_SALARY_TROVE_ABI,
        functionName: "openTrove",
        args: [debtWei],
        value: collWei,
      });
      setTxState("success");
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setTxState("error");
      setTxError(
        err instanceof Error ? err.message.slice(0, 120) : "Transaction failed",
      );
    }
  }

  return (
    <div className="trove-form">
      <div className="trove-form__progress">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`onboarding__dot ${step >= i ? "is-active" : ""}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-0" {...slideIn} className="trove-form__step">
            <div className="trove-form__icon">
              <Bitcoin size={28} />
            </div>
            <h3>How much BTC to collateralize?</h3>
            <p>
              This Bitcoin stays on the balance sheet — it's never sold. You
              borrow MUSD against it for payroll.
            </p>
            <div className="trove-form__field">
              <label>BTC collateral</label>
              <div className="trove-form__input-row">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.05"
                  value={btcAmount}
                  onChange={(e) =>
                    setBtcAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  autoFocus
                />
                <span className="trove-form__unit">BTC</span>
              </div>
              <span className="trove-form__hint">
                Available: {btcBalanceNum.toFixed(4)} BTC
                {btcPrice
                  ? ` · $${(btcNum * btcPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : ""}
              </span>
            </div>
            <div className="trove-form__actions">
              <div />
              <button
                className="onboarding__next"
                onClick={() => setStep(1)}
                disabled={
                  !btcNum ||
                  btcNum > btcBalanceNum ||
                  (btcPrice !== null && maxSafeMusd < minMusd)
                }
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-1" {...slideIn} className="trove-form__step">
            <div className="trove-form__icon">
              <Shield size={28} />
            </div>
            <h3>How much MUSD to borrow?</h3>
            <p>
              Your {btcNum} BTC collateral
              {btcPrice
                ? ` (~$${collUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
                : ""}
              {maxSafeMusd >= minMusd
                ? ` can safely borrow up to ${maxSafeMusd.toLocaleString()} MUSD.`
                : maxSafeMusd > 0
                  ? ` is not enough for the minimum ${minMusd.toLocaleString()} MUSD borrow. Add more BTC.`
                  : ". Loading oracle price…"}
            </p>
            <div className="trove-form__field">
              <label>MUSD to borrow</label>
              <div className="trove-form__input-row">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2000"
                  value={musdAmount}
                  onChange={(e) =>
                    setMusdAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  autoFocus
                />
                <span className="trove-form__unit">MUSD</span>
              </div>
              {musdNum > 0 && (
                <div className="trove-form__health-preview">
                  <span>Health factor</span>
                  <strong
                    className={
                      isHealthy
                        ? "trove-form__health--ok"
                        : "trove-form__health--bad"
                    }
                  >
                    {healthPct.toFixed(0)}%
                  </strong>
                  <span className="trove-form__health-label">
                    {isHealthy
                      ? healthPct >= 250
                        ? "Safe"
                        : healthPct >= 180
                          ? "Moderate"
                          : "Caution"
                      : "Below minimum (150%)"}
                  </span>
                </div>
              )}
              {musdNum > 0 && musdNum < minMusd && (
                <span className="trove-form__warn">
                  Minimum borrow is {minMusd} MUSD
                </span>
              )}
            </div>
            <div className="trove-form__actions">
              <button className="onboarding__back" onClick={() => setStep(0)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="onboarding__next"
                onClick={() => setStep(2)}
                disabled={musdNum < minMusd || !isHealthy}
              >
                Review <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-2" {...slideIn} className="trove-form__step">
            {txState === "success" ? (
              <>
                <div className="onboarding__welcome-icon">
                  <Check size={32} />
                </div>
                <h3>Treasury created!</h3>
                <p>
                  Your payroll trove is live on Mezo. You can now add team
                  members and start streaming MUSD.
                </p>
              </>
            ) : (
              <>
                <h3>Confirm your payroll treasury</h3>
                <p>
                  This will deposit BTC and borrow MUSD in a single on-chain
                  transaction.
                </p>
                <div className="onboarding__summary">
                  <div className="onboarding__summary-row">
                    <span>BTC collateral</span>
                    <strong>{btcNum.toFixed(4)} BTC</strong>
                  </div>
                  <div className="onboarding__summary-row">
                    <span>Collateral value</span>
                    <strong>
                      $
                      {collUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                  <div className="onboarding__summary-row">
                    <span>MUSD to borrow</span>
                    <strong>{musdNum.toLocaleString()} MUSD</strong>
                  </div>
                  <div className="onboarding__summary-row">
                    <span>Health factor</span>
                    <strong>{healthPct.toFixed(0)}%</strong>
                  </div>
                  <div className="onboarding__summary-row">
                    <span>Borrow rate</span>
                    <strong>1% fixed</strong>
                  </div>
                </div>
                {txError && <div className="trove-form__error">{txError}</div>}
                <div className="trove-form__actions">
                  <button
                    className="onboarding__back"
                    onClick={() => setStep(1)}
                    disabled={txState === "pending"}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    className="onboarding__next onboarding__next--go"
                    onClick={handleSubmit}
                    disabled={txState === "pending"}
                  >
                    {txState === "pending" ? "Confirming…" : "Open Treasury"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
