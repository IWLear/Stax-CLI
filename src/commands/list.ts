import chalk from 'chalk';
import { Command } from 'commander';

const templates = [
  { name: 'react', description: 'Vite + React + Tailwind' },
  { name: 'express', description: 'Express + Prisma + Zod' },
  { name: 'fullstack', description: 'React + Express monorepo' }
];

const features = [
  { name: 'prisma', description: 'Add Prisma support' },
  { name: 'docker', description: 'Add Docker files' },
  { name: 'github-actions', description: 'Add CI workflow' },
  { name: 'tailwind', description: 'Add Tailwind CSS' }
];

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List available templates and features')
    .action(() => {
      printTable('Templates', templates);
      console.log('');
      printTable('Features', features);
    });
}

function printTable(title: string, rows: Array<{ name: string; description: string }>): void {
  const nameWidth = Math.max('Name'.length, ...rows.map((row) => row.name.length));
  const descriptionWidth = Math.max('Description'.length, ...rows.map((row) => row.description.length));
  const border = `+${'-'.repeat(nameWidth + 2)}+${'-'.repeat(descriptionWidth + 2)}+`;

  console.log(chalk.bold(title));
  console.log(border);
  console.log(`| ${'Name'.padEnd(nameWidth)} | ${'Description'.padEnd(descriptionWidth)} |`);
  console.log(border);
  for (const row of rows) {
    console.log(`| ${chalk.cyan(row.name.padEnd(nameWidth))} | ${row.description.padEnd(descriptionWidth)} |`);
  }
  console.log(border);
}
