import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy para el primer backend
      '/api1': {
        target: 'https://carlos-benitez.tecasispy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api1/, ''),
      },
      // Proxy para el segundo backend
      '/api2': {
        target: 'https://clientes-api.tecasispy.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api2/, ''),
      }
    }
  }
});
