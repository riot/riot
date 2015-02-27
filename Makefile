
DIST = "dist/riot/"

WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"

test:
	@ make eslint
	# test the node compiler
	@ ./node_modules/mocha/bin/_mocha test/runner.js -R spec
	# test riot
	@ ./node_modules/karma/bin/karma start test/karma.conf.js


eslint:
	# check code style
	@ ./node_modules/eslint/bin/eslint.js -c ./.eslintrc lib test

raw:
	@ mkdir -p $(DIST)
	@ cat lib/compiler.js > $(DIST)compiler.js
	@ cat lib/wrap/prefix.js > $(DIST)riot.js
	@ cat lib/observable.js lib/router.js lib/tmpl.js lib/tag/*.js >> $(DIST)riot.js
	@ cat $(DIST)riot.js $(DIST)compiler.js > $(DIST)riot+compiler.js
	@ cat lib/wrap/suffix.js | tee -a $(DIST)riot.js $(DIST)riot+compiler.js > /dev/null

riot: raw test

min: riot
	# minify riot
	@ for f in riot compiler riot+compiler; do ./node_modules/uglify-js/bin/uglifyjs $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ iojs --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="../dist/riot/riot" && node ./lib/cli.js --watch test/tag dist/tags.js)

.PHONY: test min


# riot maintainer tasks
-include ../riot-tasks/Makefile
