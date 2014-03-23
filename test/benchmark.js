var Benchmark = require('benchmark'),
  suite = new Benchmark.Suite,
  suite2 = new Benchmark.Suite,
  fs = require('fs'),
  riot = require('../riot.js'),
  underscore = require('underscore'),
  tmpl = require('./support/tmpl'),
  sample = require('./support/sample'),
  output;

suite
.on('start', function(){
  console.log("Templating without HTML escaping...");
})
.add("riot", function(){
  output = riot.render(sample.template, sample.data, false);
})
.add("tmpl", function(){
  output = tmpl(sample.resig)(sample.data);
})
.add("underscore", function(){
  output = underscore.template(sample.resig)(sample.data);
})
.on('cycle', function(event) {
  console.log(String(event.target));
  if(output !== sample.unescaped_output){
    console.log("!!! Output did not match expected");
  };
  output = "";
})
.run({ 'async': false });

suite2
.on('start', function(){
  console.log("\nTemplating with HTML escaping...");
})
.add("riot", function(){
  output = riot.render(sample.template, sample.data);
})
.on('cycle', function(event) {
  console.log(String(event.target));
  if(output !== sample.escaped_output){
    console.log("!!! Output did not match expected");
  };
  output = "";
})
.run({ 'async': false });
