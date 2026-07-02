import { createTemplateContext, generateBaseFiles, renderTemplateDirectory } from './base';
import { addFeatureToProject } from './features';

export interface ExpressProjectOptions {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  useDocker: boolean;
  usePrisma: boolean;
  useGitHubActions: boolean;
}

export async function generateExpressProject(options: ExpressProjectOptions, rootDir: string): Promise<void> {
  const context = createTemplateContext({ ...options, template: 'express' }, 'express');

  await generateBaseFiles(rootDir, context);
  await renderTemplateDirectory('express', rootDir, context, {
    skip: (relativePath) => !options.usePrisma && (relativePath.startsWith('prisma/') || relativePath.includes('/lib/prisma'))
  });

  if (options.useDocker) {
    await addFeatureToProject('docker', rootDir, context);
  }

  if (options.useGitHubActions) {
    await addFeatureToProject('github-actions', rootDir, context);
  }
}
