
# default to package version if no "v" var given
v ?= $(shell node -pe "require('./package.json').version")

# expand variable immediatelly
# because we might not have access to package.json later
# e.g. when we switch to gh-pages branch later with `make docs`
VERSION := $(v)

DIST = dist/download


.PHONY: test dist

jshint:
	./node_modules/jshint/bin/jshint lib/*.js

dev:
	@ node make/dev.js

riot: jshint
	@ mkdir -p dist
	@ cat make/prefix.js | sed "s/VERSION/$(VERSION)/" > dist/riot.js
	@ cat lib/* >> dist/riot.js
	@ cat make/suffix.js >> dist/riot.js

min: riot
	@ ./node_modules/uglify-js/bin/uglifyjs dist/riot.js --comments --mangle -o dist/riot.min.js
	@ echo minified

dist: min
	@ mkdir -p $(DIST)
	@ rm -rf $(DIST)/*
	@ cp dist/riot.js "$(DIST)/riot-$(VERSION).js"
	@ cp dist/riot.min.js "$(DIST)/riot-$(VERSION).min.js"
	@ zip -r "$(DIST)/riot-$(VERSION).zip" demo
	@ cp -r demo $(DIST)
	ls $(DIST)


## Making new releases
#
#  1. Make sure you have the latest changes and nothing uncommited.
#
#    git checkout master
#    git pull origin master
#    git status
#
#  2. Create & publish a release.
#
#    make release v=2.0.0
#    make publish

# set version and generate files
# - update version number in package.json, component.json, bower.json
# - generate riot distribution files
# - copy riot.js and riot.min.js to root (from gitignored /dist)

bump:
	@ sed -i '' 's/\("version": "\)[^"]*/\1'$(VERSION)'/' *.json
	@ make dist
	@ cp dist/riot*.js .

# commit docs from master to gh-pages branch
# (whitelist extensions to keep folder clean w/o .gitignore)

docs:
	git checkout gh-pages
	git checkout master demo
	git commit -m "$(VERSION)" *.tag *.js *.css *.html
	git checkout master

# create version commit and tag
# (also creating a release on github)

version:
	git commit -am "$(VERSION)"
	git tag -a 'v'$(VERSION) -m $(VERSION)

release: bump docs version

# push new version to npm ant github
# (no need to "push" to bower and component, they'll grab it from github)

publish:
	npm publish
	git push origin gh-pages
	git push origin master
	git push origin master --tags
