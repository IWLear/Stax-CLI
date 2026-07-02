import { createTemplateContext, generateBaseFiles, renderTemplateDirectory } from './base';
import { addFeatureToProject } from './features';

export interface FullstackProjectOptions {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  useDocker: boolean;
  usePrisma: boolean;
  useGitHubActions: boolean;
}

export async function generateFullstackProject(options: FullstackProjectOptions, rootDir: string): Promise<void> {
  const context = createTemplateContext({ ...options, template: 'fullstack' }, 'fullstack');

  await generateBaseFiles(rootDir, context);
  await renderTemplateDirectory('fullstack', rootDir, context, {
    skip: (relativePath) => !options.usePrisma && (relativePath.includes('prisma/') || relativePath.includes('/lib/prisma'))
  });

  if (options.useDocker) {
    await addFeatureToProject('docker', rootDir, context);
  }

  if (options.useGitHubActions) {
    await addFeatureToProject('github-actions', rootDir, context);
  }
}
