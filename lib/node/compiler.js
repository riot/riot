this.riot = require(process.env.RIOT || '../../riot')
this.riot.parsers = require('./parsers')
module.exports = require('../helpers/compiler-shared')