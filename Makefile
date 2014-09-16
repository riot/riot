init:
	bower install

jshint:
	./node_modules/jshint/bin/jshint lib/*.js

riot:
	@ cat license.js > riot.js
	@ echo '(function(riot) { "use strict";' >> riot.js
	@ cat lib/* >> riot.js
	@ cat loaders.js >> riot.js
	@ echo '})({});' >> riot.js

min: riot
	./node_modules/uglify-js/bin/uglifyjs riot.js --comments --mangle -o riot.min.js --source-map=riot.min.js.map

test: riot
	node test/node.js

benchmark: riot
	node test/benchmark.js

.PHONY: test
