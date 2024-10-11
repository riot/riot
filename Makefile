
# if no "v" var given, default to package version
v ?= $(shell node -pe "require('./package.json').version")

# expand variable (so we can use it on branches w/o package.json)
VERSION := $(v)

# get x.x.* part of the version number
MINOR_VERSION = `echo $(VERSION) | sed 's/\.[^.]*$$//'`

# Command line paths
C8 = ./node_modules/c8/bin/c8.js
WDIO = ./node_modules/.bin/wdio
SERVE = ./node_modules/.bin/serve
START_SERVER_AND_TEST = ./node_modules/.bin/start-server-and-test
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
ROLLUP = ./node_modules/.bin/rollup
PRETTIER = ./node_modules/.bin/prettier
MINIFY = ./node_modules/.bin/terser
RIOT_CLI = ./node_modules/.bin/riot
TSC = ./node_modules/.bin/tsc

# folders
DIST = dist/riot/
SRC = src
CONFIG = config/

GENERATED_FILES = riot.js riot+compiler.js

# Options needed to generate the rollup esm bundle
ROLLUP_ESM_OPTIONS = --format esm \
					 --output.preserveModules \
					 --amd.forceJsExtensionForImports \
					 --preserveModulesRoot src \
					 --config rollup.config.js \
					 --dir $(DIST)esm
# Options we will pass to the minifier
MINIFY_OPTIONS = --comments false \
				 --toplevel \
				 --compress pure_funcs=['panic'],unsafe=true,unsafe_symbols=true,passes=5 \
				 --mangle \


test: lint unit-test test-typing

unit-test:
	@ $(START_SERVER_AND_TEST) $(SERVE) 3000  "$(C8) -r lcov -r text $(MOCHA) -r test/setup.js test/**/*.spec.js"

debug:
	# build the e2e bundle
	@ $(ROLLUP) -c test/e2e/rollup.config.js
	@ $(SERVE)

e2e-test:
	# build the e2e bundle
	@ $(ROLLUP) -c test/e2e/rollup.config.js
	@ $(START_SERVER_AND_TEST) $(SERVE) 3000  "$(WDIO) run ./wdio.conf.js"

lint:
	# check if the code looks pretty
	@ $(PRETTIER) --check ./
	# check code style
	@ $(ESLINT) src test

test-typing:
	# silent compile typescript
	@ $(TSC) -p ./test

raw:
	# build riot
	@ mkdir -p $(DIST)
	# Default builds UMD
	@ $(ROLLUP) src/riot.js --format umd --config rollup.config.js --file $(DIST)riot.js
	@ HAS_VISUALIZER=1 $(ROLLUP) src/riot+compiler.js --format umd --config rollup.config.js --file $(DIST)riot+compiler.js
	@ $(ROLLUP) src/riot.js $(ROLLUP_ESM_OPTIONS)
	@ $(ROLLUP) src/riot+compiler.js $(ROLLUP_ESM_OPTIONS)
	# alias the common js files renaming the umd js -> cjs
	@ mkdir -p $(DIST)/cjs
	@ cp $(DIST)/riot.js $(DIST)/cjs/riot.cjs
	@ cp $(DIST)/riot+compiler.js  $(DIST)/cjs/riot+compiler.cjs

clean:
	# delete old esm folder
	@ rm -rf esm
	# clean $(DIST)
	@ rm -rf $(DIST)

riot: clean raw test

min:
	# minify riot
	@ $(MINIFY) $(DIST)riot.js $(MINIFY_OPTIONS) -o $(DIST)riot.min.js;
	# minify the riot+compiler
	@ $(MINIFY) $(DIST)riot+compiler.js $(MINIFY_OPTIONS) -o $(DIST)riot+compiler.min.js;

build:
	# generate riot.js & riot.min.js
	@ make min
	@ cp -r dist/riot/* .
	# write version in riot.js
	@ sed -i '' 's/WIP/v$(VERSION)/g' riot*.js esm/*.js esm/**/*.js


bump:
	# grab all latest changes to main
	# (if there's any uncommited changes, it will stop here)
	# bump version in *.json files
	@ sed -i '' 's/\("version": "\)[^"]*/\1'$(VERSION)'/' package.json
	# update the lock file as well
	@ npm i
	@ make build
	@ git status --short

bump-undo:
	# remove all uncommited changes
	@ git reset --hard


version:
	# @ git checkout main
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

release: riot min bump version

release-undo:
	make version-undo
	make bump-undo

publish:
	# push new version to npm and github
	# (github tag will also trigger an update in bower, component, cdnjs, etc)
	@ npm publish
	@ git push origin main
	@ git push origin main --tags

.PHONY: test unit-test e2e-test debug min lint raw riot build bump bump-undo version version-undo release-undo publish
