var compilerPath = require('path').join(__dirname, '../shared/compiler.js')

var riot = require(process.env.RIOT || '../../riot')
riot.parsers = require('./parsers')

var compiler = require(compilerPath)(riot)

module.exports = compiler