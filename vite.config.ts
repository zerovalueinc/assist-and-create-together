import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let taggerPlugin = null;
  if (mode === 'development') {
    try {
      // Dynamically import ESM-only plugin
      const mod = await import('lovable-tagger');
      taggerPlugin = mod.componentTagger();
    } catch (e) {
      console.warn('Could not load lovable-tagger:', e);
    }
  }
  return {
    server: {
      host: true,
      port: 3000,
      // Proxy API requests in development to the backend
      proxy: process.env.NODE_ENV !== 'production' ? {
        '/api': 'http://localhost:3001'
      } : undefined
    },
    plugins: [
      react(),
      taggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
