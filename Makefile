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

test-compiler:
	@ $(ISTANBUL) cover $(MOCHA) --dir coverage/server -- ./test/compiler/suite -R spec

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/browsers/report-lcov/lcov.info | $(COVERALLS)

test-sauce:
	# run the saucelabs in separate chunks
	@ for group in 0 1 2 3; do GROUP=$$group SAUCE_USERNAME=riotjs SAUCE_ACCESS_KEY=124f5640-fd66-4848-acdb-98c1d601d04d SAUCELABS=1 make test-karma; done

compare:
	# compare the current release with the previous one
	du -h riot.js compiler.js
	du -h dist/riot/riot.js dist/riot/compiler.js

raw:
	# build riot
	@ mkdir -p $(DIST)
	@ $(SMASH) lib/browser/compiler/index.js > $(DIST)compiler.js
	@ $(SMASH) lib/riot.js > $(DIST)riot.js
	@ $(SMASH) lib/riot+compiler.js > $(DIST)riot+compiler.js

riot: raw test

min: riot
	# minify riot
	@ for f in riot compiler riot+compiler; do $(UGLIFY) $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ iojs --expose-gc test/performance/speed
	@ iojs --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="../../dist/riot/riot" && node ./lib/server/cli.js --watch test/tag dist/tags.js)

.PHONY: test min


# riot maintainer tasks
-include ../riot-tasks/Makefile
