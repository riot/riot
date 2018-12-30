import resolve  from 'rollup-plugin-node-resolve'

export default {
  format: 'umd',
  name: 'riot',
  banner: '/* Riot WIP, @license MIT */',
  context: 'null',
  moduleContext: 'null',
  plugins: [
    resolve({ jsnext: true, main: true })
  ]
}