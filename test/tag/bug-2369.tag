<bug-2369>
  <h1>{ getSpaceName(message) }</h1>

  <script>
    this.message = 'display/example/stuff'
    this.getSpaceName = function(link) {
        return link.match(/display\/(\w+)\//)[1]
    }
  </script>
</bug-2369>
