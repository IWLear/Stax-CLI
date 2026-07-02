import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateExpressProject } from '../../src/generators/express';

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

describe('generateExpressProject', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('creates the expected scaffold files', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'stax-express-'));
    tempDirs.push(tempDir);

    await generateExpressProject({
      projectName: 'demo-api',
      packageManager: 'npm',
      useDocker: true,
      usePrisma: true,
      useGitHubActions: true
    }, tempDir);

    const files = await collectFiles(tempDir);
    expect(files).toEqual([
      ".dockerignore",
      ".env.example",
      ".eslintrc.json",
      ".github/workflows/ci.yml",
      ".gitignore",
      ".prettierrc",
      "Dockerfile",
      "docker-compose.yml",
      "package.json",
      "prisma/schema.prisma",
      "src/index.ts",
      "src/lib/prisma.ts",
      "src/middleware/errorHandler.ts",
      "src/middleware/validateRequest.ts",
      "src/routes/health.ts",
      "tsconfig.json",
    ]);
  });
});
