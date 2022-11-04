const commonjs = require('@rollup/plugin-commonjs')
const {nodeResolve} = require('@rollup/plugin-node-resolve')
const emptyFile = 'export default undefined'
const babel = require('rollup-plugin-babel')

const ignoredModules = [
  'fs',
  'path',
  'esprima'
]

// ignore builtin requires
function ignore() {
  return {
    transform(code, id) {
      if (!id.includes('commonjs-external')) return

      return {
        code: emptyFile,
        map: null
      }
    }
  }
}

module.exports = {
  output: [{
    banner: '/* Riot WIP, @license MIT */',
    name: 'riot',
    generatedCode: {
      constBindings: true
    },
    globals: ignoredModules.reduce((acc, dep) => ({
      [dep]: dep,
      ...acc
    }), {})
  }],
  external: ignoredModules,
  plugins: [
    ignore(),
    babel({
      ignore: [/[/\\]core-js/, /@babel[/\\]runtime/],
      env: {
        test: {
          plugins: [
            [
              'istanbul',
              {
                exclude: [
                  '**/*.spec.js'
                ]
              }
            ]
          ]
        }
      },
      presets: ['@riotjs/babel-preset']
    }),
    nodeResolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**',
      transformMixedEsModules: true,
      ignoreTryCatch: false,
      ignoreDynamicRequires: true,
      exclude: ignoredModules,
      ignoreGlobal: true
    })
  ]
}
