
<style-test>

  <header>
    <h1>{ title1 }</h1>
    <h2>{ title2 }</h2>
    <a class="button"><i class="twitter"></i> Twitter</a>
  </header>
  <h3 id="id">{ title3 }</h3>
  <ul>
    <li>Apple</li>
    <li>Orange</li>
  </ul>

  <style scoped>
    /* multi in a line */
    h1 { font-size: 150% } #id { color: #f00 }
    /* complex */
    header a.button:hover { text-decoration: none }
    /* comma separated */
    h2, h3 { border-bottom: 1px solid #000 }
    /* attr */
    i[class=twitter] { background: #55ACEE }
    /* backslash */
    a:after { content: '\25BA' }
    /* multi line */
    header {
      text-align: center;
      background: rgba(0,0,0,.2);
    }
    /* root scope */
    :scope { display: block }
    /* root scope nested */
    :scope > ul { padding: 0 }
    /* font-face */
    @font-face { font-family: 'FontAwesome' }
    /* media query */
    @media (min-width: 500px) {
      header {
        text-align: left;
      }
    }
  </style>

  <script>
    this.title1 = 'This is an example with Scoped-CSS.'
    this.title2 = 'KORE-WA-Scoped-CSS-NO-SAMPLE=DESU'
    this.title3 = 'List of fruits'
  </script>

</style-test>
