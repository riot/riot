const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const {nodeResolve} = require('@rollup/plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const emptyFile = 'export default undefined'

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
    name: 'riot'
  }],
  onwarn: function(error) {
    if (/external dependency|Circular dependency/.test(error.message)) return
    console.error(error.message) // eslint-disable-line
  },
  plugins: [
    ignore(),
    nodeResolve(),
    commonjs(),
    json(),
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
    })
  ]
}