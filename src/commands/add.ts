import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { addFeatureToProject, FEATURES, isFeature } from '../generators/features';

export function registerAddCommand(program: Command): void {
  program
    .command('add <feature>')
    .description('Add a feature to an existing project')
    .addHelpText('after', `\nAvailable features: ${FEATURES.join(', ')}`)
    .action(async (feature: string) => {
      if (!isFeature(feature)) {
        throw new Error(`Unsupported feature: ${feature}. Available features: ${FEATURES.join(', ')}`);
      }

      const spinner = ora(`Adding ${feature}...`).start();
      try {
        await addFeatureToProject(feature, process.cwd());
        spinner.succeed(`Added ${feature}`);
      } catch (error) {
        spinner.fail(`Failed to add ${feature}`);
        throw error;
      }

      console.log(chalk.green(`Run your package manager install command to fetch any new dependencies.`));
    });
}
