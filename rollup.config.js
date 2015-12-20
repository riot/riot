import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'

export default {
  format: 'iife',
  moduleName: 'riot',
  plugins: [
    npm({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' })
  ]
}