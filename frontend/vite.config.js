import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["three", "react", "react-dom"],
    alias: {
      three: path.resolve("./node_modules/three"),
    },
  },
  optimizeDeps: {
    include: ["react-countup"],
  },
});
