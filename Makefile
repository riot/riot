
# if no "v" var given, default to package version
v ?= $(shell node -pe "require('./package.json').version")

# expand variable (so we can use it on branches w/o package.json, e.g. gh-pages)
VERSION := $(v)

.PHONY: test min

jshint:
	./node_modules/jshint/bin/jshint lib/*.js

riot:
	@ mkdir -p dist
	@ cat make/prefix.js | sed "s/VERSION/$(VERSION)/" > dist/riot.js
	@ cat lib/* >> dist/riot.js
	@ cat make/suffix.js >> dist/riot.js

min: jshint riot
	@ ./node_modules/uglify-js/bin/uglifyjs dist/riot.js --comments --mangle -o dist/riot.min.js
	@ echo minified



#################################################
# Making new releases:
#
#   make release v=2.0.0
#   make publish
#
# ...which is a shorter version of:
#
#   make bump v=2.0.0
#   make version
#   make pages
#   make publish
#
# Bad luck? Revert with -undo, e.g.:
#
#   make bump-undo
#

MINOR_VERSION = `echo $(VERSION) | sed 's/\.[^.]*$$//'`


bump:
	# grab all latest changes to master
	# (if there's any uncommited changes, it will stop here)
	@ git checkout master
	@ git pull --rebase origin master
	# bump version in *.json files
	@ sed -i '' 's/\("version": "\)[^"]*/\1'$(VERSION)'/' *.json
	# bump to minor version in demo
	@ sed -i '' 's/[^/]*\(\/riot\.min\)/'$(MINOR_VERSION)'\1/' demo/index.html
	# generate riot.js & riot.min.js
	@ make min
	@ cp dist/riot*.js .
	@ git status --short

bump-undo:
	# remove all uncommited changes
	@ git checkout master
	@ git reset --hard


version:
	@ git checkout master
	# create version commit
	@ git status --short
	@ git commit -am "$(VERSION)"
	@ git log --oneline -2
	# create version tag
	@ git tag -a 'v'$(VERSION) -m $(VERSION)
	@ git describe

version-undo:
	@ git checkout master
	# remove the version tag
	@ git tag -d 'v'$(VERSION)
	@ git describe
	# remove the version commit
	@ git reset `git rev-parse :/$(VERSION)`
	@ git reset HEAD^
	@ git log --oneline -2


pages:
	# get the latest gh-pages branch
	@ git fetch origin
	@ git checkout gh-pages
	@ git reset --hard origin/gh-pages
	# commit the demo files from master to gh-pages
	@ git checkout master .gitignore demo
	@ git status --short
	-@ git commit -am "$(VERSION)"
	@ git log --oneline -2
	# return back to master branch
	@ git checkout master

pages-undo:
	# reset all local changes
	@ git checkout gh-pages
	@ git reset --hard origin/gh-pages
	@ git status --short
	@ git log --oneline -2
	@ git checkout master


release: bump version pages

release-undo:
	make pages-undo
	make version-undo
	make bump-undo


publish:
	# push new version to npm and github
	# (github tag will also trigger an update in bower, component, cdnjs, etc)
	@ npm publish
	@ git push origin gh-pages
	@ git push origin master
	@ git push origin master --tags

