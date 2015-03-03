describe('Compiler CLI', function() {

  require('./compiler/html')
  require('./compiler/scoped-css')
  require('./compiler/riotjs')

/*

  TODO: fix these tests
  // they depend on the dependecies installed on the local machine

  it('files', function() {

    function test (name, opts) {

      var type = opts.type,
          dir = 'test/compiler',
          basename = name + (type ? '.' + type : ''),
          src = cat(dir + '/' + basename + '.tag'),
          should = cat(dir + '/js/' + basename + '.js')

      expect(compiler.compile(src, opts).trim()).to.be.equal(should)

    }

    test('complex', {})
    test('test', { type: 'cs', expr: true })
    test('test', { type: 'es6' })
    test('test.jade', { template: 'jade' })
    test('slide.jade', { template: 'jade' })
    test('style', {})
    test('brackets', { brackets: '${ }' })

  })
*/
})
