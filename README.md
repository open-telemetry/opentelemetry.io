# opentelemetry.io

This repos houses the source code for the [OpenTelemetry](https://opentelemetry.io) website and documentation.

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

> Please note that you need to install the "extended" version of Hugo (with built-in support) to run the site locally.

### Adding a project to the OpenTelemetry Registry
Do you maintain or contribute to an integration for OpenTelemetry? We'd love to feature your project in the registry!

To add your project, please make a pull request. You'll need to create a data file in `/content/registry` for your project in the following format:

```
---
title: My OpenTelemetry Integration // the name of your project
registryType: <exporter/core/instrumentation> // the type of integration; is this an exporter, plugin, API package, or something else?
isThirdParty: <false/true> // this is only true if the project is maintained by the OpenTelemetry project
language: <js/go/dotnet/etc. or collector for collector plugins>
tags:
  - <other useful search terms>
repo: https://github.com/your-organization/your-repo // projects don't have to be hosted on github, but this should link to the git or other source control repository for your project
license: Apache 2.0 // or whatever your OSS license is
description: A friendly description of your integration/plugin
authors: <The author or authors of your integration. An email is a great thing to include!>
otVersion: <The OpenTelemetry version your plugin targets.> 
---
```
