setup:
	npm install

serve: setup
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

get-milestones: setup
	node -r esm ./scripts/fetchMilestones.js
