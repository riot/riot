<loop-inherit>
  <div each={ item, index in items} class={ active: item == 'active' }>
    <loop-inherit-item id={ index } name={ item } nice={ isFun } onmouseenter={ onMouseEnter }></loop-inherit-item>
  </div>

  <button onclick={ add }>
    add
  </button>

  <button onclick={ remove }>
    remove second last
  </button>

  var words = ['what', 'oh', 'good', 'foo', 'bar']

  this.items = [
    'me',
    'you',
    'everybody'
  ]

  this.isFun = true

  add() {
    this.items.push(words[~~(Math.random() * words.length)])
  }

  remove() {
    this.items.splice(this.items.length - 2, 1)
  }

  onMouseEnter() {
    if(!this.wasHovered) this.add()
    this.wasHovered = true
  }

</loop-inherit>

<loop-inherit-item onclick={ onClick }>

  <p class={ nice: opts.nice }>{ label } #{ id }</p>

  this.label = opts.name
  this.id = opts.id

  onClick() {
    this.wasClicked = true
  }

  this.on('update', function() {
    this.label = opts.name
    this.id = opts.id
  })

</loop-inherit-item>