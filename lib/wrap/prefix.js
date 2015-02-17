/* Riot WIP, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function() {

  var riot = {
    
    version: 'WIP',
    
    // a secret backdoor to private vars
      // allows to share methods with external components,
      // e.g. cli.js, compiler.js from jsdelivr, tests,
      // while still keeping our code minimal
    _: function(k) { return eval(k) }

  }

  'use strict'
