import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import path from 'node:path';
import { generateExpressProject } from '../generators/express';
import { generateFullstackProject } from '../generators/fullstack';
import { generateReactProject } from '../generators/react';
import { promptForNewProject } from '../prompts/newProject';
import { initializeGitRepository } from '../utils/git';
import { installDependencies } from '../utils/install';
import { ensureNewProjectDirectory } from '../utils/fs';

export function registerNewCommand(program: Command): void {
  program
    .command('new <project-name>')
    .description('Create a new project scaffold')
    .action(async (projectName: string) => {
      const targetDir = path.resolve(process.cwd(), projectName);
      await ensureNewProjectDirectory(targetDir);
      const answers = await promptForNewProject(projectName);

      const spinner = ora('Generating project scaffold...').start();
      try {
        if (answers.template === 'react') {
          await generateReactProject(answers, targetDir);
        } else if (answers.template === 'express') {
          await generateExpressProject(answers, targetDir);
        } else {
          await generateFullstackProject(answers, targetDir);
        }

      } catch (error) {
        spinner.fail('Failed to generate project');
        throw error;
      }

      spinner.succeed('Scaffold generated');

      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await initializeGitRepository(targetDir);
        gitSpinner.succeed('Git repository initialized');
      } catch (error) {
        gitSpinner.fail('Failed to initialize git repository');
        throw error;
      }

      const installSpinner = ora(`Installing dependencies with ${answers.packageManager}...`).start();
      try {
        await installDependencies(targetDir, answers.packageManager);
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        throw error;
      }

      printSuccessBox(projectName, answers.packageManager);
    });
}

function printSuccessBox(projectName: string, packageManager: 'npm' | 'yarn' | 'pnpm'): void {
  const devCommand = packageManager === 'pnpm' ? 'pnpm dev' : packageManager === 'yarn' ? 'yarn dev' : 'npm run dev';
  const lines = ['Project ready!', `cd ${projectName}`, devCommand];
  const width = Math.max(...lines.map((line) => line.length));
  const border = `+${'-'.repeat(width + 2)}+`;

  console.log('');
  console.log(chalk.green(border));
  for (const line of lines) {
    const padded = line.padEnd(width, ' ');
    console.log(chalk.green(`| ${line === 'Project ready!' ? chalk.bold(padded) : chalk.cyan(padded)} |`));
  }
  console.log(chalk.green(border));
}
