## Dev Setup

* Fork and clone the repository
* Install [Hugo](https://gohugo.io/getting-started/installing/#quick-install)
  * Please note that you need to install the "extended" version of Hugo (with built-in support) to run the site locally.
* Install [npm](https://npmjs.com)
* Run `make serve`
  * If you are on OS X and see an error like `too many open files` or `pipe failed`, you may need to increase the file descriptor limit. See [this Hugo GitHub issue](https://github.com/gohugoio/hugo/issues/6109).
* Open `http://localhost:30000` to check the site

A few notes to be aware of:

* Before submitting a PR be sure to run `make test` and address any issues uncovered
* Any make target that requires `get-milestones` requires that a GH_TOKEN environment variable be set

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

