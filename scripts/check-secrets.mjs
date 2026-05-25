import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8"
})
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

const secretPatterns = [
  {
    name: "real AI provider key assignment",
    pattern: /\b(?:GEMINI_API_KEY|GROQ_API_KEY)\s*=\s*(?!your_|placeholder|example|$)[^\s#]+/i
  },
  {
    name: "private key marker",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/
  }
];

const failures = [];

for (const file of files) {
  if (file.includes("node_modules/") || file.includes(".next/")) continue;

  let contents = "";
  try {
    contents = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(contents)) {
      failures.push(`${file}: ${name}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Potential secrets found in files that would be committed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("No obvious secrets found in commit candidates.");
