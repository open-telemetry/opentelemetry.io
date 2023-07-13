# Set REFCACHE to another value to disable htmltest refcache-file manipulation
BUILD_LOG?=tmp/build-log.txt
REFCACHE?=refcache
HTMLTEST_DIR=tmp
HTMLTEST?=htmltest # Specify as make arg if different
HTMLTEST_ARGS?=--skip-external
LINK_CACHE_FILE?=refcache.json
LINK_CACHE_FILE_DEST_DIR?=static
LINK_CACHE_FILE_SRC_DIR?=$(HTMLTEST_DIR)/.htmltest
OTEL_GEN_REPO?=../$(shell basename $(shell pwd)).g
WARNINGS_SKIP_LIST?=.warnings-skip-list.txt

# Use $(HTMLTEST) in PATH, if available; otherwise, we'll get a copy
ifeq (, $(shell which $(HTMLTEST)))
override HTMLTEST=$(HTMLTEST_DIR)/bin/htmltest
ifeq (, $(shell which $(HTMLTEST)))
GET_LINK_CHECKER_IF_NEEDED=get-link-checker
endif
endif

default:
	@echo "Make what? Target list:\n"
	@make -rpn | grep '^[a-z]\S*:' | sed 's/://' | sort

$(LINK_CACHE_FILE_SRC_DIR):
	mkdir -p $(LINK_CACHE_FILE_SRC_DIR)

refcache-restore: $(LINK_CACHE_FILE_SRC_DIR)
ifeq (refcache, $(REFCACHE))
	cp $(LINK_CACHE_FILE_DEST_DIR)/$(LINK_CACHE_FILE) $(LINK_CACHE_FILE_SRC_DIR)/
else
	@echo "SKIPPING refcache-restore"
endif

refcache-save: $(LINK_CACHE_FILE_SRC_DIR)/$(LINK_CACHE_FILE)
ifeq (refcache, $(REFCACHE))
	cp $(LINK_CACHE_FILE_SRC_DIR)/$(LINK_CACHE_FILE) $(LINK_CACHE_FILE_DEST_DIR)/
	npm run _prettier:any -- --write $(LINK_CACHE_FILE_DEST_DIR)/$(LINK_CACHE_FILE)
else
	@echo "SKIPPING refcache-save"
endif

# Add warning skip patterns, one per line to WARNINGS_SKIP_LIST to
# temporarily skip known warnings or errors.
check-build-log:
	@if [ -e $(BUILD_LOG) ]; then \
		WARNINGS=`grep -E -ie 'warn(ing)?|error' $(BUILD_LOG) | grep -v -f $(WARNINGS_SKIP_LIST)`; \
		if [ -n "$$WARNINGS" ]; then \
			echo "WARNINGs or ERRORs found in build log:\n"; \
			echo "$$WARNINGS\n"; \
			exit 1; \
		fi \
	else \
		echo "INFO: $(BUILD_LOG) file not found."; \
	fi

check-links: $(GET_LINK_CHECKER_IF_NEEDED) \
	refcache-restore check-links-only refcache-save

check-links-only:
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
