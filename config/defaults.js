const commonjs = require('rollup-plugin-commonjs'),
  npm = require('rollup-plugin-npm'),
  babel = require('rollup-plugin-babel')

module.exports = {
  format: 'umd',
  moduleName: 'riot',
  banner: '/* Riot WIP, @license MIT */',
  plugins: [
    npm({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/riot-tmpl/**'
    })
  ]
}