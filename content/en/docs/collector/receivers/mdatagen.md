---
title: Metrics Data Generator [mdatagen]
---


## Generative configuration files
To use [`mdatagen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/mdatagen), include a `go:generate` directive in a file named
`doc.go`, and the configuration in `metadata.yaml`.

Let's say we're making the `receivers/foobar` receiver. This directory
should have a
[`doc.go`](https://github.com/search?q=repo%3Aopen-telemetry%2Fopentelemetry-collector-contrib%20path%3A*doc.go&type=code) and [`metadata.yaml`](https://github.com/search?q=repo%3Aopen-telemetry%2Fopentelemetry-collector-contrib%20path%3A*metadata.yaml&type=code)
file inside here. You can find examples of what these may look like in the
`cmd/mdatagen` folder. At the time of writing this document, they look like so



### metadata.yaml

[`metadata.yaml`](https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/cmd/mdatagen/metadata.yaml)
follows
[`metadata-schema.yaml`](https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/cmd/mdatagen/metadata-schema.yaml).
The specific configuration for such will depend on the class you set. Currently,
`receiver`s, `exporter`s, and `processor`s, `connector`s, and `extension`s are supported, with varying degrees of support.

At minimum, `mdatagen` will handle the creation of standardized component documentation and status registration.

In the case of a scraping receiver, you should provide a `metrics` section with 

### doc.go

Nothing other than a near-empty `doc.go` file with a build tag is required.

The magic is done by the comment `//go:generate mdatagen metadata.yaml` in
`doc.go`.

```go
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// Generate a test metrics builder from a sample metrics set covering all configuration options.
//go:generate mdatagen metadata.yaml
package foobar
```

Once you have this file, run `make addlicense` to ensure the file contains the
relevant licensing info (as shown above, assuming you're contributing this to
`opentelemetry-collector-contrib`), and then run `make generate` to generate
some boilerplate conventions in `recievers/foobar/internal/metadata` we'll use
later.

## Generated files

After you've written your `mdatagen.yaml` and ran `make generate` on the repo,
you should see a handfull of files in a directory named `internal/metadata`
relative to your receiver's root directory (in this example,
`receivers/foobar`).

## Creating

```bash
OPENTELEMETRYROOT=
DOC_DIR=
cp $OPENTELEMETRYROOT/cmd/mdatagen/metadata.yaml $DOC_DIR &&
cp $OPENTELEMETRYROOT/cmd/mdatagen/docs.yaml $DOC_DIR
```

- what's generated (docs, test, metadata)
- `metadata.yaml`
- is `config.go` required?

# Resources

- [`mdatagen` tool & documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/mdatagen)
- `metadata.yaml` [sample]() and [usage]()
- [Sample `metadata.yaml`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/mdatagen/metadata.yaml)
- [Follows `metadata-schema.yaml`](https://raw.githubusercontent.com/open-telemetry/opentelemetry-collector-contrib/main/cmd/mdatagen/metadata-schema.yaml)
