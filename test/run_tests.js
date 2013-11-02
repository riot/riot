$(function () {
   var tpl = $('[type="tpl/result"]').html(),
      $res = $('#riot-results');

   function test(name, func) {
      func(function (result) {
         $.el(tpl, {
            func: name,
            result: result ? 'pass' : 'fail'
         }).appendTo($res);
      });
   }

   test('render()', function (reporter) {
      var tpl = '  {prop}\\\n{unknown_helper:prop}\\t{raw:prop}\'{undef},{{null}}{bool}}{num}',
         data = {
            prop: '<hr>&amp;\'"',
            "null": null,
            bool: true,
            num: 42
         },
         expected = '&60;hr&62;&38;amp;&39;&34;\\\n{unknown_helper:prop}\\t<hr>&amp;\'"\',{}true}42';

      reporter($.render(tpl, data) === expected);
   });

   test('el()', function (reporter) {
      var $el = $.el('<b>{b}</b>', {b: "boom"});

      reporter(
         $el.constructor === $ &&
            $el.html() === 'boom' &&
            $el.is('b')
      );
   });

   test('observable(obj) returns obj', function (reporter) {
      var Observable = {};

      reporter(Observable === $.observable(Observable));
   });

   test('observable() on and emit', function (reporter) {
      var Observable = {},
          i = 0;
      $.observable(Observable);

      Observable.on('foo', function () {
         i++;
         if (i == 2) {
            reporter(true);
         }
      });

      Observable.emit('foo');
      Observable.emit('foo');
   });

   test('observable() on', function (reporter) {
      var Observable = {},
          i = 0;
      $.observable(Observable);

      Observable.one('foo', function () {
         i++;
      });

      Observable.emit('foo');
      Observable.emit('foo');

      reporter(i == 1);
   });

   test('observable() off', function (reporter) {
      var Observable = {},
          i = 0,
          listener = function () { i++; };
      $.observable(Observable);

      Observable.on('foo', listener);
      Observable.off('foo', listener);

      Observable.emit('foo');

      reporter(i == 0);
   });


//   test('route()', function (reporter) {
//      reporter(false);
//   });
});