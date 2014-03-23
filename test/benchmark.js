var Benchmark = require('benchmark'),
  suite = new Benchmark.Suite,
  suite2 = new Benchmark.Suite,
  fs = require('fs'),
  underscore = require('underscore'),
  mustache = require('mustache'),
  ejs = require('ejs'),
  tmpl = require('./support/tmpl'),
  riot = require('../riot.js'),
  sample = require('./support/sample'),
  output, mustache_escaped_output;

output = mustache_escaped_output = "not run";

// If engine supports precompiling, do that first
var underscore_compiled = underscore.template(sample.ejs),
  ejs_compiled = ejs.compile(sample.ejs),
  ejs_safe_compiled = ejs.compile(sample.ejs_safe);

function check_output(expected, actual) {
  // Only check when results that actually ran
  if (actual == "not run") return true;
  if (actual != expected) {
    console.log("!! Output did not match expected output !!\n\n");
    console.log('\n>> ACTUAL\n'+actual);
    console.log('\n<< EXPECTED\n'+expected);
  }
}

suite
.on('start', function(){
  console.log("Templating without HTML escaping...\n");
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
  check_output(sample.unescaped_output, output);
  output = "not run";
})
.run({ 'async': false });

suite2
.on('start', function(){
  console.log("\nTemplating with HTML escaping...\n");
})
.add("riot", function(){
  output = riot.render(sample.template, sample.data);
})
.add("mustache", function(){
  mustache_escaped_output = mustache.render(sample.mustache, sample.data);
})
.add("ejs", function(){
  output = ejs_compiled(sample.data);
})
.on('cycle', function(event) {
  console.log(String(event.target));
  check_output(sample.escaped_output, output);
  // mustache escapes the forward slash as well
  check_output(sample.mustache_escaped_output, mustache_escaped_output);
  output = mustache_escaped_output = "not run";
})
.run({ 'async': false });
