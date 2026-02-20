// @ts-check
//
// Project-specific link-validation rules built on the generic
// createLinkPatternRule factory. Each entry becomes an independently
// configurable (and disableable) markdownlint rule.
//
// Rule config (regex + message) lives in .markdownlint.yaml under the rule
// name. For example:
//
//   no-typosquatting-urls:
//     regex: 'https://github\.(?!com|blog|io|github\.com)'
//     message: GitHub URLs should use github.(com|blog|io|github.com) domains.

import { createLinkPatternRule } from './validate-links/index.mjs';

export default [
  createLinkPatternRule(
    'no-typosquatting-urls',
    'Flag likely typosquatting GitHub URLs',
  ),
  createLinkPatternRule(
    'no-http-urls',
    'Report http URLs that are not localhost/127.0.0.1',
  ),
  createLinkPatternRule(
    'no-lang-prefix-in-paths',
    'Link paths should not start with a language code',
  ),
  createLinkPatternRule(
    'no-otel-io-external-urls',
    'Use a local path instead of an external URL for site-local pages',
  ),
  createLinkPatternRule(
    'no-spec-github-urls',
    'Use a local path for OTel specification pages',
  ),
  createLinkPatternRule(
    'no-proto-spec-github-urls',
    'Use a local path for OTel proto specification pages',
  ),
  createLinkPatternRule(
    'no-semconv-github-urls',
    'Use a local path for semantic conventions pages',
  ),
];
