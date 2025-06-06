import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   proxy: {
  //     '/appapi': {
  //       target: 'http://app.v4.xinmem.com/',
  //       changeOrigin: true,
  //       rewrite: (path) => path,
  //       secure: false,
  //       timeout: 30000,
  //     }
  //   } 
  // },
  base: process.env.NODE_ENV === "production" ? "/quick-edit/" : "/",
});
