import { execFileSync, spawn } from 'child_process';
import path from 'path';

function killProcessTree(pid: number): void {
  if (process.platform === 'win32') {
    // `npm run develop` on Windows spawns npm.cmd, which spawns node.exe as a child of
    // that child — `child.kill()` alone only kills npm.cmd and leaves node.exe orphaned.
    execFileSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    process.kill(-pid);
  }
}

const STRAPI_URL = 'http://localhost:1337/api/plans';
const CMS_DIR = path.resolve(__dirname, '../apps/cms');
const READY_LOG_PHRASE = 'Strapi started successfully';
const STARTUP_TIMEOUT_MS = 180_000;

async function isStrapiReachable(): Promise<boolean> {
  try {
    const response = await fetch(STRAPI_URL);
    return response.status > 0;
  } catch {
    return false;
  }
}

function waitForReadyLog(output: { text: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for Strapi to log "${READY_LOG_PHRASE}".\nLast output:\n${output.text}`));
    }, STARTUP_TIMEOUT_MS);

    const interval = setInterval(() => {
      if (output.text.includes(READY_LOG_PHRASE)) {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, 250);
  });
}

/**
 * Starts the Strapi dev server for the e2e run only if it isn't already reachable on
 * port 1337 (e.g. a developer already has it running locally). The returned function is
 * Playwright's global teardown hook, which only kills the process this setup itself
 * started — an externally-managed Strapi instance is left running.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  if (await isStrapiReachable()) {
    console.log('[global-setup] Strapi is already reachable on port 1337 — reusing it, not starting a new instance.');
    return async () => {};
  }

  console.log('[global-setup] Strapi is not reachable — starting it from apps/cms (npm run develop)...');

  const output = { text: '' };
  const child = spawn('npm run develop', {
    cwd: CMS_DIR,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk: Buffer) => (output.text += chunk.toString()));
  child.stderr?.on('data', (chunk: Buffer) => (output.text += chunk.toString()));

  child.once('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[global-setup] Strapi process exited early with code ${code}.\n${output.text}`);
    }
  });

  await waitForReadyLog(output);
  console.log('[global-setup] Strapi started successfully — proceeding with the e2e run.');

  return async () => {
    console.log('[global-setup] Stopping the Strapi instance this run started...');
    if (child.pid !== undefined) {
      try {
        killProcessTree(child.pid);
      } catch (error) {
        console.error('[global-setup] Failed to stop the Strapi process tree:', error);
      }
    }
  };
}
