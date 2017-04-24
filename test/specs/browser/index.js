// make expect globally available
window.defaultBrackets = riot.settings.brackets
window.expect = chai.expect // eslint-disable-line

before(function() {
  riot.unregister('riot-tmp')
  riot.unregister('riot-tmp-value')
  riot.unregister('riot-tmp-sub')
})

after(function() {
  riot.settings.brackets = window.defaultBrackets
})