import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";

const require = createRequire(import.meta.url);

const CODEX_PNPM_ROOT =
  "C:/Users/salim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm";
const DEFAULT_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function findCodexPlaywright() {
  if (!existsSync(CODEX_PNPM_ROOT)) return null;

  const candidates = readdirSync(CODEX_PNPM_ROOT)
    .filter((entry) => /^playwright@/.test(entry))
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));

  for (const candidate of candidates) {
    const packagePath = `${CODEX_PNPM_ROOT}/${candidate}/node_modules/playwright`;
    if (existsSync(packagePath)) return packagePath;
  }

  return null;
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const packagePath = process.env.PLAYWRIGHT_PACKAGE_PATH || findCodexPlaywright();
    if (!packagePath || !existsSync(packagePath)) {
      throw new Error(
        "Playwright is not installed locally and no Codex runtime Playwright package was found."
      );
    }
    return require(packagePath);
  }
}

const targetUrl =
  process.env.BROWSER_SMOKE_URL ||
  "data:text/html,<title>browser-smoke</title><h1>ok</h1>";
const chromePath = process.env.CHROME_PATH || DEFAULT_CHROME;

if (!existsSync(chromePath)) {
  throw new Error(`Chrome executable not found at ${chromePath}`);
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

try {
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

  const result = {
    ok: true,
    url: page.url(),
    title: await page.title(),
    h1: await page.locator("h1").first().textContent().catch(() => null),
  };

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
