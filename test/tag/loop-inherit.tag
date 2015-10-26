<loop-inherit>
  <div each={ item, index in items} class={ active: item == 'active' }>
    <loop-inherit-item id={ index } name={ item } nice={ isFun } onmouseenter={ onMouseEnter }></loop-inherit-item>
  </div>

  <loop-inherit-list each={ item in items } if={ item != 'me' }></loop-inherit-list>

  <loop-inherit-item name="boh" onmouseenter={ onMouseEnter }></loop-inherit-item>

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

<loop-inherit-list>
  <loop-inherit-item></loop-inherit-item>
</loop-inherit-list>