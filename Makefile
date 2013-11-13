init:
	bower install

jshint:
	jshint jquery.riot.js riot.js

min: jshint
	uglifyjs license.js jquery.riot.js ext/* --comments --mangle -o jquery.riot.min.js
	uglifyjs license.js riot.js ext/* --comments --mangle -o riot.min.js

.PHONY: test compare
