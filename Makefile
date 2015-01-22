
VERSION=`node -pe "require('./package.json').version"`
DIST=../www/pages/riotjs/dist

jshint:
	./node_modules/jshint/bin/jshint lib/*.js

riot:
	@ mkdir -p dist
	@ cat license.js | sed "s/VERSION/$(VERSION)/" > dist/riot.js
	@ echo "var riot = { version: 'v$(VERSION)' } ; 'use strict';" >> dist/riot.js
	@ cat lib/* >> dist/riot.js

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
