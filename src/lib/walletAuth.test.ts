import { describe, expect, it } from "vitest";
import { buildAuthMessage, connectAndSignWallet, type EthereumProvider } from "./walletAuth";

describe("wallet auth", () => {
  it("signs only after account and Mezo Testnet chain are available", async () => {
    const provider: EthereumProvider = {
      request: (async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0x1234567890abcdef1234567890abcdef12345678"];
        if (method === "eth_chainId") return "0x7b7b";
        if (method === "personal_sign") return "0xsigned";
        throw new Error(`unexpected method ${method}`);
      }) as EthereumProvider["request"],
    };

    const proof = await connectAndSignWallet(provider);

    expect(proof.account).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(proof.chainId).toBe(31611);
    expect(proof.signature).toBe("0xsigned");
    expect(proof.message).toContain("Sat Salary Mezo Testnet operator proof");
  });

  it("blocks when no wallet provider is available", async () => {
    await expect(connectAndSignWallet(undefined)).rejects.toMatchObject({
      code: "no-wallet",
    });
  });

  it("builds a deterministic message for signature review", () => {
    const message = buildAuthMessage("0xabc");

    expect(message).toContain("Account: 0xabc");
    expect(message).toContain("Chain ID: 31611");
  });
});
