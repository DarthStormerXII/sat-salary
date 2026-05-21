import { CirclePause, CirclePlay, WalletCards } from "lucide-react";
import { formatMusd } from "../lib/format";
import type { Worker } from "../types";

export function WorkerCard({
  worker,
  onPause,
  onResume,
}: {
  worker: Worker;
  onPause: () => void;
  onResume: () => void;
}) {
  const isStreaming = worker.streamStatus === "streaming";
  const isPaused = worker.streamStatus === "paused";
  const buttonLabel = isPaused
    ? "Resume stream"
    : isStreaming
      ? "Pause stream"
      : "Start streams first";

  return (
    <article className="worker-card" data-testid={`worker-${worker.id}`}>
      <div className="worker-card__top">
        <div>
          <p className="eyebrow">Contractor</p>
          <h3>{worker.name}</h3>
          <span>{worker.role}</span>
        </div>
        <span className={`status-chip status-chip--${worker.streamStatus}`}>
          {worker.streamStatus}
        </span>
      </div>
      <div
        className="stream-meter"
        aria-label={`${worker.name} payroll stream`}
      >
        <div
          style={{
            transform: `scaleX(${isStreaming ? 0.76 : isPaused ? 0.46 : 0.2})`,
          }}
        />
      </div>
      <div className="worker-stats">
        <div>
          <span>Accrued</span>
          <strong>{formatMusd(worker.accruedMusd)}</strong>
        </div>
        <div>
          <span>Rate</span>
          <strong>{formatMusd(worker.streamRateMusdPerHour)}/hr</strong>
        </div>
      </div>
      <div className="worker-wallet">
        <WalletCards size={16} />
        <span>{worker.wallet}</span>
      </div>
      <button
        className="ghost-button"
        type="button"
        onClick={isPaused ? onResume : onPause}
        disabled={!isStreaming && !isPaused}
        title={
          !isStreaming && !isPaused
            ? "Use Start payroll streams before pausing worker streams."
            : undefined
        }
      >
        {isPaused ? <CirclePlay size={18} /> : <CirclePause size={18} />}
        {buttonLabel}
      </button>
    </article>
  );
}
