<query-selector>
  <input class="first" value="a">
  <input class="first" value="b">
  <query-selector-sub class="second" value="x" />
  <div data-is="query-selector-sub" value="y"></div>
</query-selector>

<query-selector-sub>
  <p>{ opts.value }</p>
  <script>
    this.prop1 = 'Hi'
  </script>
</query-selector-sub>
