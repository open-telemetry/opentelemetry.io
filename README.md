# opentelemetry.io

This repo houses the source code for the
[OpenTelemetry](https://opentelemetry.io) website and documentation.

## Publishing the site

The OpenTelemetry website is published automatically by
[Netlify](https://netlify.com). When changes are pushed to the `master` branch,
Netlify re-builds and re-deploys the site and stages a deploy preview for those
changes.

> Site adminstrators can access the admin interface
> [here](https://app.netlify.com/sites/opentelemetry/overview).

### Deploy previews

Whenever you submit a pull request to this repo, Netlify creates a [deploy
preview](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/)
for the changes in that specific PR. You can view the deploy preview in the
Netlify panel that appears under the PR description.

### Dev Setup

#### Instructions

* Fork and clone the repository
* Install [Hugo](https://gohugo.io/getting-started/installing/#quick-install) and [npm](https://npmjs.com)
* Run `make serve`
* Open `http://localhost:30000` to check the site

> Please note that you need to install the "extended" version of Hugo (with
> built-in support) to run the site locally.

### Adding a project to the OpenTelemetry Registry

Do you maintain or contribute to an integration for OpenTelemetry? We'd love to
feature your project in the registry!

To add your project, please make a pull request. You'll need to create a data
file in `/content/en/registry` for your project. You can find a template in `./templates/registry-template.md`