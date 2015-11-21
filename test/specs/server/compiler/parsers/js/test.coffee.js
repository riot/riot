riot.tag2('kids', '<h3 each="{kids.slice(1, 3)}">{name}</h3>', '', '', function(opts) {
this.kids = [
  {
    name: "Max"
  }, {
    name: "Ida"
  }, {
    name: "Joe"
  }
];
}, '{ }');