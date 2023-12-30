import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
const emptyFile = 'export default undefined'

const ignoredModules = ['fs', 'path', 'esprima']

// ignore builtin requires
function ignore() {
  return {
    transform(code, id) {
      if (!id.includes('commonjs-external')) return

      return {
        code: emptyFile,
        map: null,
      }
    },
  }
}

export default {
  output: {
    banner: '/* Riot WIP, @license MIT */',
    name: 'riot',
    generatedCode: {
      constBindings: true,
    },
    globals: ignoredModules.reduce(
      (acc, dep) => ({
        [dep]: dep,
        ...acc,
      }),
      {},
    ),
    entryFileNames: (chunkInfo) =>
      chunkInfo.name.includes('node_modules')
        ? // replace the node_modules from the path in order to avoid nodejs esm conflicts
          `${chunkInfo.name.replace('node_modules', 'dependencies')}.js`
        : '[name].js',
  },
  external: ignoredModules,
  plugins: [
    ignore(),
    nodeResolve(),
    commonjs({
      include: 'node_modules/**',
      transformMixedEsModules: true,
      ignoreTryCatch: false,
      ignoreDynamicRequires: true,
      exclude: ignoredModules,
      ignoreGlobal: true,
    }),
  ],
}
