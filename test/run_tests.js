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

      test('observable events', function (reporter) {

         var counters = {i: 0, j: 0};

         Observable.on('inc1', function (c) {
            c.i += 1;
         });

         Observable.on('inc1', function (c) {
            if (c.i === 3) {
               Observable.off('inc1');
            }
         });

         Observable.one('inc2', function (c) {
            c.j += 1;
         });

         for (var i = 0; i < 4; i++) {
            Observable.emit('inc1', counters);
            Observable.emit('inc2', counters);
         }

         reporter(counters.i === 3 && counters.j === 1);
      });
   });

//   test('route()', function (reporter) {
//      reporter(false);
//   });
});