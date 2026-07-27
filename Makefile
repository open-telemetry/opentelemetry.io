# For local development, create `public` either as a symlink to a given git repo
# (if it exists), or an empty git repo. This is for the purpose of tracking
# build changes.

OTEL_GEN_REPO?=../$(shell basename $(shell pwd)).g

default:
	@echo "Make what? Target list:\n"
	@make -rpn | grep '^[a-z]\S*:' | sed 's/://' | sort

clean:
	rm -rf tmp public/* resources

public:
	@if [ -e "$(OTEL_GEN_REPO)" ]; then \
		set -x; ln -s $(OTEL_GEN_REPO) public; \
	elif [ -z "$(CI)" ]; then \
		set -x; git init public; \
	fi

ls-public:
	if [ -e public ]; then ls -ld public; fi
