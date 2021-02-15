build:
	hugo --minify

ci-build-preview:
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--minify

ci-link-check:
	curl https://raw.githubusercontent.com/wjdp/htmltest/master/godownloader.sh | bash
	bin/htmltest

clean:
	rm -rf public

setup:
	npm install
	npm run-script build
	git submodule update --init --recursive --depth 1

serve: setup
	hugo server -p 30000 --buildDrafts --buildFuture && npm start

test: build ci-link-check

preview-build: get-milestones ci-build-preview ci-link-check

production-build: get-milestones build ci-link-check

get-milestones: setup
	node -r esm ./scripts/fetchMilestones.js
