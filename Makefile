HTMLTEST_DIR=tmp
HTMLTEST?=htmltest # Specify as make arg if different
HTMLTEST_ARGS?=--skip-external
OTEL_GEN_REPO?=../$(shell basename $(shell pwd)).g

# Use $(HTMLTEST) in PATH, if available; otherwise, we'll get a copy
ifeq (, $(shell which $(HTMLTEST)))
override HTMLTEST=$(HTMLTEST_DIR)/bin/htmltest
ifeq (, $(shell which $(HTMLTEST)))
GET_LINK_CHECKER_IF_NEEDED=get-link-checker
endif
endif

check-links: $(GET_LINK_CHECKER_IF_NEEDED)
	$(HTMLTEST) $(HTMLTEST_ARGS)

clean:
	rm -rf $(HTMLTEST_DIR) public/* resources

get-link-checker:
	rm -Rf $(HTMLTEST_DIR)/bin
	curl https://htmltest.wjdp.uk | bash -s -- -b $(HTMLTEST_DIR)/bin

# For local development, create `public` either as a symlink to a given git repo
# (if it exists), or an empty git repo. This is for the purpose of tracking
# build changes.
public:
	@if [ -e "$(OTEL_GEN_REPO)" ]; then \
		set -x; ln -s $(OTEL_GEN_REPO) public; \
	elif [ -z "$(CI)" ]; then \
		set -x; git init public; \
	fi

ls-public:
	if [ -e public ]; then ls -ld public; fi
