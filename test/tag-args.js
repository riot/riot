
// this tests the args of riot.tag

// TODO: make it an automated test, and move where it belongs

function test(name, html) {
  var args = Array.prototype.slice.call(arguments, 2),
      fn = args.pop(),                                // fn is always the last arg
      css = args[0] && args[0].trim && args.shift(),  // css is the remaining string
      opts = args.pop()                               // options is whatever's left
  console.log(name, html, css, opts, fn)
}

test('name', 'html', 'css', {opt:4}, function(){})
test('name', 'html', {opt:4}, function(){})
test('name', 'html', function(){})
test('name', 'html', '', {}, function(){})
