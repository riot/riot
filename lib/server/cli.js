#!/usr/bin/env node
//
// Use in CLI:
//
//   Type "riot" for help.
//
// Use in Node:
//
//   var riot = require('riot/compiler')
//   riot.make({ from: 'foo', to: 'bar', compact: true })
//   riot.watch({ from: 'foo.tag', to: 'bar.js' })
//

var ph = require('path'),
  sh = require('shelljs'),
  chokidar = require('chokidar'),
  chalk = require('chalk'),
  compiler = require('./compiler'),
  analyzer = require('./analyzer'),
  TEMP_FILE_NAME = /\/[^.~][^~/]+$/ // skip temporary files (created by editors), e.g. /.name.tag, /~name.tag, /name~.tag

var ext

function find(from) {
  return sh.find(from).filter(function(f) {
    return ext.test(f) && TEMP_FILE_NAME.test(f)
  })
}
function remap(from, to, base) {
  return from.map(function(from) {
    return ph.join(to, ph.relative(base, from).replace(ext, '.js'))
  })
}

var methods = {

  help: function() {
    log([
      '',
      'Builds .tag files to .js',
      '',
      'Options:',
      '',
      '  -h, --help      You\'re reading it',
      '  -v, --version   Print Riot\'s version',
      '  -w, --watch     Watch for changes',
      '  -c, --compact   Minify </p> <p> to </p><p>',
      '  -t, --type      JavaScript pre-processor. Built-in support for: es6, coffeescript, typescript, livescript, none',
      '  -m, --modular   AMD and CommonJS',
      '  --template      HTML pre-processor. Built-in support for: jade',
      '  --whitespace    Preserve newlines and whitepace',
      '  --brackets      Change brackets used for expressions. Defaults to { }',
      '  --expr          Run expressions trough parser defined with --type',
      '  --ext           Change tag file extension. Defaults to .tag',
      '',
      'Build a single .tag file:',
      '',
      '  riot foo.tag           To a same named file (foo.js)',
      '  riot foo.tag bar.js    To a different named file (bar.js)',
      '  riot foo.tag bar       To a different dir (bar/foo.js)',
      '',
      'Build all .tag files in a directory:',
      '',
      '  riot foo/bar           To a same directory (foo/**/*.js)',
      '  riot foo/bar baz       To a different directory (baz/**/*.js)',
      '  riot foo/bar baz.js    To a single concatenated file (baz.js)',
      '',
      'Examples for options:',
      '',
      '  riot foo bar',
      '  riot --w foo bar',
      '  riot --watch foo bar',
      '  riot --compact foo bar',
      '  riot foo bar --compact',
      '  riot test.tag --type coffeescript --expr',
      ''
    ].join('\n'))
  },


  version: function() {
    log(require('../../package.json').version)
  },


  make: function(opt) {
    init(opt)

    // Generate a list of input/output files

    var from = opt.flow[0] == 'f' ? [opt.from] : find(opt.from),
      base = opt.flow[0] == 'f' ? ph.dirname(opt.from) : opt.from,
      to = opt.flow[1] == 'f' ? [opt.to] : remap(from, opt.to, base)

    // Create any necessary dirs

    var dirs = {}
    to.map(function(f) { dirs[ph.dirname(f)] = 0 })
    sh.mkdir('-p', Object.keys(dirs))

    // Process files

    function encapsulate(from) {
      if (!opt.compiler.modular) {
        return from
      }

      var out = ''
      out += '(function(tagger) {\n'
      out += '  if (typeof define === \'function\' && define.amd) {\n'
      out += '    define([\'riot\'], function(riot) { tagger(riot); });\n'
      out += '  } else if (typeof module !== \'undefined\' && typeof module.exports !== \'undefined\') {\n'
      out += '    tagger(require(\'riot\'));\n'
      out += '  } else {\n'
      out += '    tagger(window.riot);\n'
      out += '  }\n'
      out += '})(function(riot) {\n'
      out += from
      out += '\n});'
      return out
    }

    function parse(from) { return compiler.compile(sh.cat(from).replace(/^\uFEFF/g, /* strips BOM */''), opt.compiler) }
    function toFile(from, to) { encapsulate(from.map(function (path, i) { return parse(path) }).join('\n')).to(to[0]) }
    function toDir(from, to) { from.map(function(from, i) { encapsulate(parse(from)).to(to[i]) }) }
    ;(opt.flow[1] == 'f' ? toFile : toDir)(from, to)

    // Print what's been done

    from.map(function(src, i) {
      log(toRelative(src) + ' -> ' + toRelative(to[i] || to[0]))
    })

  },


  watch: function(opt) {
    init(opt)

    methods.make(opt)

    var glob = opt.flow[0] == 'f' ? opt.from : ph.join(opt.from, '**/*.'+opt.ext)

    chokidar.watch(glob, { ignoreInitial: true })
      .on('ready', function() { log('Watching ' + toRelative(glob)) })
      .on('all', function(e, path) { methods.make(opt) })

  },

  check: function(opt) {
    init(opt)

    //TODO: analyze each file separatedly
    var from = opt.flow[0] == 'f' ? [opt.from] : find(opt.from)
    var source = sh.cat(from).replace(/^\uFEFF/g, /* strips BOM */'')
    var errors = analyzer(source).filter(function(result) { return result.error })

    if (errors.length) {
      log(chalk.white.bgRed(' Riot Tag Syntax Error '))
      errors.map(function(result) {
        log(chalk.gray(result.line + '| ') + result.source)
        log(chalk.red('^^^ ' + result.error))
      })
      log(chalk.gray('Total error: ' + errors.length))
    } else {
      log(chalk.green('No syntax error. Ready to compile :)'))
    }
  }
}

function init(opt) {

  // Run only once

  if (init.called) return
  init.called = true

  if (!opt.ext) opt.ext = 'tag'
  ext = RegExp('\\.' + opt.ext + '$')

  // If no target dir, default to source dir

  if (!opt.to) opt.to = ext.test(opt.from) ? ph.dirname(opt.from) : opt.from

  // Resolve to absolute paths

  opt.from = ph.resolve(opt.from)
  opt.to = ph.resolve(opt.to)

  // Throw if source path doesn't exist

  if (!sh.test('-e', opt.from)) err('Source path does not exist')

  // Determine the input/output types

  opt.flow = (ext.test(opt.from) ? 'f' : 'd') + (/\.js$/.test(opt.to) ? 'f' : 'd')
}

function cli() {

  // Get CLI arguments

  var args = require('minimist')(process.argv.slice(2), {
    boolean: ['watch', 'compact', 'help', 'version', 'whitespace', 'modular', 'check'],
    alias: { w: 'watch', c: 'compact', h: 'help', v: 'version', t: 'type', m: 'modular' }
  })

  // Translate args into options hash

  var opts = {
    compiler: {
      compact: args.compact,
      template: args.template,
      type: args.type,
      brackets: args.brackets,
      expr: args.expr,
      modular: args.modular,
      whitespace: args.whitespace
    },
    ext: args.ext,
    from: args._.shift(),
    to: args._.shift()
  }

  // Call matching method

  var method = Object.keys(methods).filter(function(v) { return args[v] })[0]
    || ( opts.from ? 'make' : 'help' )

  methods[method](opts)

}


function toRelative(path) {
  return path.replace(sh.pwd() + '/', '')
}

function log(msg) {
  if (!log.silent) console.log(msg)
}

function err(msg) {
  msg += '\n'
  if (!log.silent) log(msg) || process.exit(1)
  else throw msg
}


// Run from CLI or as Node module

if (module.parent) {
  module.exports = methods
  log.silent = true
} else cli()
