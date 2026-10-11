import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("recharts")) return "recharts";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("react")) return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
