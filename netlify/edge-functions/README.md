# Netlify Edge Functions

This directory holds Edge Function entry points, shared helpers (`lib/`), and
per-function folders (for example `markdown-negotiation/`, `schema-analytics/`).

## Node and `package.json`

[`package.json`](./package.json) in this directory sets `"type": "module"` so
Node treats `*.test.ts` files here as ESM when using `node --test`, without
changing module semantics for the rest of the repository.

## Tests

Per-function testing, if any, is documented in each folder’s README.

## Unit tests

To run all edge-function unit tests, from the repository root:

```console
npm run test:edge-functions
```

## Live tests

To run the live deployed-host tests:

```console
npm run test:edge-functions:live -- [URL | PR_NUMBER]
```
