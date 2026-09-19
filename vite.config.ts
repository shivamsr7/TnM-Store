import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    tsconfigPaths: true,

    alias: {
      three: path.resolve(
        process.cwd(),
        "node_modules/three/build/three.module.js"
      ),
    },
  },

  optimizeDeps: {
    include: ["three"],
  },
});