
DIST = "dist/riot/"

WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"

test-runner:
	RIOT=../dist/riot/riot.js ./node_modules/.bin/mocha test/runner.js -R spec

test: eslint test-runner
	@ ./node_modules/karma/bin/karma start test/karma.conf.js

eslint:
	# check code style
	@ ./node_modules/eslint/bin/eslint.js -c ./.eslintrc lib test

raw:
	# build riot
	@ ./node_modules/.bin/smash lib/compiler.js > $(DIST)compiler.js
	@ ./node_modules/.bin/smash lib/riot.js > $(DIST)riot.js
	@ ./node_modules/.bin/smash lib/riot+compiler.js > $(DIST)riot+compiler.js

riot: raw test

min: riot
	# minify riot
	@ for f in riot compiler riot+compiler; do ./node_modules/uglify-js/bin/uglifyjs $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ node --harmony --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="../dist/riot/riot" && node ./lib/cli.js --watch test/tag dist/tags.js)

.PHONY: test min


# riot maintainer tasks
-include ../riot-tasks/Makefile
