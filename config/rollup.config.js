import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'
import defaults from './defaults'


export default Object.assign(defaults, {
  plugins: [
    npm({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' })
  ]
})