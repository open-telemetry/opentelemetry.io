HTMLTEST_DIR=tmp
HTMLTEST?=htmltest # Specify as make arg if different
# Use $(HTMLTEST) in PATH, if available; otherwise, we'll get a copy
ifeq (, $(shell which $(HTMLTEST)))
PRE_CHECK_LINKS=get-link-checker
override HTMLTEST=$(HTMLTEST_DIR)/bin/htmltest
endif

check-internal-links: $(PRE_CHECK_LINKS)
	$(HTMLTEST)

clean:
	rm -rf $(HTMLTEST_DIR) public/* resources

get-link-checker:
	curl https://htmltest.wjdp.uk | bash -s -- -b $(HTMLTEST_DIR)/bin

get-milestones:
	node -r esm ./scripts/fetchMilestones.js
