import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    // Mezo Passport / OrangeKit bitcoin libs need Buffer, global and process
    // in the browser.
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
});
