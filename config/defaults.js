const commonjs = require('rollup-plugin-commonjs'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  buble = require('rollup-plugin-buble')

module.exports = {
  format: 'umd',
  moduleName: 'riot',
  banner: '/* Riot WIP, @license MIT */',
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs({
      include: 'node_modules/**',
      ignoreGlobal: true
    }),
    buble()
  ]
}