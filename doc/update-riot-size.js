// node doc/update-riot-size

require('shelljs/global')

var fs = require('fs'),
    // read the riot file stats
    riotStats = fs.statSync('riot.min.js'),
    riotSize = (riotStats.size/1000).toFixed(2)+'kb'

// loop all the markdown files in the ./doc/ folder
find('./doc')
  .filter(function(file) { return file.match(/\.md$/) })
  // add the readme file in the root
  .concat(['README.md'])
  // loop all the files
  .forEach(function(file) {
    var src = cat(file),
        // I know it's not elegant but it works pretty well
        spanRegex = /(<span class="riot-size">)(.*)(<\/span>)/,
        matches = src.match(spanRegex)

    if (!matches || matches.length != 4) return
    // replace the riot size in the current file parsed
    src = src.replace(spanRegex, matches[1] + riotSize + matches[3])
    console.log(file, matches[2] + ' => '  + riotSize)
    // write the file
    src.to(file)
  })

