serve:
	hugo server \
		--buildDrafts \
		--buildFuture

preview-build:
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--minify

production-build:
	hugo \
		--minify

get-milestones:
	npm install
	node -r esm ./scripts/fetchMilestones.js
