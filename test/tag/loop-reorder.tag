<loop-reorder>

  <div each="{items}" no-reorder>{x}</div>
  <span each="{items}">{x}</span>

  this.items = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }, { x: 6 }]

  this.on('mount', function() {
    var spans = this.root.querySelectorAll('span'),
        divs = this.root.querySelectorAll('div')
    ;[].slice.call(spans).forEach(function(span, i){
      span.className = 'nr-' + i
    })
    ;[].slice.call(divs).forEach(function(div, i){
      div.className = 'nr-' + i
    })
  })

</loop-reorder>
