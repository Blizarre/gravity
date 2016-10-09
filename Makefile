all: build

clean:
	rm build/* build/www/*

format:
	tsfmt -r **/*.ts
	sed -i "s/\r//" **/*.ts

build: build/phys.js build/Vector.js build/www/index.html build/www/scripts.js

build/phys.js: src/phys.ts
	tsc $? --outDir build

build/Vector.js: src/Vector.ts
	tsc $? --outDir build

build/www/index.html: src/index.html
	cp -f src/index.html build/www/index.html

build/www/scripts.js: build/Vector.js build/phys.js
	browserify $? -o $@