import {
  SAT_SALARY_TROVE,
  SAT_SALARY_VAULT,
  mezoTestnet,
} from "../../lib/mezo";

export function LandingFooter() {
  const explorer = mezoTestnet.blockExplorers.default.url;

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="footer-brand">
          <img
            src="/logo-mark.png"
            alt="Sat Salary logo"
            className="footer-logo"
          />
          <span>Sat Salary</span>
          <span className="footer-chain-badge">
            <span className="footer-chain-dot" />
            Mezo Testnet
          </span>
        </div>
        <div className="footer-links">
          <a
            href={`${explorer}/address/${SAT_SALARY_TROVE.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            SatSalaryTrove
          </a>
          <a
            href={`${explorer}/address/${SAT_SALARY_VAULT.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            SatSalaryVault
          </a>
          <a
            href="https://github.com/DarthStormerXII/sat-salary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
