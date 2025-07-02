
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: 'lovable-tagger',
      apply: 'build',
      generateBundle() {
        // Dynamic import to avoid build-time dependency issues
        import('lovable-tagger').then(({ tagAllFiles }) => {
          tagAllFiles();
        }).catch(() => {
          // Silently fail if lovable-tagger is not available
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
