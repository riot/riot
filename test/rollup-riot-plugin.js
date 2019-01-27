// this is used only for the unit tests and it
// will moved at some point here https://github.com/riot/rollup-plugin-riot/blob/master/src/index.js
const compiler = require('@riotjs/compiler')

module.exports = () => ({
  transform: async function(code, id) {
    if (!/\.riot/.test(id)) return null
    const result = await compiler.compile(code, {
      file: id
    })

    return {
      code: result.code,
      map: result.map
    }
  }
})