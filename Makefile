
DIST = "dist/riot/"

WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"


jshint:
	# check code quality
	@ ./node_modules/jshint/bin/jshint lib test

jscs:
	# check code style
	@ ./node_modules/jscs/bin/jscs lib test

raw:
	@ mkdir -p $(DIST)
	@ cat lib/compiler.js > $(DIST)compiler.js
	@ cat lib/wrap/prefix.js > $(DIST)riot.js
	@ cat lib/observable.js lib/router.js lib/tmpl.js lib/tag/*.js >> $(DIST)riot.js
	@ cat $(DIST)riot.js $(DIST)compiler.js > $(DIST)riot+compiler.js
	@ cat lib/wrap/suffix.js | tee -a $(DIST)riot.js $(DIST)riot+compiler.js > /dev/null

riot: jshint jscs raw

min: riot
	# minify riot
	@ for f in riot compiler riot+compiler; do ./node_modules/uglify-js/bin/uglifyjs $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ node --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		node ./lib/cli.js --watch test/tag dist/tags.js )

.PHONY: test min


# riot maintainer tasks
-include ../riot-tasks/Makefile
