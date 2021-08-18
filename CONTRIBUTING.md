# Contributing to OpenTelemetry.io

## Dev Setup

* Fork and clone the repository
* Install [Hugo](https://gohugo.io/getting-started/installing/#quick-install)
  * Please note that you need to install the "extended" version of Hugo (with built-in support) to run the site locally.
* Install [npm](https://npmjs.com)
* Run `npm install`
* Run `npm run serve`
  * If you are on OS X and see an error like `too many open files` or `pipe failed`, you may need to increase the file descriptor limit. See [this Hugo GitHub issue](https://github.com/gohugoio/hugo/issues/6109).
* Open `http://localhost:30000` to check the site

A few notes to be aware of:

* Before submitting a PR be sure to run `npm run test` and address any issues uncovered
* Any make target that requires `get-milestones` requires that a GH_TOKEN environment variable be set

## Mirrored Documentation

### Language-specific documentation (under `/content/en/docs/<language>`)

The per-language API, SDK, and "Getting Started" documentation is hosted in each language's repository under the `website_docs` directory.
The content of those docs is mirrored to each language's directory in this repository (open-telemetry/opentelemetry.io): [`/content/en/docs/<language>`](./content/en/docs/).

Content updates for those pages should take place in your language's repository.
That includes changes to:

* the "Status and Releases" section in `_index.md`
* the "Getting Started" page, if it exists
* any language-specific instrumentation pages
* any other pages that live under that language's section on [the docs site](https://opentelemetry.io/docs/)

Once a release occurs for a SIG or any content gets updated in those docs, an issue or PR should be created in this repository to pull the latest into `/content/en/docs/<language>`.

### Anything else under `content/`

All other content, including entries in the [Registry](https://opentelemetry.io/registry/), is hosted in this repository and can be updated here.

## Deploy previews

Whenever you submit a pull request to this repo, Netlify creates a [deploy
preview](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/)
for the changes in that specific PR. You can view the deploy preview in the
Netlify panel that appears under the PR description.

## Publishing the site

The OpenTelemetry website is published automatically by
[Netlify](https://netlify.com). When changes are pushed to the `main` branch,
Netlify re-builds and re-deploys the site and stages a deploy preview for those
changes.

> Site administrators can access the admin interface
> [here](https://app.netlify.com/sites/opentelemetry/overview).
