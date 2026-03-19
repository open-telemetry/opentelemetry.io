// @ts-check
//
// Project-specific link-pattern rules built on the generic
// createLinkPatternRule factory. Each rule can then be independently configured
// and disabled.
//
// Rule configuration lives in .markdownlint.yaml under the rule name.

import { createLinkPatternRule } from 'markdownlint-rule-link-pattern';

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
