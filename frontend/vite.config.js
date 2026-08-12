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
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-hot-toast/")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/three/") || id.includes("node_modules/@react-three/")) {
            return "three-vendor";
          }
          if (id.includes("node_modules/framer-motion/") || id.includes("node_modules/@rive-app/") || id.includes("node_modules/@lottiefiles/") || id.includes("node_modules/@splinetool/")) {
            return "animation-vendor";
          }
        },
      },
    },
  },
});
