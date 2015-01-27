
// override riot.tag

riot.tag = function(html, fn) {
  FN.push({html: html, fn: fn })
}

var tags = cat(tags)




riot.render = function(tagName, data) {

}