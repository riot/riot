import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import alias from 'rollup-plugin-alias'
import buble from 'rollup-plugin-buble'
import path from 'path'
var defaults = require('./defaults')

const tmplPath = path.resolve(process.cwd(), 'node_modules', 'riot-tmpl', 'dist', 'csp.tmpl.js')

export default Object.assign(defaults, {
  plugins: [
    alias({
      'riot-tmpl': tmplPath
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        [tmplPath]: ['tmpl', 'brackets']
      }
    }),
    buble()
  ]
})