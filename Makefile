# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/karma-coverage/node_modules/.bin/istanbul
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
SMASH = ./node_modules/.bin/smash
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
COVERALLS = ./node_modules/coveralls/bin/coveralls.js

# folders
DIST = "dist/riot/"

# utils
WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"


test: eslint test-mocha test-karma

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc lib test

test-mocha:
	RIOT=../../dist/riot/riot.js $(ISTANBUL) cover $(MOCHA) -- test/runner.js -R spec

test-karma:
	@ $(KARMA) start test/karma.conf.js

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/browsers/report-lcov/lcov.info | $(COVERALLS)

test-sauce:
	# run the saucelabs in separate chunks
	# we need to run the test on 12 different browsers divided in 6 groups
	@ for group in 0 1 2 3 4 5 6; do GROUP=$$group SAUCELABS=1 make test-karma; done

compare:
	# compare the current release with the previous one
	du -h riot.min.js riot+compiler.min.js
	du -h dist/riot/riot.min.js dist/riot/riot+compiler.min.js

raw:
	# build riot
	@ mkdir -p $(DIST)
	@ $(SMASH) lib/riot.js > $(DIST)riot.js
	@ $(SMASH) lib/riot+compiler.js > $(DIST)riot+compiler.js

riot: raw test

min: riot
	# minify riot
	@ for f in riot riot+compiler; do $(UGLIFY) $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ iojs --expose-gc test/performance/speed
	@ iojs --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="./../../../../dist/riot/riot" && ./node_modules/.bin/riot --watch test/tag dist/tags.js)

.PHONY: test min eslint test-mocha test-compiler test-coveralls test-sauce compare raw riot perf watch


# riot maintainer tasks
-include ../riot-tasks/Makefile
