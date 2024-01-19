import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
const emptyFile = 'export default undefined'

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
    entryFileNames: (chunkInfo) =>
      chunkInfo.name.includes('node_modules')
        ? // replace the node_modules from the path in order to avoid nodejs esm conflicts
          `${chunkInfo.name.replace('node_modules', 'dependencies')}.js`
        : '[name].js',
  },
  plugins: [ignore(), nodeResolve(), commonjs()],
}
