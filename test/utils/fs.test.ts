import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ensureNewProjectDirectory, updatePackageJson } from '../../src/utils/fs';

describe('fs utilities', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('creates an empty target directory', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'stax-fs-'));
    tempDirs.push(tempDir);
    const targetDir = path.join(tempDir, 'demo');

    await ensureNewProjectDirectory(targetDir);

    await expect(ensureNewProjectDirectory(targetDir)).resolves.toBeUndefined();
  });

  it('rejects non-empty target directories', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'stax-fs-'));
    tempDirs.push(tempDir);
    const targetDir = path.join(tempDir, 'demo');
    await ensureNewProjectDirectory(targetDir);
    await writeFile(path.join(targetDir, 'existing.txt'), 'hello');

    await expect(ensureNewProjectDirectory(targetDir)).rejects.toThrow('already exists');
  });

  it('updates package.json with structured JSON writes', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'stax-fs-'));
    tempDirs.push(tempDir);
    await writeFile(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'demo' }));

    const next = await updatePackageJson(tempDir, (packageJson) => ({
      ...packageJson,
      scripts: { dev: 'vite' }
    }));

    expect(next).toEqual({ name: 'demo', scripts: { dev: 'vite' } });
  });
});
