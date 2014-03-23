var Benchmark = require('benchmark'),
  suite = new Benchmark.Suite,
  suite2 = new Benchmark.Suite,
  fs = require('fs'),
  riot = require('../riot.js'),
  underscore = require('underscore'),
  mustache = require('mustache'),
  ejs = require('ejs'),
  tmpl = require('./support/tmpl'),
  sample = require('./support/sample'),
  underscore_compiled = underscore.template(sample.ejs),
  ejs_compiled = ejs.compile(sample.ejs),
  ejs_safe_compiled = ejs.compile(sample.ejs_safe),
  output;

suite
.on('start', function(){
  console.log("Templating without HTML escaping...");
})
.add("riot", function(){
  output = riot.render(sample.template, sample.data, false);
})
.add("mustache", function(){
  output = mustache.render(sample.mustache_safe, sample.data);
})
.add("tmpl", function(){
  output = tmpl(sample.ejs)(sample.data);
})
.add("underscore", function(){
  output = underscore_compiled(sample.data);
})
.add("ejs", function(){
  output = ejs_safe_compiled(sample.data);
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
.add("mustache", function(){
  // mustache escapes the forward slash?
  output = mustache.render(sample.mustache, sample.data);
})
.add("ejs", function(){
  output = ejs_compiled(sample.data);
})
.on('cycle', function(event) {
  console.log(String(event.target));
  if(output !== sample.escaped_output){
    console.log("!!! Output did not match expected");
  };
  output = "";
})
.run({ 'async': false });
