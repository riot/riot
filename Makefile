
# if no "v" var given, default to package version
v ?= $(shell node -pe "require('./package.json').version")

# expand variable (so we can use it on branches w/o package.json)
VERSION := $(v)

# get x.x.* part of the version number
MINOR_VERSION = `echo $(VERSION) | sed 's/\.[^.]*$$//'`

# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/istanbul/lib/cli.js
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
			try { require('shelljs').exec(cmd) }              \
			catch(e) { console.log(e) }                       \
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

compare:
	# compare the current release with the previous one
	du -h riot.min.js riot+compiler.min.js
	du -h dist/riot/riot.min.js dist/riot/riot+compiler.min.js

raw:
	# build riot
	@ make clean
	@ mkdir -p $(DIST)
	@ $(SMASH) lib/riot.js > $(DIST)riot.js
	@ $(SMASH) lib/riot+compiler.js > $(DIST)riot+compiler.js
	@ $(SMASH) lib/riot.csp.js > $(DIST)riot.csp.js

clean:
	# clean $(DIST)
	@ rm -rf $(DIST)

riot: raw test

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
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="./../../../../dist/riot/riot" && ./node_modules/.bin/riot --watch test/tag dist/tags.js)

.PHONY: test min eslint test-mocha test-compiler test-coveralls test-sauce compare raw riot perf watch


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
