init:
	bower install

jshint:
	jshint lib/*.js

riot:
	@ # Build standalone
	@ cat license.js > riot.js
	@ echo '(function($$) { "use strict";' >> riot.js
	@ cat lib/{observable,render,route}.js >> riot.js
	@ echo '})(typeof top == "object" ? window.$$ || (window.$$ = {}) : exports);' >> riot.js
	@ # Build jquery
	@ cat license.js > jquery.riot.js
	@ echo '(function($$) { "use strict";' >> jquery.riot.js
	@ cat lib/{jquery.observable,render,route}.js >> jquery.riot.js
	@ echo '})(typeof top == "object" ? window.$$ || (window.$$ = {}) : exports);' >> jquery.riot.js
	@ echo 'Done.'

min: riot
	uglifyjs riot.js --comments --mangle -o riot.min.js
	uglifyjs jquery.riot.js --comments --mangle -o jquery.riot.min.js

test: min
	node test/node.js

.PHONY: test compare
