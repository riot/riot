
riot.tag('inner-html', '<h3>Tag title</h3>', function(opts) {
  var h3 = this.root.firstChild,
      self = this

  self.on('mount', function() {
    self.root.appendChild(h3)
  })

})

riot.tag('loop-child', '<looped-child name="{ name }" each="{ items }"></looped-child>', function(opts) {
  this.items = [ {name: 'one'}, {name: 'two'} ]

})


riot.tag('looped-child', '<button onclick="{ hit }">{ opts.name }</button>', function(opts) {
  this.hit = function(e) {
    console.info(e.target)
  }.bind(this)

})


riot.tag('loop-context', '<li each="{ items }"> <a onclick="{ parent.toggle }">{ title }</a> <a onclick="{ parent.remove }">remove</a> <a onclick="{ fn }">fn</a> <span if="{ done }">{ parent.rand }</span> </li> <button onclick="{ random }">Set random</button>', function(opts) {
  var self = this

  this.items = [
    { title: 'Existing #1', done: true },
    { title: 'Existing #2', fn: function() {
      this.title = 'kissala'
    }}
  ]

  this.toggle = function(e) {
    var item = e.item
    item.done = !item.done
  }.bind(this)

  this.remove = function(e) {
    var i = self.items.indexOf(e.item)
    self.items.splice(i, 1)
  }.bind(this)

  this.random = function() {
    self.rand = ('' + Math.random()).slice(10)
  }.bind(this)

  this.random()

  setTimeout(function() {
    self.items.unshift({ title: 'Top #1' })
    self.items.push({ title: 'Bottom #new' })
    self.update()

  }, 100)

})

riot.tag('loop-manip', '<li each="{ items }"> { title } <a onclick="{ parent.remove }">remove</a> </li> <button onclick="{ top }">Top</button> <button onclick="{ bottom }">Bottom</button>', function(opts) {
  var self = this

  this.items = [{ title: 'First' }, { title: 'Second' }]

  this.bottom = function() {
    this.items.push({ title: Math.random() })
  }.bind(this)

  this.top = function() {
    this.items.unshift({ title: Math.random() })
  }.bind(this)

  this.remove = function(e) {
    var i = self.items.indexOf(e.item)
    self.items.splice(i, 1)
  }.bind(this)

})

riot.tag('loop-nested', '<h3>Nested object loop</h3> <div class="cat" each="{ cat, items in menu }"> <h4>{ cat }</h4> <p each="{ key, plan in items }">{ key } -> { plan }</p> </div>', function(opts) {
  var self = this

  this.menu = {
    Branding: { first: 'mini', second: 'small', third: 'med' },
    Shooting: { eka: 'mini', toka: 'small', kolmas: 'big' }
  }

})

riot.tag('loop-object', '<h3>Object loop</h3> <div> <p each="{ key, value in obj }">{ key } = { value }</p> </div>', function(opts) {
  this.obj = { zero: 0, one: 1, two: 2, three: 3 }

  var self = this

  setTimeout(function() {
    self.obj.zero = 'the first'
    self.update()
  }, 200)

})

riot.tag('loop-position', '<p> <span each="{ items }">{ x }</span> </p> <h3>between</h3> <span each="{ items }">{ x }</span>', function(opts) {
  this.items = [{ x: '1 ' }, { x: '2 ' }]

  setTimeout(function() {
    this.items.push({ x: 'third' })
    this.update()

  }.bind(this), 200)

})

riot.tag('loop-replace', '<div> <span>before</span> <strong each="{ items }">{ v }</strong> <span>after</span> </div>', function(opts) {
  var self = this
  self.items = [ { v: 'a' }, { v: 'b' } ]

  setTimeout(function() { self.update({ items: [ {v:'c'}, {v:'d'} ] }) }, 200)
  setTimeout(function() { self.items = [ {v:'e'}, {v:'f'} ]; self.update() }, 400)

})

riot.tag('loop-strings', '<h3>Array of primitives</h3> <p each="{ val, i in arr }">#{ i }: <strong>{ val }</strong></p> <button onclick="{ set }">Update</button>', function(opts) {
  this.arr = [ 'first', 110, Math.random(), 27.12 ]

  this.set = function() {
    this.arr[0] = 'manipulated'
    this.arr[2] = Math.random()
  }.bind(this)

})

riot.tag('tag-nesting', '<inner1 foo="{ foo }" bar="{ bar }"></inner1> <inner1 foo="{ foo }" bar="{ bar }"></inner1>', function(opts) {
  this.foo = { value: 10 }
  this.bar = { value: 20 }

  setTimeout(function() {
    this.foo.value = 30
    this.bar.value = 40
    this.update()

  }.bind(this), 300)

})

riot.tag('inner1', '<p>foo: { opts.foo.value }</p> <p>bar: { opts.bar.value }</p> <inner2 bar="{ opts.bar }"></inner2>', function(opts) {
})

riot.tag('inner2', '<p>Inner: { opts.bar.value + 50 }</p>', function(opts) {
})

riot.tag('timer', '<p>Seconds Elapsed: { time }</p>', function(opts) {
  this.time = opts.start || 0

  this.tick = function() {
    this.update({ time: ++this.time })
  }.bind(this)

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function() {
    console.info('timer cleared')
    clearInterval(timer)
  })

})


riot.tag('timetable', '<timer start="10"></timer> <timer start="20"></timer> <timer start="30"></timer>', function(opts) {
})