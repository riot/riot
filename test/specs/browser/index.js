// make expect globally available
defaultBrackets = riot.settings.brackets
expect = chai.expect // eslint-disable-line

before(function() {
  riot.unregister('riot-tmp')
  riot.unregister('riot-tmp-value')
  riot.unregister('riot-tmp-sub')
})

after(function() {
  riot.settings.brackets = defaultBrackets
})