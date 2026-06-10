import { createRequire } from "node:module";
import { existsSync } from "node:fs";

const require = createRequire(import.meta.url);

const DEFAULT_CODEX_PLAYWRIGHT =
  "C:/Users/salim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright";
const DEFAULT_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const packagePath = process.env.PLAYWRIGHT_PACKAGE_PATH || DEFAULT_CODEX_PLAYWRIGHT;
    if (!existsSync(packagePath)) {
      throw new Error(`Playwright is not installed locally and was not found at ${packagePath}`);
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
