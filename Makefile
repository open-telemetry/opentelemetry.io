HTMLTEST_DIR=tmp
HTMLTEST?=htmltest # Specify as make arg if different
# Use $(HTMLTEST) in PATH, if available; otherwise, we'll get a copy
ifeq (, $(shell which $(HTMLTEST)))
PRE_CHECK_LINKS=get-link-checker
override HTMLTEST=$(HTMLTEST_DIR)/bin/htmltest
endif

build:
	hugo --minify

ci-build-preview:
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--minify

ci-link-check: $(PRE_CHECK_LINKS)
	$(HTMLTEST)

clean:
	rm -rf $(HTMLTEST_DIR) public/* resources

setup: clean
	npm install
	npm run-script build

serve: setup
	hugo server -p 30000 --buildDrafts --buildFuture && npm start

test: build ci-link-check

preview-build: get-milestones ci-build-preview ci-link-check

production-build: get-milestones build ci-link-check

get-link-checker:
	curl https://htmltest.wjdp.uk | bash -s -- -b $(HTMLTEST_DIR)/bin

get-milestones: setup
	node -r esm ./scripts/fetchMilestones.js
