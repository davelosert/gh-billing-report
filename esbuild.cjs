const { build } = require('esbuild');

build({
    bundle: true,
    platform: 'node',
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    target: 'node20',
}).catch(() => process.exit(1));
