
riot.tag('loop-child', '<looped-child el="{ this }" each="{ items }"></looped-child>', function(opts) {

  this.items = [ {name: 'one'}, {name: 'two'} ]


});


riot.tag('looped-child', '<h3>{ opts.el.name }</h3> <button onclick="{ hit }">{ opts.el.name }</button>', function(opts) {

  this.hit = function(e) {
    console.info(e.target)
  }.bind(this);


});
