
riot.tag('kids', '<h3 each="{ kids[1 .. 2] }">{ name }</h3>', function(opts) {

  # Here are the kids
  this.kids = [
    { name: "Max" }
    { name: "Ida" }
    { name: "Joe" }
  ]


});
