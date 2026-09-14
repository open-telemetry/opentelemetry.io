---
title: Supply-chain audit design
description: >-
  Verification principles behind the committed supply-chain audit test
weight: 21
cSpell:ignore: mismodels
---

The [supply-chain audit][] proves the repository's [dependency
controls][controls] from committed files alone. This page records the design
principles that keep the audit itself trustworthy: an audit that can be fooled
(or that passes when it checks nothing) is worse than none, because green then
vouches for an unverified state. The principles come from adversarial review
rounds against this audit and its [Docsy predecessor][docsy-2714], each round
hunting inputs that violate a control yet pass the test.

For which controls exist and why, see
[Supply-chain security](../supply-chain-security/); for what to do when the
audit fails on your PR, see the [audit section][supply-chain audit] of the
dependency docs.

## Principles

Each principle answers a way a verifier can lie; adversarial review found
concrete instances of most of them in earlier drafts.

1. **Prove from committed files alone.** The audit reads the lock, manifests,
   `.npmrc`, and `netlify.toml` (never the network or the installed tree), so it
   is fast, offline, and can't be swayed by the state it is meant to vet.
2. **Allowlist whole shapes; don't denylist patterns.** Every denylist regular
   expression over a config format eventually met a valid spelling it didn't
   anticipate (quoted, dotted, and inline-table TOML keys all bypassed an
   env-key denylist). Pinning the entire reviewed shape (exact key sets, exact
   values) is stronger and usually shorter.
3. **Parse; don't line-scan.** A format's parser defines its semantics. A line
   regular expression mismodels them silently: a context table it doesn't
   recognize still means something to Netlify.
4. **Exact pins; no prefix or flag matching.** Prefix matching accepts an
   appended `&& npm install ...` rider on a script the audit trusts by name.
5. **Fail closed on absence.** Every counting check carries a floor assertion,
   so an empty input can't pass vacuously; entries missing an expected field
   fail rather than being skipped.
6. **Bind to the identity npm trusts.** npm derives a package's identity from
   its `resolved` registry URL, not from the lock key or `version` field, so the
   audit binds all three together; checking only the fields npm distrusts
   green-lights a mismatch npm would act on.
7. **One home per invariant.** A list asserted in two files drifts; the audit
   imports shared values from their owning module (the Hugo installer's
   env-override names come from the rebuild helper), and that module's unit test
   pins the content.
8. **Red-first.** A new check is trusted only after a deliberately broken input
   has made it fail; every closure in the audit's history was proven red before
   its green counted. A false green is worse than red.
9. **Assertions name the expected condition** and, for routine fires, the fix:
   the `allowScripts` assertion names the version a dependency bump must move
   the entry to, so the failure message is the remediation.
10. **State the scope boundary.** Surfaces the audit deliberately does not cover
    (workflow files, the theme's own install, build-half scripts) are named in
    the audit and the docs, so absent coverage is never mistaken for verified
    coverage.
11. **Every check earns its keep.** Security comes from the controls' design and
    from review, not from accreting assertions: each one taxes contributors and
    maintainers on every touch. A check belongs here only where it detects
    something review demonstrably cannot: an opaque, high-authority surface such
    as the lock, or a semantic too obscure to catch by eye. Where a control
    already fails closed at runtime, the audit doesn't re-assert it; when a
    check's upkeep cost outgrows its detection value, trimming it is the correct
    move, not a weakening.

## Principles in the audit

One exemplar per principle; the [test file][audit test] is the authoritative
inventory of assertions.

| Principle               | Exemplar in the audit                                                            |
| ----------------------- | -------------------------------------------------------------------------------- |
| Committed files alone   | Every input is read from the checkout; the suite runs with no network            |
| Allowlist whole shapes  | `netlify.toml`: top-level tables, build keys, and env key sets are `deepEqual`ed |
| Parse, don't line-scan  | `netlify.toml` is parsed with `smol-toml` before anything is asserted            |
| Exact pins              | The install-closure scripts are compared with `assert.equal`, never `match`      |
| Fail closed on absence  | `registryPackages > 0` floors; a version-less lock entry fails the IOC check     |
| Identity npm trusts     | Each registry entry's `resolved` URL must name its own package and version       |
| One home per invariant  | `UNSAFE_HUGO_ENV` is imported from `rebuild-hugo-extended.mjs`                   |
| Red-first               | Each hardening commit's PR notes the broken input that first made it fail        |
| Assertions name the fix | `allowScripts covers hugo-extended at its locked version X`                      |
| Stated scope boundary   | The audit's header comment names the excluded surfaces                           |
| Checks earn their keep  | The engines floor's minimums are review-adjudicated; `engine-strict` enforces    |

[audit test]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/supply-chain-audit.test.mjs
[controls]: ../../build/dependencies/#controls
[docsy-2714]: https://github.com/google/docsy/pull/2714
[supply-chain audit]: ../../build/dependencies/#audit
