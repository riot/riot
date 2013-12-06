init:
	bower install

jshint:
	jshint jquery.riot.js riot.js

min: jshint
	uglifyjs license.js jquery.riot.js --comments --mangle -o jquery.riot.min.js
	uglifyjs license.js riot.js --comments --mangle -o riot.min.js

test: jshint
	node test/node.js

.PHONY: test compare
