<loop-reorder-inner>

    <div each="{item in items}"><span>{item}</span></div>
    <button onclick={swap}>swap</button>

    this.items = ['one', 'two']
    this.on('mount', function() {
    this.root.querySelector('span').style.color = 'red'
    })
    swap() {
    this.items.reverse()
    }

</loop-reorder-inner>
