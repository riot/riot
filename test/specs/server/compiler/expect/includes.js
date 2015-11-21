//src: includes.tag
// free indent
riot.tag2('includes', '<p onclick="{click}"></p><p foo="{myObj.foo < \'bar\'}"></p>', '', '', function(opts) {
  this.myObj = {
    foo: 'bar',
    baz: 'foo'
  }
  this.click = function(e) {
    alert('Hello!')
  }.bind(this)

      this.click = function(e)
      {foo ({})}.bind(this)

    this.handle = function( e )
    {
      bar( {} )
    }
    .bind (this)
}, '{ }');
