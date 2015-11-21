//src: free-style.tag
// free indent

riot.tag2('free-style', '<p onclick="{click}"></p>', '', '', function(opts) {

      this.click = function(e)
      {foo ({})}.bind(this)

click(0)

click(1)

    this.handle = function( e )
    {
      bar( {} )
    }
    .bind (this)
}, '{ }');

// done