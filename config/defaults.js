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
    // ignore the coverage of riot external modules like riot-tmpl
    {
      transform (code) {
        return {
          code: code.replace(/export\nvar (brackets|tmpl) =/g, function(m) {
            return ['/* istanbul ignore next */', m].join('\n')
          })
        }
      }
    },
    buble()
  ]
}