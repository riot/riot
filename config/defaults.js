const commonjs = require('rollup-plugin-commonjs'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  babel = require('rollup-plugin-babel')

module.exports = {
  format: 'umd',
  moduleName: 'riot',
  banner: '/* Riot WIP, @license MIT */',
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    babel({
      compact: false,
      exclude: 'node_modules/**'
    })
  ]
}