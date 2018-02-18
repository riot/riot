const commonjs = require('rollup-plugin-commonjs'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  buble = require('rollup-plugin-buble')

module.exports = {
  output: {
    name: 'riot',
    format: 'umd',
    banner: '/* Riot WIP, @license MIT */',
  },
  onwarn(warning) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
  },
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
          code: code.replace(/(export\nvar (brackets|tmpl)|var (observable)) =/g, function(m) {
            return ['/* istanbul ignore next */', m].join('\n')
          })
        }
      }
    },
    buble()
  ]
}