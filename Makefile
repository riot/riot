init:
	bower install

jshint:
	jshint jquery.riot.js riot.js

min: jshint
	uglifyjs jquery.riot.js --comments --mangle -o jquery.riot.min.js
	uglifyjs riot.js --comments --mangle -o riot.min.js

.PHONY: test compare
