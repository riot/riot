// small polyfill
// normalize the document.contains method
document.contains = Element.prototype.contains = function contains(node) {
  if (!(0 in arguments)) {
    throw new TypeError('1 argument is required')
  }
  do {
    if (this === node) {
      return true
    }
  } while (node = node && node.parentNode)
  return false
}

function CE( event, params ) {
  params = params || { bubbles: false, cancelable: false, detail: undefined }
  var evt = document.createEvent( 'CustomEvent' )
  evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail )
  return evt
}

if (typeof window.CustomEvent !== 'function') {
  CE.prototype = window.Event.prototype
  window.CustomEvent = CE
}

