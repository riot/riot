# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/istanbul/lib/cli.js
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
SMASH = ./node_modules/.bin/smash
ROLLUP = ./node_modules/.bin/rollup
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
RIOT_CLI = ./node_modules/.bin/riot

# folders
DIST = "dist/riot/"
CONFIG = "config/"

# utils
WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar')                                   \
		.watch(path, { ignoreInitial: true })               \
		.on('all', function() {                             \
			try { require('shelljs').exec(cmd) }              \
			catch(e) { console.log(e) }                       \
		})"


test: eslint test-mocha test-karma

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc lib test

test-mocha:
	RIOT=../../dist/riot/riot.js $(ISTANBUL) cover $(MOCHA) -- test/specs/server -R spec

tags:
	@ $(RIOT_CLI) --silent test/tag dist/tags.js

test-karma:
	@ $(KARMA) start test/karma.riot+compiler.conf.js
	@ RIOT_COV=1 $(KARMA) start test/karma.riot.conf.js

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/browsers/report-lcov/lcov.info | $(COVERALLS)

test-sauce:
	# run the riot tests on saucelabs
	@ SAUCELABS=1 make test-karma

test-chrome:
	@ DEBUG=1 ${KARMA} start test/karma.riot.conf.js --browsers=Chrome --no-single-run --watch

compare:
	# compare the current release with the previous one
	du -h riot.min.js riot+compiler.min.js
	du -h dist/riot/riot.min.js dist/riot/riot+compiler.min.js

raw:
	# build riot
	@ mkdir -p $(DIST)
	# Default builds UMD
	@ $(ROLLUP) lib/riot.js --config $(CONFIG)rollup.config.js > $(DIST)riot.js
	@ $(ROLLUP) lib/riot+compiler.js --config $(CONFIG)rollup.config.js > $(DIST)riot+compiler.js
	# Chrome Security Policy build
	@ $(ROLLUP) lib/riot.js --config $(CONFIG)rollup.config.csp.js > $(DIST)riot.csp.js
	# es6 builds
	@ $(ROLLUP) lib/riot.js --config $(CONFIG)rollup.config.csp.js > $(DIST)riot.es6.js --format es6
	@ $(ROLLUP) lib/riot+compiler.js --config $(CONFIG)rollup.config.js > $(DIST)riot+compiler.es6.js --format es6

clean:
	# clean $(DIST)
	@ rm -rf $(DIST)

riot: clean raw test

min: riot
	# minify riot
	@ for f in riot riot.csp riot+compiler; do \
		$(UGLIFY) $(DIST)$$f.js \
			--comments \
			--mangle \
			--screw-ie8 \
			--compress  \
			-o $(DIST)$$f.min.js; \
		done

perf: riot
	# run the performance tests
	@ node test/performance/benchmarks
	@ node --expose-gc test/performance/memory

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & "make tags")

.PHONY: test min eslint test-mocha test-compiler test-coveralls test-sauce compare raw riot perf watch tags


# riot maintainer tasks
-include ../riot-tasks/Makefile
