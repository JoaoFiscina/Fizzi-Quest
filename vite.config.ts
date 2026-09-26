import { defineConfig, type Plugin } from "vite";
import { GAME_VERSION } from "./src/version";

function versionManifest(): Plugin {
  const manifest = JSON.stringify({ version: GAME_VERSION });
  return {
    name: "fizzi-version-manifest",
    configureServer(server) {
      server.middlewares.use("/version.json", (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        response.end(manifest);
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: manifest,
      });
    },
  };
}
export default defineConfig({
  plugins: [versionManifest()],
  build: {
    rollupOptions: { output: { manualChunks: { phaser: ["phaser"] } } },
  },
  test: { include: ["tests/**/*.test.ts"] },
});
