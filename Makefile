min:
	bower install
	uglifyjs lib/jquery.riot.js --comments --mangle -o jquery.riot.min.js

.PHONY: test compare
