import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        services: resolve(__dirname, "services.html"),
        histoire: resolve(__dirname, "histoire.html"),
        menu: resolve(__dirname, "menu.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
