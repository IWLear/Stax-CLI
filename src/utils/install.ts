import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function installDependencies(targetDir: string, packageManager: 'npm' | 'yarn' | 'pnpm'): Promise<void> {
  const command = packageManager === 'pnpm' ? 'pnpm' : packageManager === 'yarn' ? 'yarn' : 'npm';
  await execFileAsync(command, ['install'], { cwd: targetDir });
}
