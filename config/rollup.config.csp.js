import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'
import alias from 'rollup-plugin-alias'
import path from 'path'
import defaults from './defaults'

const tmplPath = path.resolve(process.cwd(), 'node_modules', 'riot-tmpl', 'dist', 'csp.tmpl.js')

export default Object.assign(defaults, {
  plugins: [
    alias({
      'riot-tmpl': tmplPath
    }),
    npm({ jsnext: true, main: true }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        [tmplPath]: ['tmpl', 'brackets']
      }
    })
  ]
})