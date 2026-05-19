import { mezoTestnet } from "./mezo";

export interface EthereumProvider {
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type WalletAuthCode = "no-wallet" | "no-account" | "wrong-network" | "signature-rejected" | "provider-error";

export class WalletAuthError extends Error {
  code: WalletAuthCode;

  constructor(code: WalletAuthCode, message: string) {
    super(message);
    this.name = "WalletAuthError";
    this.code = code;
  }
}

export interface WalletAuthProof {
  account: string;
  chainId: number;
  message: string;
  signature: string;
}

function mezoChainHex(): `0x${string}` {
  return `0x${mezoTestnet.id.toString(16)}`;
}

function normalizeAccount(accounts: unknown): string {
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string" || accounts[0].length === 0) {
    throw new WalletAuthError("no-account", "Wallet did not return an account.");
  }

  return accounts[0];
}

async function ensureMezoTestnet(provider: EthereumProvider): Promise<number> {
  const chainHex = await provider.request<string>({ method: "eth_chainId" });
  const chainId = Number.parseInt(chainHex, 16);

  if (chainId === mezoTestnet.id) return chainId;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: mezoChainHex() }],
    });
  } catch (switchError) {
    const error = switchError as { code?: number };
    if (error.code !== 4902) {
      throw new WalletAuthError("wrong-network", "Wallet is not connected to Mezo Testnet.");
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: mezoChainHex(),
          chainName: mezoTestnet.name,
          nativeCurrency: mezoTestnet.nativeCurrency,
          rpcUrls: mezoTestnet.rpcUrls.default.http,
          blockExplorerUrls: [mezoTestnet.blockExplorers.default.url],
        },
      ],
    });
  }

  const nextChainHex = await provider.request<string>({ method: "eth_chainId" });
  const nextChainId = Number.parseInt(nextChainHex, 16);
  if (nextChainId !== mezoTestnet.id) {
    throw new WalletAuthError("wrong-network", "Wallet switch did not land on Mezo Testnet.");
  }

  return nextChainId;
}

export function buildAuthMessage(account: string): string {
  return [
    "Sat Salary Mezo Testnet operator proof",
    `Account: ${account}`,
    `Chain ID: ${mezoTestnet.id}`,
    "Purpose: unlock live payroll transaction controls for testing.",
  ].join("\n");
}

export async function connectAndSignWallet(provider?: EthereumProvider): Promise<WalletAuthProof> {
  const walletProvider = provider ?? (typeof window !== "undefined" ? window.ethereum : undefined);

  if (!walletProvider) {
    throw new WalletAuthError(
      "no-wallet",
      "No EIP-1193 wallet was detected. Install or unlock a wallet before live Mezo testing.",
    );
  }

  try {
    const account = normalizeAccount(await walletProvider.request({ method: "eth_requestAccounts" }));
    const chainId = await ensureMezoTestnet(walletProvider);
    const message = buildAuthMessage(account);
    const signature = await walletProvider.request<string>({
      method: "personal_sign",
      params: [message, account],
    });

    if (!signature) {
      throw new WalletAuthError("signature-rejected", "Wallet did not return a signature.");
    }

    return { account, chainId, message, signature };
  } catch (error) {
    if (error instanceof WalletAuthError) throw error;

    const providerError = error as { code?: number; message?: string };
    if (providerError.code === 4001) {
      throw new WalletAuthError("signature-rejected", "Wallet request was rejected.");
    }

    throw new WalletAuthError("provider-error", providerError.message ?? "Wallet provider request failed.");
  }
}
