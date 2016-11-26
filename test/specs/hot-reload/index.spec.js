import {
  makeTag,
  expectHTML,
  injectHTML,
  removeAllTags
} from '../../helpers/index'

// const expect = chai.expect

describe('hot reloading', () => {
  afterEach(removeAllTags)

  it('replaces tags html', () => {
    var t = makeTag('test', '<p>First</p>')
    expectHTML(t).to.be.equal('<p>First</p>')

    riot.tag2('test', '<p>Second</p>')
    expectHTML(t).to.be.equal('<p>Second</p>')
  })

  it('preseves state', () => {
    var t = makeTag('test', '{val}', '', {}, function() { this.val = 1})
    expectHTML(t).to.be.equal('1')
  })

  it('supports yield', () => {
    riot.tag2('test', '<p><yield/></p>')
    injectHTML('<test>Hello</test>')
    var t = riot.mount('test')[0]
    expectHTML(t).to.be.equal('<p>Hello</p>')

    riot.tag2('test', '<i><yield/></i>')
    expectHTML(t).to.be.equal('<i>Hello</i>')
  })
})
