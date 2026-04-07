# Markdown Negotiation

This folder contains the markdown-negotiation Edge Function implementation and
its tests.

The local `package.json` sets `"type": "module"` so Node treats the `.ts` test
files in this folder as ESM without changing module semantics for the whole
repo.

Run the tests with:

```console
npm run test:edge-functions
```
