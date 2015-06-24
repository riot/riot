/**
 * Syntax checker for Riot.js
 */

/*
ANALYZING STEPS:

1. Devide into blocks by line-level analysis
2. Validate Tag file layout
3. TODO: validate Riot template
4. TODO: validate script in tag
5. TODO: validate style in tag
6. TODO: validate js outside
*/

var LINE_TAG = /^<([\w\-]+)>(.*)<\/\1>\s*$/,
  TAG_START = /^<([\w\-]+)\s?([^>]*)>\s*$/,
  TAG_END = /^<\/([\w\-]+)>\s*$/,
  HTML_END_DETECTOR = /<\/([\w\-]+)>\s*$/,
  INVALID_TAG = /^</,
  STYLE_START = /^\s+<style\s?([^>]*)>\s*$/,
  STYLE_END = /^\s+<\/style>\s*$/,
  SCRIPT_START = /^\s+<script\s?([^>]*)>\s*$/,
  SCRIPT_END = /^\s+<\/script>\s*$/

var ERR_TAG_UNMATCH = 'Closing tag unmatch',
  ERR_NO_INDENT = 'Indentation needed within tag definition',
  ERR_INVALID_TAG = 'Invalid tag flagment',
  ERR_TAG_NOT_CLOSED = 'Last tag definition is not closed'

function analyze(source) {
  var mode = 'outside',// outside | tag_start | tag | tag_end | template | script | style
    tag = ''

  var results = source.split('\n').map(function(row, n) {
    var m, err = '', type

    if (m = row.match(TAG_START)) {
      // Custam tag starting
      type = 'tag_start'
      if (mode == 'tag') { err = ERR_NO_INDENT }
      else { tag = m[1]; mode = 'tag' }
    } else if (m = row.match(TAG_END)) {
      // Custam tag ending
      type = 'tag_end'
      if (tag != m[1]) { err = ERR_TAG_UNMATCH }
      else { tag = ''; mode = 'outside' }
    } else if (m = row.match(LINE_TAG)) {
      // Custom line tag
      if (mode == 'tag') { type = mode; err = ERR_NO_INDENT }
      else { type = 'line_tag'; tag = ''; mode = 'outside' }
    } else if (m = row.match(INVALID_TAG)) {
      // Other invalid tags
      if (mode == 'tag') err = ERR_NO_INDENT
        else err = ERR_INVALID_TAG
      type = mode
    } else if (m = row.match(STYLE_START)) {
      // Style starting
      type = 'style_start'; mode = 'style'; block = ''
    } else if (m = row.match(STYLE_END)) {
      // Style ending
      type = 'style_end'; mode = 'tag'; block = ''
    } else if (m = row.match(SCRIPT_START)) {
      // Script starting
      type = 'script_start'; mode = 'script'; block = ''
    } else if (m = row.match(SCRIPT_END)) {
      // Script ending
      type = 'script_end'; mode = 'tag'; block = ''
    } else {
      if (m = row.match(HTML_END_DETECTOR)) type = 'template'
        else type = mode
    }

    return {
      line: 'L' + (n + 1),
      source: row,
      type: type,
      error: err
    }
  })

  results.push({
    line: 'EOF',
    source: '',
    type: 'end_of_file',
    error: (mode == 'outside') ? '' : ERR_TAG_NOT_CLOSED
  })

  // scan backward to detect script block in tag
  for (var t, i = results.length - 1; i <= 0; i--) {
    t = results[i].type
    if (t == 'tag_end') mode = 'script'
      else if (['template', 'style', 'script'].indexOf(t) > -1) mode = 'template'
        else if (t == 'tag') results[i].type = mode
  }

  return results
}

module.exports = analyze
