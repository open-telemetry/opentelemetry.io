# Custom markdownlint rules

This folder contains custom [markdownlint][] rules for the OpenTelemetry
website, configured via [markdownlint-cli2][].

For guidance on writing custom rules, see [Custom Rules][].

## Parser recommendation

From the [Custom Rules][] documentation:

> Custom rules can (should) operate on a structured set of tokens based on the
> **`micromark`** `parser` (this is preferred). Alternatively, custom rules can
> operate on a structured set of tokens based on the `markdown-it` `parser`
> (legacy support).

## Helper functions

The [markdownlint-rule-helpers][] package provides helper functions for custom
rules, including micromark-specific helpers:

```js
import { filterByTypes } from 'markdownlint-rule-helpers/micromark';
```

## Testing

Rules in subfolders can include tests using Node's built-in test runner. Run
tests with:

```sh
node --test scripts/_md-rules/*/index.test.mjs
```

[Custom Rules]:
  https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
[markdownlint]: https://github.com/DavidAnson/markdownlint
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[markdownlint-rule-helpers]:
  https://www.npmjs.com/package/markdownlint-rule-helpers
