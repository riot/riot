const commonjs = require('rollup-plugin-commonjs'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  babel = require('rollup-plugin-babel')

module.exports = {
  format: 'umd',
  moduleName: 'riot',
  banner: '/* Riot WIP, @license MIT */',
  indent: false,
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/riot-tmpl/**'
    })
  ]
}