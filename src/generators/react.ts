import { createTemplateContext, generateBaseFiles, renderTemplateDirectory } from './base';
import { addFeatureToProject } from './features';

export interface ReactProjectOptions {
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  useDocker: boolean;
  usePrisma: boolean;
  useGitHubActions: boolean;
}

export async function generateReactProject(options: ReactProjectOptions, rootDir: string): Promise<void> {
  const context = createTemplateContext({ ...options, template: 'react', usePrisma: false }, 'react');

  await generateBaseFiles(rootDir, context);
  await renderTemplateDirectory('react', rootDir, context);

  if (options.useDocker) {
    await addFeatureToProject('docker', rootDir, context);
  }

  if (options.useGitHubActions) {
    await addFeatureToProject('github-actions', rootDir, context);
  }
}
