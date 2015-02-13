
DIST = "dist/riot/"

WATCH = "\
	var arg = process.argv, path = arg[1], cmd = arg[2];  \
	require('chokidar') 																  \
		.watch(path, { ignoreInitial: true }) 						  \
		.on('all', function() { 													  \
			require('shelljs').exec(cmd) 										  \
		})"

<<<<<<< HEAD
eslint:
=======
test:
	# check code quality
	@ ./node_modules/jshint/bin/jshint lib test
>>>>>>> c260173... fix again the indentation issues
	# check code style
	# TODO: Get ./test up to standards and add back
	@ ./node_modules/eslint/bin/eslint.js -c ./.eslintrc lib

raw:
	@ mkdir -p $(DIST)
	@ cat lib/compiler.js > $(DIST)compiler.js
	@ cat lib/wrap/prefix.js > $(DIST)riot.js
	@ cat lib/observable.js lib/router.js lib/tmpl.js lib/tag/*.js >> $(DIST)riot.js
	@ cat $(DIST)riot.js $(DIST)compiler.js > $(DIST)riot+compiler.js
	@ cat lib/wrap/suffix.js | tee -a $(DIST)riot.js $(DIST)riot+compiler.js > /dev/null

riot: eslint raw

min: riot
	# minify riot
	@ for f in riot compiler riot+compiler; do ./node_modules/uglify-js/bin/uglifyjs $(DIST)$$f.js --comments --mangle -o $(DIST)$$f.min.js; done

perf: riot
	# run the performance tests
	@ node --expose-gc test/performance/mem

watch:
	# watch and rebuild riot and its tests
	@ $(shell \
		node -e $(WATCH) "lib/**/*.js" "make raw" & \
		export RIOT="../dist/riot/riot" && node ./lib/cli.js --watch test/tag dist/tags.js)

.PHONY: test min


# riot maintainer tasks
-include ../riot-tasks/Makefile
