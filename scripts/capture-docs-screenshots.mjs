import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(".");
const outDir = join(root, "public", "docs");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const appUrl = "http://127.0.0.1:3005";
const debugPort = 9223;
const chromeUserData = join(root, ".tmp-chrome-docs");

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function waitForHttp(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function cdp(method, params = {}, sessionId) {
  const payload = { id: ++cdp.nextId, method, params };
  if (sessionId) payload.sessionId = sessionId;
  cdp.ws.send(JSON.stringify(payload));
  return new Promise((resolveCall, rejectCall) => {
    cdp.pending.set(payload.id, { resolve: resolveCall, reject: rejectCall });
  });
}
cdp.nextId = 0;
cdp.pending = new Map();

async function connectCdp() {
  const version = await fetch(`http://127.0.0.1:${debugPort}/json/version`).then((response) => response.json());
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  cdp.ws = ws;
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const pending = cdp.pending.get(message.id);
    if (!pending) return;
    cdp.pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result);
  });
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });
}

async function createPage() {
  const target = await cdp("Target.createTarget", { url: "about:blank" });
  const attached = await cdp("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;
  await cdp("Page.enable", {}, sessionId);
  await cdp("Runtime.enable", {}, sessionId);
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 950,
    deviceScaleFactor: 1,
    mobile: false
  }, sessionId);
  return sessionId;
}

async function evaluate(sessionId, expression, awaitPromise = true) {
  const result = await cdp("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true
  }, sessionId);
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

async function goto(sessionId, url) {
  await cdp("Page.navigate", { url }, sessionId);
  await wait(1200);
}

async function screenshot(sessionId, filename) {
  await wait(500);
  const shot = await cdp("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true
  }, sessionId);
  const bytes = Buffer.from(shot.data, "base64");
  await import("node:fs/promises").then((fs) => fs.writeFile(join(outDir, filename), bytes));
}

async function clickByText(sessionId, text) {
  const clicked = await evaluate(sessionId, `
    (() => {
      const candidates = Array.from(document.querySelectorAll('button, summary'));
      const match = candidates.find((node) => (node.innerText || node.textContent || '').includes(${JSON.stringify(text)}));
      if (!match) return false;
      match.scrollIntoView({ block: 'center' });
      match.click();
      return true;
    })()
  `);
  if (!clicked) throw new Error(`Could not click text: ${text}`);
  await wait(800);
}

async function scrollToText(sessionId, text) {
  await evaluate(sessionId, `
    (() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if ((node.innerText || node.textContent || '').includes(${JSON.stringify(text)})) {
          node.scrollIntoView({ block: 'start' });
          return true;
        }
      }
      return false;
    })()
  `);
  await wait(500);
}

async function clickEvalRun(sessionId) {
  const clicked = await evaluate(sessionId, `
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const button = buttons.find((node) => (node.innerText || node.textContent || '').trim() === 'Run');
      if (!button) return false;
      button.scrollIntoView({ block: 'center' });
      button.click();
      return true;
    })()
  `);
  if (!clicked) throw new Error("Could not click eval Run button");
  await wait(800);
}

async function scrollPanelToText(sessionId, text) {
  await evaluate(sessionId, `
    (() => {
      const targets = Array.from(document.querySelectorAll('aside, [class*="overflow-y-auto"], [class*="overflow-auto"]'));
      for (const target of targets) {
        if ((target.innerText || '').includes(${JSON.stringify(text)})) {
          const child = Array.from(target.querySelectorAll('*')).find((node) => (node.innerText || node.textContent || '').includes(${JSON.stringify(text)}));
          if (child) child.scrollIntoView({ block: 'center' });
          return true;
        }
      }
      return false;
    })()
  `);
  await wait(500);
}

async function runWorkflow(sessionId) {
  await goto(sessionId, appUrl);
  await evaluate(sessionId, "localStorage.clear(); location.reload();");
  await wait(1200);
  await clickByText(sessionId, "Run weekly update workflow");
  await wait(14000);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const server = spawn("cmd.exe", ["/c", "npm", "run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3005"], {
    cwd: root,
    stdio: "ignore",
    shell: false
  });

  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${chromeUserData}`,
    "--no-first-run",
    "--disable-gpu",
    "--window-size=1440,950",
    "about:blank"
  ], {
    stdio: "ignore",
    shell: false
  });

  try {
    await waitForHttp(appUrl);
    await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`);
    await connectCdp();
    const sessionId = await createPage();

    await goto(sessionId, appUrl);
    await evaluate(sessionId, "localStorage.clear(); location.reload();");
    await wait(1200);
    await screenshot(sessionId, "first-run.png");

    await runWorkflow(sessionId);
    await screenshot(sessionId, "candidate-packet.png");

    await scrollToText(sessionId, "Tool Activity");
    await screenshot(sessionId, "prototype-brief.png");

    await clickByText(sessionId, "New Session");
    await clickByText(sessionId, "Our teams spend too much time");
    await wait(14000);
    await scrollToText(sessionId, "AI Lab Prototype Brief");
    await screenshot(sessionId, "prototype-brief.png");

    await clickByText(sessionId, "Case Study");
    await screenshot(sessionId, "case-study.png");
    await evaluate(sessionId, "document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));");
    await wait(500);

    await scrollPanelToText(sessionId, "Eval Harness");
    await clickEvalRun(sessionId);
    await wait(1500);
    await scrollPanelToText(sessionId, "Passed");
    await screenshot(sessionId, "eval-panel.png");

    await clickByText(sessionId, "AI Governance");
    await screenshot(sessionId, "governance-modal.png");
  } finally {
    cdp.ws?.close();
    chrome.kill();
    server.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
