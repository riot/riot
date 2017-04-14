const defaultBrackets = riot.settings.brackets
// make expect globally available
const expect = chai.expect // eslint-disable-line

before(function() {
  riot.unregister('riot-tmp')
  riot.unregister('riot-tmp-value')
  riot.unregister('riot-tmp-sub')
})

after(function() {
  riot.settings.brackets = defaultBrackets
})