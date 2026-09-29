/**
 * Serves the production export the way GitHub Pages does: under the `basePath`
 * the build baked into every asset URL. Serving `out/` at the root instead would
 * 404 every stylesheet and script, which is the very thing these tests exist to
 * catch — so the harness has to reproduce the real shape.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE_PATH = process.env.E2E_BASE_PATH ?? "mobile-store";
const PORT = process.env.E2E_PORT ?? "4173";

// Fail loudly here rather than let every test drown in 404s.
const required = ["out/index.html", "out/storybook/index.html"];
const missing = required.filter((file) => !existsSync(path.resolve(file)));
if (missing.length > 0) {
  process.stderr.write(
    `Missing ${missing.join(", ")}.\nThe e2e suite runs against the real deploy bundle — run \`pnpm build:pages\` first `
      + `(plain \`pnpm build\` leaves out Storybook).\n`,
  );
  process.exit(1);
}

const root = mkdtempSync(path.join(tmpdir(), "mobile-store-e2e-"));
symlinkSync(path.resolve("out"), path.join(root, BASE_PATH), "dir");

const server = spawn("npx", ["--yes", "serve", root, "-p", PORT, "--no-clipboard"], {
  stdio: "inherit",
});

const cleanUp = () => {
  server.kill();
  rmSync(root, { recursive: true, force: true });
};
process.on("exit", cleanUp);
process.on("SIGINT", () => {
  cleanUp();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanUp();
  process.exit(0);
});
