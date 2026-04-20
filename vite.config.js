import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
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