// free indent
<includes><p onclick={ click }/><p foo={ myObj.foo < 'bar' }></p>
  <!-- included at compile-time --><script src="riotjs.object.js"></script>
  <script src="../expect/riotjs.methods.js"></script>
  <script>      // tagged script
    click (e)   // free style, this comment does not break the parser
    {foo ({})}
  </script>
  /*
    untagged script block starts here
  */
  handle( e )   // another style
  {
    bar( {} )
  }
  .bind (this)
</includes>
