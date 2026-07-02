import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateReactProject } from '../../src/generators/react';

async function collectFiles(root: string): Promise<string[]> {
  async function collect(currentDir: string): Promise<string[]> {
    const entries = await import('node:fs/promises').then((fs) => fs.readdir(currentDir, { withFileTypes: true }));
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collect(fullPath)));
      } else {
        files.push(path.relative(root, fullPath).replace(/\\/g, '/'));
      }
    }

    return files;
  }

  return (await collect(root)).sort();
}

describe('generateReactProject', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('creates the expected scaffold files', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'stax-react-'));
    tempDirs.push(tempDir);

    await generateReactProject({
      projectName: 'demo-app',
      packageManager: 'npm',
      useDocker: false,
      usePrisma: false,
      useGitHubActions: false
    }, tempDir);

    const files = await collectFiles(tempDir);
    expect(files).toEqual([
      ".eslintrc.json",
      ".gitignore",
      ".prettierrc",
      "index.html",
      "package.json",
      "postcss.config.cjs",
      "src/App.tsx",
      "src/components/Layout.tsx",
      "src/index.css",
      "src/main.tsx",
      "src/pages/Home.tsx",
      "tailwind.config.cjs",
      "tsconfig.json",
      "vite.config.ts",
    ]);
  });
});
