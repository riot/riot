import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'

export default {
  format: 'umd',
  moduleName: 'riot',
  plugins: [
    npm({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' })
  ]
}