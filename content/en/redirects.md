---
title: Redirect Rules
description: A comprehensive list of all redirect rules configured in the site
layout: redirects-list
type: redirects
htmltest:
  ignore: true
---

This page is automatically generated and lists all redirect rules configured in
the OpenTelemetry documentation site. It is used for link checking to ensure
that all redirect targets are valid and accessible.

## Purpose

Redirect rules are created from:

1. **Aliases** - Defined in page front matter using the `aliases` parameter
2. **Redirects** - Defined in page front matter using the `redirects` parameter
3. **Redirect param** - Single redirect defined using the `redirect` parameter
4. **Hardcoded rules** - Defined in `layouts/index.redirects`

This page helps ensure that:

- All redirect targets point to valid pages
- No redirect creates a 404 error
- Redirect chains are minimized
- The site maintains good SEO and user experience
