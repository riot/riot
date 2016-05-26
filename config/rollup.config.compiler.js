import nodeResolve from 'rollup-plugin-node-resolve'

var defaults = require('./defaults')

export default Object.assign(defaults, {
  plugins: [
    nodeResolve({ jsnext: true, main: true, skip: ['riot-tmpl'] }),
    defaults.plugins[1], // common
    defaults.plugins[2] //babel
  ]
})