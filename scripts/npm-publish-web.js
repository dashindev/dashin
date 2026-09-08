#!/usr/bin/env node
/**
 * scripts/npm-publish-web.js
 *
 * Interactive NPM publishing script for 2FA / WebAuthn security-key accounts.
 *
 * Why this exists:
 *   When npm accounts enforce 2FA via WebAuthn hardware keys (no TOTP code),
 *   running npm publish in non-interactive CI or redirected subprocesses fails with:
 *     "npm error code EOTP: This operation requires a one-time password from your authenticator."
 *   This happens because npm's otplease checks `!process.stdin.isTTY || !process.stdout.isTTY`
 *   and skips the web authentication flow unless TTY is detected.
 *
 * How this script works:
 *   1. Mocks TTY flags so npm activates the browser-based WebAuth flow.
 *   2. Automatically detects `https://www.npmjs.com/auth/cli/<id>` in the output
 *      and opens it directly in the default web browser for approval.
 *   3. Supports publishing a single package, or all unpublished monorepo packages (`--all`).
 *
 * Usage:
 *   # Publish a single package:
 *   node scripts/npm-publish-web.js packages/dashin-source-atomo
 *
 *   # Publish all monorepo packages that are not yet on the registry:
 *   node scripts/npm-publish-web.js --all
 */

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure TTY flags so npm otplease activates web auth
process.stdin.isTTY = true;
process.stdout.isTTY = true;

const rawStdout = process.stdout.write.bind(process.stdout);
const rawStderr = process.stderr.write.bind(process.stderr);

let openedUrls = new Set();

function openBrowser(url) {
  const platform = process.platform;
  let cmd = `start "" "${url}"`;
  if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else if (platform === 'linux') {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd);
}

function checkChunk(chunk) {
  const text = chunk.toString();
  const matches = text.match(/https:\/\/(www\.)?npmjs\.com\/(auth|login)\/[^\s\x1b\r\n]+/g);
  if (matches) {
    for (const url of matches) {
      if (!openedUrls.has(url)) {
        openedUrls.add(url);
        rawStdout(`\n======================================================\n`);
        rawStdout(`>>> DETECTED NPM WEB AUTH URL:\n`);
        rawStdout(`>>> ${url}\n`);
        rawStdout(`>>> Opening in default browser for authorization...\n`);
        rawStdout(`======================================================\n\n`);
        openBrowser(url);
      }
    }
  }
}

process.stdout.write = function (chunk, encoding, cb) {
  checkChunk(chunk);
  return rawStdout(chunk, encoding, cb);
};

process.stderr.write = function (chunk, encoding, cb) {
  checkChunk(chunk);
  return rawStderr(chunk, encoding, cb);
};

// Locate npm-cli entrypoint
function getNpmCliPath() {
  try {
    const npmPath = execSync(process.platform === 'win32' ? 'where npm' : 'which npm')
      .toString()
      .trim()
      .split('\r\n')[0]
      .split('\n')[0];

    const candidateDirs = [
      path.join(path.dirname(npmPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
      path.join(path.dirname(npmPath), '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
      'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js',
    ];

    for (const c of candidateDirs) {
      if (fs.existsSync(c)) return c;
    }
  } catch (e) {}
  return 'C:\\nvm4w\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';
}

function publishPackageSync(targetDir) {
  rawStdout(`\n--------------------------------------------------\n`);
  rawStdout(`[npm-publish-web] Processing: ${targetDir}\n`);

  const pkgJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    rawStdout(`[npm-publish-web] No package.json found in ${targetDir}. Skipping.\n`);
    return;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (pkgJson.private) {
    rawStdout(`[npm-publish-web] ${pkgJson.name} is private. Skipping.\n`);
    return;
  }

  // Check if version is already published
  try {
    const remoteVer = execSync(`npm view ${pkgJson.name} version`, { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (remoteVer === pkgJson.version) {
      rawStdout(`[npm-publish-web] ${pkgJson.name}@${pkgJson.version} is already published on registry. Skipping.\n`);
      return;
    }
  } catch (e) {
    // 404 means package or version not yet published
  }

  rawStdout(`[npm-publish-web] Publishing ${pkgJson.name}@${pkgJson.version} ...\n`);

  const scriptRunner = path.join(__dirname, 'npm-publish-web.js');

  const cmd = `node "${scriptRunner}" "${targetDir}"`;
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
}

function runAll() {
  const root = path.resolve(__dirname, '..');
  const dirs = [];

  ['packages', 'plugins'].forEach((folder) => {
    const p = path.join(root, folder);
    if (fs.existsSync(p)) {
      for (const d of fs.readdirSync(p)) {
        const full = path.join(p, d);
        if (fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'package.json'))) {
          dirs.push(full);
        }
      }
    }
  });

  rawStdout(`[npm-publish-web] Found ${dirs.length} monorepo packages to check.\n`);
  for (const dir of dirs) {
    try {
      publishPackageSync(dir);
    } catch (e) {
      rawStderr(`[npm-publish-web] Error publishing ${dir}: ${e.message}\n`);
    }
  }
}

// Main execution
const arg = process.argv[2];

if (arg === '--all') {
  runAll();
} else if (arg) {
  const targetDir = path.resolve(arg);
  process.chdir(targetDir);

  process.argv = [
    process.argv[0],
    getNpmCliPath(),
    'publish',
    '--access',
    'public',
    '--browser=false',
  ];

  require(getNpmCliPath());
} else {
  rawStdout(`Usage:\n  node scripts/npm-publish-web.js <package-path>\n  node scripts/npm-publish-web.js --all\n`);
}
