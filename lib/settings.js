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

// had to make this work on IE8 so I can move on
riot.settings = function self(arg, cb) {
  cb('{}')
}
