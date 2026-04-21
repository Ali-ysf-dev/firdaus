import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    /** Do not preload three/r3f/drei with the HTML shell — they load when the hero island imports (better mobile TBT). */
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter(
          (id) =>
            !id.includes("/three-") &&
            !id.includes("/r3f-") &&
            !id.includes("/drei-") &&
            !id.includes("/HeroR3FIsland-") &&
            !id.includes("/ModelViewerSection-") &&
            !id.includes("/carpet-"),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/three")) {
            return "three";
          }
          if (id.includes("@react-three/fiber")) {
            return "r3f";
          }
          if (id.includes("@react-three/drei")) {
            return "drei";
          }
          if (id.includes("node_modules/gsap")) {
            return "gsap";
          }
        },
      },
    },
  },
})