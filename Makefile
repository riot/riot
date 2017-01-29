
# if no "v" var given, default to package version
v ?= $(shell node -pe "require('./package.json').version")

# expand variable (so we can use it on branches w/o package.json)
VERSION := $(v)

# get x.x.* part of the version number
MINOR_VERSION = `echo $(VERSION) | sed 's/\.[^.]*$$//'`

# Command line paths
KARMA = ./node_modules/karma/bin/karma
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
SMASH = ./node_modules/.bin/smash
ROLLUP = ./node_modules/.bin/rollup
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
COVERALLS = ./node_modules/coveralls/bin/coveralls.js
RIOT_CLI = ./node_modules/.bin/riot
CHOKIDAR = ./node_modules/.bin/chokidar

# folders
DIST = dist/riot/
LIB = lib/
CONFIG = config/

GENERATED_FILES = riot.js riot.csp.js riot+compiler.js


test: eslint test-mocha test-karma

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc.json lib test

test-mocha:
	RIOT=../../dist/riot/riot.js $(MOCHA) -- test/specs/server

tags:
	@ $(RIOT_CLI) --silent test/tag dist/tags.js

test-karma:
  # Test riot+compiler.js
	@ TEST_FOLDER=compiler $(KARMA) start test/karma.conf.js
	# Test only riot.js and generate the coverage
	@ TEST_FOLDER=browser $(KARMA) start test/karma.conf.js

test-coveralls:
	@ RIOT_COV=1 cat ./coverage/report-lcov/lcov.info | $(COVERALLS)

test-sauce:
	# run the riot tests on saucelabs
	@ SAUCELABS=1 make test-karma

test-chrome:
	@ DEBUG=1 TEST_FOLDER=browser ${KARMA} start test/karma.conf.js --browsers=Chrome --no-single-run --watch

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

clean:
	# clean $(DIST)
	@ rm -rf $(DIST)

riot: clean raw test

min:
	# minify riot
	@ for f in $(GENERATED_FILES); do \
		$(UGLIFY) $(DIST)$$f \
			--comments \
			--mangle \
			--screw-ie8 \
			--compress  \
			-o $(DIST)$${f%.*}.min.js; \
		done

perf: riot
	# run the performance tests
	@ node test/performance/benchmarks ../riot.2.6.1 --expose-gc
	@ node test/performance/benchmarks ../riot.3.0.7 --expose-gc
	@ node test/performance/benchmarks ../../../dist/riot/riot --expose-gc

perf-leaks: riot
	# detect memory leaks
	@ node --expose-gc test/performance/memory

watch:
	# watch and rebuild riot and its testswatch:
	@ $(CHOKIDAR) lib -c 'make raw & make tags'

build:
	# generate riot.js & riot.min.js
	@ make min
	@ cp dist/riot/* .
	# write version in riot.js
	@ sed -i '' 's/WIP/v$(VERSION)/' riot*.js


bump:
	# grab all latest changes to master
	# (if there's any uncommited changes, it will stop here)
	# bump version in *.json files
	@ sed -i '' 's/\("version": "\)[^"]*/\1'$(VERSION)'/' *.json
	@ make build
	@ git status --short

bump-undo:
	# remove all uncommited changes
	@ git reset --hard


version:
	# @ git checkout master
	# create version commit
	@ git status --short
	@ git add --all
	@ git commit -am "$(VERSION)"
	@ git log --oneline -2
	# create version tag
	@ git tag -a 'v'$(VERSION) -m $(VERSION)
	@ git describe

version-undo:
	# remove the version tag
	@ git tag -d 'v'$(VERSION)
	@ git describe
	# remove the version commit
	@ git reset `git rev-parse :/$(VERSION)`
	@ git reset HEAD^
	@ git log --oneline -2


release: bump version

release-undo:
	make version-undo
	make bump-undo


publish:
	# push new version to npm and github
	# (github tag will also trigger an update in bower, component, cdnjs, etc)
	@ npm publish
	@ git push origin master
	@ git push origin master --tags

.PHONY: test min eslint test-mocha test-compiler test-coveralls test-sauce compare raw riot perf watch tags perf-leaks build bump bump-undo version version-undo release-undo publish
