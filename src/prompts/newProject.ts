import inquirer from 'inquirer';

export type ProjectTemplate = 'react' | 'express' | 'fullstack';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface NewProjectAnswers {
  template: ProjectTemplate;
  packageManager: PackageManager;
  useDocker: boolean;
  useGitHubActions: boolean;
  usePrisma: boolean;
  projectName: string;
}

export async function promptForNewProject(projectName: string): Promise<NewProjectAnswers> {
  const answers = await inquirer.prompt<Partial<NewProjectAnswers>>([
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Express', value: 'express' },
        { name: 'Fullstack', value: 'fullstack' }
      ]
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Choose a package manager',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' }
      ]
    },
    {
      type: 'confirm',
      name: 'useDocker',
      message: 'Include Docker?',
      default: false
    },
    {
      type: 'confirm',
      name: 'useGitHubActions',
      message: 'Include GitHub Actions CI?',
      default: false
    },
    {
      type: 'confirm',
      name: 'usePrisma',
      message: 'Include Prisma?',
      default: true,
      when: (answers) => answers.template === 'express' || answers.template === 'fullstack'
    }
  ] as const);

  return {
    template: answers.template ?? 'react',
    packageManager: answers.packageManager ?? 'npm',
    useDocker: Boolean(answers.useDocker),
    useGitHubActions: Boolean(answers.useGitHubActions),
    usePrisma: Boolean(answers.usePrisma),
    projectName
  };
}
