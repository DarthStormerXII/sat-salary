import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Check,
  Shield,
  Loader2,
} from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../../lib/satSalary";
import { mezoTestnet } from "../../lib/mezo";

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
    | "idle"
    | "sending-btc"
    | "opening-trove"
    | "transferring"
    | "success"
    | "error"
  >("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<{
    send?: string;
    open?: string;
    transfer?: string;
  }>({});

  const { address: connectedAddress } = useAccount();
  const explorerBase = "https://explorer.test.mezo.org";

  const btcNum = Number(btcAmount) || 0;
  const musdNum = Number(musdAmount) || 0;
  const btcBalanceNum = Number(btcBalance / 10n ** 12n) / 1e6;

  const collUsd = btcPrice ? btcNum * btcPrice : 0;
  const gasDeposit = 200; // Mezo adds 200 MUSD gas deposit to total debt
  const totalDebt = musdNum + gasDeposit;
  const healthPct =
    totalDebt > 0 && collUsd > 0 ? (collUsd / totalDebt) * 100 : 0;
  const isHealthy = healthPct >= 150;
  const minMusd = 1800;
  const maxSafeMusd = btcPrice
    ? Math.floor((btcNum * btcPrice) / 1.5 - gasDeposit)
    : 0;

  const { sendTransactionAsync } = useSendTransaction();

  async function handleSubmit() {
    if (!btcNum || musdNum < minMusd || !connectedAddress) return;
    const deployerKey = import.meta.env.VITE_DEPLOYER_KEY;
    if (!deployerKey) {
      setTxError("Deployer key not configured.");
      return;
    }
    setTxError(null);

    const collWei = parseEther(btcAmount);
    const debtWei = parseEther(musdAmount);
    const deployerAccount = privateKeyToAccount(deployerKey as `0x${string}`);
    const deployerWallet = createWalletClient({
      account: deployerAccount,
      chain: mezoTestnet,
      transport: http("https://rpc.test.mezo.org"),
    });
    const publicClient = createPublicClient({
      chain: mezoTestnet,
      transport: http("https://rpc.test.mezo.org"),
    });

    try {
      setTxHashes({});

      // Step 1: User sends BTC to deployer via connected wallet (OKX Passport)
      setTxState("sending-btc");
      const sendHash = await sendTransactionAsync({
        to: deployerAccount.address,
        value: collWei,
      });
      setTxHashes((prev) => ({ ...prev, send: sendHash }));
      await publicClient.waitForTransactionReceipt({ hash: sendHash });

      // Step 2: Deployer opens trove with the received BTC (high gas, bypasses Passport cap)
      setTxState("opening-trove");
      const openHash = await deployerWallet.writeContract({
        address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
        abi: SAT_SALARY_TROVE_ABI,
        functionName: "openTrove",
        args: [debtWei],
        value: collWei,
        gas: 3_000_000n,
      });
      setTxHashes((prev) => ({ ...prev, open: openHash }));
      await publicClient.waitForTransactionReceipt({ hash: openHash });

      // Step 3: Deployer transfers employer role to connected wallet
      setTxState("transferring");
      const transferHash = await deployerWallet.writeContract({
        address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
        abi: SAT_SALARY_TROVE_ABI,
        functionName: "transferEmployer",
        args: [connectedAddress],
      });
      setTxHashes((prev) => ({ ...prev, transfer: transferHash }));
      await publicClient.waitForTransactionReceipt({ hash: transferHash });

      setTxState("success");
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
              {btcNum > 0 && btcPrice !== null && maxSafeMusd < minMusd && (
                <span className="trove-form__warn">
                  Minimum ~
                  {(((minMusd + gasDeposit) * 1.5) / btcPrice).toFixed(3)} BTC
                  required. Mezo protocol enforces 1,800 MUSD minimum debt at
                  150%+ health.
                </span>
              )}
              {btcNum > 0 && btcNum > btcBalanceNum && (
                <span className="trove-form__warn">
                  Exceeds your available balance.
                </span>
              )}
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
                <div className="trove-form__txlist">
                  {txHashes.send && (
                    <a
                      href={`${explorerBase}/tx/${txHashes.send}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      BTC Transfer → Explorer ↗
                    </a>
                  )}
                  {txHashes.open && (
                    <a
                      href={`${explorerBase}/tx/${txHashes.open}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Trove → Explorer ↗
                    </a>
                  )}
                  {txHashes.transfer && (
                    <a
                      href={`${explorerBase}/tx/${txHashes.transfer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Transfer Employer → Explorer ↗
                    </a>
                  )}
                </div>
                <button
                  className="onboarding__next onboarding__next--go"
                  onClick={onSuccess}
                  style={{ marginTop: 20, width: "100%" }}
                >
                  Go to Dashboard <ArrowRight size={14} />
                </button>
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
                    disabled={txState !== "idle" && txState !== "error"}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    className="onboarding__next onboarding__next--go"
                    onClick={handleSubmit}
                    disabled={txState !== "idle" && txState !== "error"}
                  >
                    {txState === "sending-btc" && (
                      <>
                        <Loader2 size={14} className="spin" /> Sending BTC…
                      </>
                    )}
                    {txState === "opening-trove" && (
                      <>
                        <Loader2 size={14} className="spin" /> Opening trove…
                      </>
                    )}
                    {txState === "transferring" && (
                      <>
                        <Loader2 size={14} className="spin" /> Finalizing…
                      </>
                    )}
                    {(txState === "idle" || txState === "error") && (
                      <>
                        Open Treasury <ArrowRight size={14} />
                      </>
                    )}
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
