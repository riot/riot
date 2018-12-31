import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve  from 'rollup-plugin-node-resolve'

export default {
  banner: '/* Riot WIP, @license MIT */',
  context: 'null',
  moduleContext: 'null',
  plugins: [
    resolve({ jsnext:true, browser: true, main: true }),
    commonjs(),
    json()
  ]
}