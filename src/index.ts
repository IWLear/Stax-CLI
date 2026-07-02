#!/usr/bin/env node
import { Command } from 'commander';
import { registerNewCommand } from './commands/new';
import { registerAddCommand } from './commands/add';
import { registerListCommand } from './commands/list';

const program = new Command();
program.name('stax').description('Interactive project scaffolder').version('0.1.0');

registerNewCommand(program);
registerAddCommand(program);
registerListCommand(program);

program.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
