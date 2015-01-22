
// define custom tag
riot("todo", function(elems, data) {

  /* called when the component is rendered */

  <!-- inner HTML (aka. "shadow dom") -->
  <div class="foo" name="bar">
    <p>{ bar }</p>
  </div>

  // assigned instance variables
  this.root
  this.parent
  this.vdom
  this.elements


  // when attribute changes
  this.onattr(function(name, value, oldValue) {

  })

  // when inner text changes
  this.ontext(function(text, oldText) {

  })

})


// define custom attribute
riot("@each", function() {

})


// render all todo tags with optional data
riot.render("todo", data)

// render all components
riot.update()