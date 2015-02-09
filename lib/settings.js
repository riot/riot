/*

Set:
  riot.settings({ brackets: '[]' })

Unset (revert to default):
  riot.settings({ brackets: null })

Get:
  riot.settings('brackets')

Get and listen for changes:
  riot.settings('brackets', function(value){})

Get all:
  riot.settings()

*/

;(function(settings, defaults) {

  riot.observable(riot.settings = function self(arg, cb) {
    
    if(typeof arg == 'object')
      for(var k in arg)
        self.trigger(k, settings[k] = arg[k] != null ? arg[k] : defaults[k])
    
    else if(cb)
      self.on(arg, cb) && cb(settings[arg]) 
    
    else
      return arg ? settings[arg] : settings

  })(defaults)

})({}, {

  // Riot's default settings:

  brackets: '{ }'

})
