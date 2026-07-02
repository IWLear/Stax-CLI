import { ensureDir, pathExists, readdir, writeFile } from 'fs-extra';
import path from 'node:path';
import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import type { NewProjectAnswers, PackageManager, ProjectTemplate } from '../prompts/newProject';

export interface TemplateContext extends NewProjectAnswers {
  packageName: string;
  projectTitle: string;
  isReact: boolean;
  isExpress: boolean;
  isFullstack: boolean;
  packageManagerIsNpm: boolean;
  packageManagerIsYarn: boolean;
  packageManagerIsPnpm: boolean;
  devCommand: string;
  installCommand: string;
  ciInstallCommand: string;
  ciBuildCommand: string;
  ciTestCommand: string;
  dockerStartCommand: string;
  dockerPort: number;
}

Handlebars.registerHelper('eq', (left: unknown, right: unknown) => left === right);

export function toPackageName(projectName: string): string {
  const sanitized = projectName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[._-]+$/g, '')
    .replace(/--+/g, '-');

  return sanitized || 'stax-app';
}

export function toProjectTitle(projectName: string): string {
  return projectName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Stax App';
}

export function getPackageManagerCommands(packageManager: PackageManager): Pick<
  TemplateContext,
  'devCommand' | 'installCommand' | 'ciInstallCommand' | 'ciBuildCommand' | 'ciTestCommand'
> {
  if (packageManager === 'pnpm') {
    return {
      devCommand: 'pnpm dev',
      installCommand: 'pnpm install',
      ciInstallCommand: 'pnpm install --frozen-lockfile',
      ciBuildCommand: 'pnpm build',
      ciTestCommand: 'pnpm test'
    };
  }

  if (packageManager === 'yarn') {
    return {
      devCommand: 'yarn dev',
      installCommand: 'yarn install',
      ciInstallCommand: 'yarn install --frozen-lockfile',
      ciBuildCommand: 'yarn build',
      ciTestCommand: 'yarn test'
    };
  }

  return {
    devCommand: 'npm run dev',
    installCommand: 'npm install',
    ciInstallCommand: 'npm ci',
    ciBuildCommand: 'npm run build',
    ciTestCommand: 'npm test'
  };
}

export function createTemplateContext(options: NewProjectAnswers, template: ProjectTemplate): TemplateContext {
  const packageName = toPackageName(options.projectName);
  const commands = getPackageManagerCommands(options.packageManager);

  return {
    ...options,
    template,
    packageName,
    projectTitle: toProjectTitle(options.projectName),
    isReact: template === 'react',
    isExpress: template === 'express',
    isFullstack: template === 'fullstack',
    packageManagerIsNpm: options.packageManager === 'npm',
    packageManagerIsYarn: options.packageManager === 'yarn',
    packageManagerIsPnpm: options.packageManager === 'pnpm',
    ...commands,
    dockerStartCommand: getDockerStartCommand(options.packageManager, template, packageName),
    dockerPort: template === 'react' ? 4173 : 3000
  };
}

function getDockerStartCommand(packageManager: PackageManager, template: ProjectTemplate, packageName: string): string {
  if (template === 'react') {
    if (packageManager === 'yarn') {
      return 'yarn preview --host 0.0.0.0';
    }

    if (packageManager === 'pnpm') {
      return 'pnpm preview --host 0.0.0.0';
    }

    return 'npm run preview -- --host 0.0.0.0';
  }

  if (template === 'fullstack') {
    if (packageManager === 'yarn') {
      return `yarn workspace @${packageName}/server start`;
    }

    if (packageManager === 'pnpm') {
      return `pnpm --filter @${packageName}/server start`;
    }

    return `npm run start -w @${packageName}/server`;
  }

  if (packageManager === 'yarn') {
    return 'yarn start';
  }

  if (packageManager === 'pnpm') {
    return 'pnpm start';
  }

  return 'npm run start';
}

export async function resolveTemplateDir(group: string): Promise<string> {
  const candidates = [
    path.resolve(__dirname, '../templates', group),
    path.resolve(__dirname, '../src/templates', group)
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate template directory: ${group}`);
}

export async function renderTemplate(templatePath: string, targetPath: string, context: Record<string, unknown>): Promise<void> {
  const template = await readFile(templatePath, 'utf8');
  const compiled = Handlebars.compile(template);
  await ensureDir(path.dirname(targetPath));
  await writeFile(targetPath, compiled(context));
}

export async function renderTemplateDirectory(
  group: string,
  targetDir: string,
  context: Record<string, unknown>,
  options: { skip?: (relativePath: string) => boolean } = {}
): Promise<void> {
  const templatesDir = await resolveTemplateDir(group);

  async function renderDirectory(sourceDir: string): Promise<void> {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const relativePath = path.relative(templatesDir, sourcePath).replace(/\\/g, '/');

      if (options.skip?.(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await renderDirectory(sourcePath);
        continue;
      }

      const outputRelativePath = relativePath.endsWith('.hbs') ? relativePath.slice(0, -4) : relativePath;
      await renderTemplate(sourcePath, path.join(targetDir, outputRelativePath), context);
    }
  }

  await renderDirectory(templatesDir);
}

export async function generateBaseFiles(rootDir: string, context: TemplateContext): Promise<void> {
  await renderTemplateDirectory('base', rootDir, context);
}
