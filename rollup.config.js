import {builtinModules} from 'module'
import commonjs from 'rollup-plugin-commonjs'
import ignore from 'rollup-plugin-ignore'
import json from 'rollup-plugin-json'
import resolve  from 'rollup-plugin-node-resolve'
import strip from 'rollup-plugin-strip'

export default {
  context: 'null',
  moduleContext: 'null',
  output: {
    banner: '/* Riot WIP, @license MIT */',
    format: 'umd',
    name: 'riot'
  },
  plugins: [
    strip({
      debugger: true,
      // defaults to `[ 'console.*', 'assert.*' ]`
      functions: [ 'assert.*', 'debug', 'alert' ],
      sourceMap: false
    }),
    ignore(builtinModules),
    resolve({jsnext: true}),
    commonjs(),
    json()
  ]
}