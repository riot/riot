# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/istanbul/lib/cli.js
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
SMASH = ./node_modules/.bin/smash
ROLLUP = ./node_modules/.bin/rollup
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
	# run the riot tests on saucelabs
	@ SAUCELABS=1 make test-karma

test-chrome:
	@ DEBUG=1 ${KARMA} start test/karma.conf.js --browsers=Chrome --no-single-run --watch


compare:
	# compare the current release with the previous one
	du -h riot.min.js riot+compiler.min.js
	du -h dist/riot/riot.min.js dist/riot/riot+compiler.min.js

raw:
	# build riot
	@ mkdir -p $(DIST)
	@ $(ROLLUP) lib/riot.js --config rollup.config.js > $(DIST)riot.rollup.js

clean:
	# clean $(DIST)
	@ rm -rf $(DIST)

riot: clean raw test

min: riot
	# minify riot
	@ for f in riot riot.csp riot+compiler riot+compiler.csp; do \
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
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="./../../../../dist/riot/riot" && ./node_modules/.bin/riot --watch test/tag dist/tags.js)

.PHONY: test min eslint test-mocha test-compiler test-coveralls test-sauce compare raw riot perf watch


# riot maintainer tasks
-include ../riot-tasks/Makefile
