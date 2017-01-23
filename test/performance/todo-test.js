
var i = 0,
  input = document.querySelector('form input'),
  submitEvent = new Event('submit', {'bubbles': true, 'cancelable': true}),
  start = Date.now()

for (; i < 50; i++) {
  var inputEvent = document.createEvent('Event')
  inputEvent.initEvent('keyup', true, true)
  input.value = 'Something to do ' + i
  input.dispatchEvent(inputEvent)
  input.form.dispatchEvent(submitEvent)
}

console.info('create', Date.now() - start)


start = Date.now()

var checkboxes = document.querySelectorAll('[type=checkbox]')
for (i = 0; i < checkboxes.length; i++) checkboxes[i].click()

console.info('toggle', Date.now() - start)
