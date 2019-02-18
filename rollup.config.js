const {builtinModules}= require('module')
const commonjs = require('rollup-plugin-commonjs')
const ignore = require('rollup-plugin-ignore')
const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')

module.exports = {
  context: 'null',
  moduleContext: 'null',
  output: {
    banner: '/* Riot WIP, @license MIT */',
    format: 'umd',
    name: 'riot'
  },
  onwarn: function(error) {
    if (/external dependency|Circular dependency/.test(error.message)) return
    console.error(error.message) // eslint-disable-line
  },
  plugins: [
    ignore(builtinModules),
    resolve({
      jsnext: true
    }),
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
      presets: [
        [
          '@babel/env',
          {
            useBuiltIns: 'entry',
            modules: false,
            loose: true,
            targets: {
              'edge': 15
            }
          }
        ]
      ]
    })
  ]
}