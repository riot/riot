init:
	bower install

jshint:
	jshint riot.js

min: jshint
	uglifyjs license.js riot.js --comments --mangle -o riot.min.js

test: jshint
	node test/node.js

.PHONY: test compare
