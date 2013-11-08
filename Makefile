min:
	bower install
	uglifyjs jquery.riot.js --comments --mangle -o jquery.riot.min.js

.PHONY: test compare
