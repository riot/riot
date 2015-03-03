
riot.tag('event-error', '<form onsubmit="{ submit }"> <input name="title"> <button>Submit</button> </form>', function(opts) {

  this.submit = function() {
    throw new Error('test');
  }.bind(this);


});