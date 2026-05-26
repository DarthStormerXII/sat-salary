import { useState } from "react";
import { ArrowRight, Check, UserPlus } from "lucide-react";
import { useWriteContract } from "wagmi";
import {
  SAT_SALARY_TROVE_ABI,
  SAT_SALARY_TROVE_ADDRESS,
} from "../../lib/satSalary";

interface AddEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SECONDS_PER_MONTH = 30 * 24 * 3600;

export function AddEmployeeForm({ onSuccess, onCancel }: AddEmployeeFormProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [address, setAddress] = useState("");
  const [monthly, setMonthly] = useState("");
  const [txState, setTxState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const monthlyNum = Number(monthly) || 0;
  const isValidAddr = address.startsWith("0x") && address.length === 42;
  const canSubmit = name.trim() && isValidAddr && monthlyNum > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setTxState("pending");
    setTxError(null);
    try {
      const rate =
        (BigInt(Math.floor(monthlyNum * 1e6)) * 10n ** 12n) /
        BigInt(SECONDS_PER_MONTH);
      await writeContractAsync({
        address: SAT_SALARY_TROVE_ADDRESS as `0x${string}`,
        abi: SAT_SALARY_TROVE_ABI,
        functionName: "createStream",
        args: [address as `0x${string}`, rate],
      });

      // Store name + role in localStorage (Cloudflare KV sync later)
      try {
        const key = `sat-salary-employee-${address.toLowerCase()}`;
        localStorage.setItem(
          key,
          JSON.stringify({ name: name.trim(), role: role.trim() }),
        );
      } catch {}

      setTxState("success");
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setTxState("error");
      setTxError(
        err instanceof Error ? err.message.slice(0, 120) : "Transaction failed",
      );
    }
  }

  if (txState === "success") {
    return (
      <div className="add-employee">
        <div className="onboarding__welcome-icon">
          <Check size={28} />
        </div>
        <h3>Employee added!</h3>
        <p>
          {name} is now receiving {monthlyNum.toLocaleString()} MUSD/month via a
          real-time payroll stream.
        </p>
      </div>
    );
  }

  return (
    <div className="add-employee">
      <div className="add-employee__header">
        <UserPlus size={20} />
        <h3>Add team member</h3>
      </div>

      <div className="add-employee__form">
        <div className="add-employee__row">
          <div className="onboarding__field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="onboarding__field">
            <label>Role / Title</label>
            <input
              type="text"
              placeholder="Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="onboarding__field">
          <label>Wallet address</label>
          <input
            type="text"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            style={{ fontFamily: "'SF Mono', monospace" }}
          />
        </div>

        <div className="onboarding__field">
          <label>Monthly salary (MUSD)</label>
          <div className="trove-form__input-row">
            <input
              type="text"
              inputMode="decimal"
              placeholder="3000"
              value={monthly}
              onChange={(e) =>
                setMonthly(e.target.value.replace(/[^0-9.]/g, ""))
              }
            />
            <span className="trove-form__unit">MUSD/mo</span>
          </div>
        </div>

        {txError && <div className="trove-form__error">{txError}</div>}

        <div className="add-employee__actions">
          <button
            className="onboarding__back"
            onClick={onCancel}
            disabled={txState === "pending"}
          >
            Cancel
          </button>
          <button
            className="onboarding__next"
            onClick={handleSubmit}
            disabled={!canSubmit || txState === "pending"}
          >
            {txState === "pending" ? "Creating stream…" : "Add Employee"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
