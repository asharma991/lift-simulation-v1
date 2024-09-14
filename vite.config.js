import { defineConfig } from "vite";

export default defineConfig({
    base: "/lift-simulation-v1/",
    build: {
        outDir: "docs",
    },
    server: {
        open: true,
    },
});