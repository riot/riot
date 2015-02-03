

WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"


jshint:
	./node_modules/jshint/bin/jshint lib/*.js


riot:
	@ cat lib/compiler.js > compiler.js
	@ cat make/prefix.js | sed "s/VERSION/$(VERSION)/" > riot.js
	@ cat lib/observable.js lib/router.js lib/tmpl.js lib/tag/*.js >> riot.js
	@ cat riot.js compiler.js > riot+compiler.js
	@ cat make/suffix.js | tee -a riot.js riot+compiler.js > /dev/null

min: jshint riot
	@ for f in riot compiler riot+compiler; do ./node_modules/uglify-js/bin/uglifyjs $$f.js --comments --mangle -o $$f.min.js; done

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make riot" & \
		node ./lib/cli.js --watch test/tag dist/tags.js )

.PHONY: test min


# riot maintainer tasks
-include ../riot-make/Makefile
