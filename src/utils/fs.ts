import {
  ensureDir,
  pathExists,
  readJson,
  readdir,
  writeFile,
  writeJson
} from 'fs-extra';
import path from 'node:path';

export type JsonObject = Record<string, unknown>;

export async function assertProjectRoot(rootDir: string): Promise<void> {
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!(await pathExists(packageJsonPath))) {
    throw new Error('No package.json found. Run this command from a project root.');
  }
}

export async function ensureNewProjectDirectory(targetDir: string): Promise<void> {
  if (await pathExists(targetDir)) {
    const entries = await readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Target directory already exists and is not empty: ${targetDir}`);
    }
  }

  await ensureDir(targetDir);
}

export async function readJsonFile<T extends JsonObject>(filePath: string): Promise<T> {
  try {
    return (await readJson(filePath)) as T;
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function writeJsonFile(filePath: string, data: JsonObject): Promise<void> {
  try {
    await ensureDir(path.dirname(filePath));
    await writeJson(filePath, data, { spaces: 2 });
  } catch (error) {
    throw new Error(`Unable to write JSON at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function writeTextFile(filePath: string, contents: string, options: { overwrite?: boolean } = {}): Promise<void> {
  const overwrite = options.overwrite ?? true;
  if (!overwrite && (await pathExists(filePath))) {
    return;
  }

  try {
    await ensureDir(path.dirname(filePath));
    await writeFile(filePath, contents);
  } catch (error) {
    throw new Error(`Unable to write file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updatePackageJson(
  rootDir: string,
  updater: (packageJson: JsonObject) => JsonObject
): Promise<JsonObject> {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const current = await readJsonFile<JsonObject>(packageJsonPath);
  const next = updater(current);
  await writeJsonFile(packageJsonPath, next);
  return next;
}

export function mergeStringRecord(
  current: unknown,
  additions: Record<string, string>
): Record<string, string> {
  return {
    ...((current && typeof current === 'object' ? current : {}) as Record<string, string>),
    ...additions
  };
}
