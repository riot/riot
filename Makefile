
VERSION?=`node -pe "require('./package.json').version"`
DIST=dist/download

jshint:
	./node_modules/jshint/bin/jshint lib/*.js

riot:
	@ mkdir -p dist
	@ cat prefix.js | sed "s/VERSION/$(VERSION)/" > dist/riot.js
	@ cat lib/* >> dist/riot.js
	@ cat suffix.js >> dist/riot.js

min: riot
	@./node_modules/uglify-js/bin/uglifyjs dist/riot.js --comments --mangle -o dist/riot.min.js
	@echo minified

demo:
	@mkdir -p demo/js
	@cp dist/riot.js demo/js
	@cp test/ie8/* demo/js

dist: min demo
	@mkdir -p $(DIST)
	@rm -rf $(DIST)/*
	@cp dist/riot.js "$(DIST)/riot-$(VERSION).js"
	@cp dist/riot.min.js "$(DIST)/riot-$(VERSION).min.js"
	@zip -r "$(DIST)/riot-$(VERSION).zip" demo
	@cp -r demo $(DIST)
	ls $(DIST)

watch: demo
	@./compiler/make.js --watch demo

.PHONY: test dist demo


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
#  	 make release VERSION=2.0.0
#    make publish
#

# set version and generate files
bump:
	# update version number in package.json, component.json, bower.json
	@ sed -i '' 's/\("version": "\)[^"]*/\1'$(VERSION)'/' *.json
	# generate riot distribution files
	@ make dist
	# copy riot.js and riot.min.js to root (from gitignored /dist)
	@ cp dist/riot*.js .

# create version commit and tag
# (also creating a release on github)
release: bump
	@ git commit -am "$(VERSION)"
	@ git tag -a 'v'$(VERSION) -m $(VERSION)

# push new version to npm ant github
# (no need to "push" to bower and component, they'll grab it from github)
publish:
	npm publish
	git push origin master
	git push origin master --tags

