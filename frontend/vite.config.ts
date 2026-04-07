import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function readPackageVersion(): string {
  const packageJsonPath = resolve(__dirname, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
  return packageJson.version ?? '0.0.0';
}

function readGitShortSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: resolve(__dirname, '..') }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const buildDate = new Date().toISOString();
const frontendVersion = readPackageVersion();
const gitShortSha = readGitShortSha();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(frontendVersion),
    __APP_GIT_SHA__: JSON.stringify(gitShortSha),
    __APP_BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
