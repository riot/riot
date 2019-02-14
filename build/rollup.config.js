const {builtinModules}= require('module')
const commonjs = require('rollup-plugin-commonjs')
const ignore = require('rollup-plugin-ignore')
const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')

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
    json()
  ]
}