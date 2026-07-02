import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  target: 'node20'
});
