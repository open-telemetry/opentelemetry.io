serve: get-milestones
	hugo server \
		--buildDrafts \
		--buildFuture

preview-build: get-milestones
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--minify

production-build: get-milestones
	hugo \
		--minify

get-milestones:
	npm install
	node -r esm ./scripts/fetchMilestones.js
