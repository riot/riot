//src: html-blocks.tag
// <y && y> can be confused with a closing html tag

riot.tag2('html-block1', '', '', '', function(opts) {
  var n = x <y && y>
    z
});

riot.tag2('html-block2', '<input>', '', '', function(opts) {
  var n = x<1 ,5 >
    z
});
