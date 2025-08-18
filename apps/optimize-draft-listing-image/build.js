const esbuild = require('esbuild');

const build = async () => {
  try {
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node22',
      outfile: 'dist/index.js',
      external: ['sharp'], // Keep sharp as external since it has native binaries
      minify: true,
      sourcemap: true,
      format: 'cjs',
      logLevel: 'info',
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

build();