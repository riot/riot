// free indent

<free-style><p onclick={ click }/>

    // also test compactation of empty lines

    <script>      // tagged script
      click (e)   // free style, this comment does not break the parser
      {foo ({})}
    </script>


    <script type= javascript>click(0)
    </script>
    <script
      charset = "utf8"
      type    = 'text/javascript'
      >click(1)</script >



    /*
      untagged script block starts here
    */
    handle( e )   // another style
    {
      bar( {} )
    }
    .bind (this)
</free-style>

// done