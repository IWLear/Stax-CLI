import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function initializeGitRepository(targetDir: string): Promise<void> {
  await execFileAsync('git', ['init'], { cwd: targetDir });
  await execFileAsync('git', ['add', '.'], { cwd: targetDir });
  await execFileAsync('git', ['commit', '-m', 'chore: initial scaffold'], { cwd: targetDir, env: { ...process.env, GIT_AUTHOR_NAME: 'stax', GIT_AUTHOR_EMAIL: 'stax@example.com', GIT_COMMITTER_NAME: 'stax', GIT_COMMITTER_EMAIL: 'stax@example.com' } });
}
