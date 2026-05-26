/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_DEPLOYER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
