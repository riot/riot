init:
	bower install

min:
	uglifyjs jquery.riot.js --comments --mangle -o jquery.riot.min.js

.PHONY: test compare
