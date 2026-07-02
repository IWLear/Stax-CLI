import path from 'node:path';
import { pathExists } from 'fs-extra';
import {
  createTemplateContext,
  renderTemplateDirectory,
  toPackageName,
  toProjectTitle,
  type TemplateContext
} from './base';
import type { NewProjectAnswers, PackageManager } from '../prompts/newProject';
import { assertProjectRoot, mergeStringRecord, readJsonFile, updatePackageJson, type JsonObject } from '../utils/fs';

export const FEATURES = ['prisma', 'docker', 'github-actions', 'tailwind'] as const;
export type Feature = (typeof FEATURES)[number];

export interface FeatureOptions {
  projectName: string;
  packageManager: PackageManager;
  template: 'react' | 'express' | 'fullstack';
  useDocker: boolean;
  useGitHubActions: boolean;
  usePrisma: boolean;
}

export function isFeature(feature: string): feature is Feature {
  return FEATURES.includes(feature as Feature);
}

export async function detectPackageManager(rootDir: string): Promise<PackageManager> {
  if (await pathExists(path.join(rootDir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (await pathExists(path.join(rootDir, 'yarn.lock'))) {
    return 'yarn';
  }

  return 'npm';
}

export async function createContextForExistingProject(rootDir: string): Promise<TemplateContext> {
  const packageJson = await readJsonFile<JsonObject>(path.join(rootDir, 'package.json'));
  const name = typeof packageJson.name === 'string' ? packageJson.name : path.basename(rootDir);
  const packageManager = await detectPackageManager(rootDir);
  const dependencies = {
    ...((packageJson.dependencies ?? {}) as Record<string, string>),
    ...((packageJson.devDependencies ?? {}) as Record<string, string>)
  };
  const isReact = Boolean(dependencies.react || dependencies.vite);
  const isExpress = Boolean(dependencies.express);
  const template = isReact && isExpress ? 'fullstack' : isReact ? 'react' : 'express';
  const answers: NewProjectAnswers = {
    projectName: name,
    template,
    packageManager,
    useDocker: true,
    useGitHubActions: true,
    usePrisma: true
  };

  return {
    ...createTemplateContext(answers, template),
    packageName: toPackageName(name),
    projectTitle: toProjectTitle(name)
  };
}

export async function addFeatureToProject(feature: Feature, rootDir: string, context?: TemplateContext): Promise<void> {
  await assertProjectRoot(rootDir);
  const templateContext = context ?? (await createContextForExistingProject(rootDir));

  if (feature === 'docker') {
    await renderTemplateDirectory('features/docker', rootDir, templateContext);
    return;
  }

  if (feature === 'github-actions') {
    await renderTemplateDirectory('features/github-actions', rootDir, templateContext);
    return;
  }

  if (feature === 'tailwind') {
    await renderTemplateDirectory('features/tailwind', rootDir, templateContext);
    await addPackageEntries(rootDir, {
      devDependencies: {
        autoprefixer: '^10.4.20',
        postcss: '^8.4.49',
        tailwindcss: '^3.4.17'
      }
    });
    return;
  }

  await renderTemplateDirectory('features/prisma', rootDir, templateContext);
  await addPackageEntries(rootDir, {
    scripts: {
      'prisma:generate': 'prisma generate',
      'prisma:migrate': 'prisma migrate dev'
    },
    dependencies: {
      '@prisma/client': '^5.22.0'
    },
    devDependencies: {
      prisma: '^5.22.0'
    }
  });
}

async function addPackageEntries(
  rootDir: string,
  additions: {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }
): Promise<void> {
  await updatePackageJson(rootDir, (packageJson) => ({
    ...packageJson,
    scripts: mergeStringRecord(packageJson.scripts, additions.scripts ?? {}),
    dependencies: mergeStringRecord(packageJson.dependencies, additions.dependencies ?? {}),
    devDependencies: mergeStringRecord(packageJson.devDependencies, additions.devDependencies ?? {})
  }));
}
