import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'
import defaults from './defaults'
import babel from 'rollup-plugin-babel'


export default Object.assign(defaults, {
  plugins: [
    npm({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/riot-tmpl/**'
    })
  ]
})