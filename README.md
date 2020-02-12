# opentelemetry.io

This repo houses the source code for the [OpenTelemetry](https://opentelemetry.io) website and documentation.

## Publishing the site

The OpenTelemetry website is published automatically by [Netlify](https://netlify.com). When changes are pushed to the `master` branch, Netlify re-builds and re-deploys the site and stages a deploy preview for those changes.

> Site adminstrators can access the admin interface [here](https://app.netlify.com/sites/opentelemetry/overview).

### Deploy previews

Whenever you submit a pull request to this repo, Netlify creates a [deploy preview](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/) for the changes in that specific PR. You can view the deploy preview in the Netlify panel that appears under the PR description.

### Dev Setup

#### Instructions

* Fork and clone the repository
* Install [Hugo](https://gohugo.io/getting-started/installing/#quick-install) and [npm](https://npmjs.com)
* Run `make serve`
* Open `http://localhost:1313` to check the site
