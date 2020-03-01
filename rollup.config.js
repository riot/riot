const {builtinModules}= require('module')
const commonjs = require('rollup-plugin-commonjs')
const ignore = require('rollup-plugin-ignore')
const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')

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
    ignore(builtinModules),
    resolve({
      mainFields: ['module', 'main', 'next']
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
      presets: ['@riotjs/babel-preset']
    })
  ]
}