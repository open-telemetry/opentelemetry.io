---
title: Scaffolding
weight: 2
---

Let's assume you're experimenting in a [fork](https://github.com/open-telemetry/opentelemetry-collector-contrib/fork) of [`opentelemetry-collector-contrib`](https://github.com/open-telemetry/opentelemetry-collector-contrib), and you wish to make a new receiver named `foobar`.
Once you've forked, cloned, and `cd`'d into the directory, set up some more assumed defaults if you wish to follow along.  However, it's recommended you either [maintain your own collector](../custom-collector.md) if you want to use your custom receiver in production, or even contribute it upstream.

{{% alert title="Upstream contributions" color="primary" %}}
Note that [becoming a codeowner](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/CONTRIBUTING.md#becoming-a-code-owner) is a commitment.  As with many open source projects, resourcing and funding is, in general, tight.  The `-contrib` repo is the basis for the most popular custom distributions, and is used by customers in production environments.  The OpenTelemetry maintainers reserve and exercise the right to remove any "abandoned" components in `-contrib`.
That said, if you or your company are willing to own any given component, we absolutely welcome new contributors to the project.
{{% /alert %}}

```bash
GITHUB_ORG="MY_GITHUB_ORG"
git remote add personal "git@github.com:$GITHUB_ORG/opentelemetry-collector-contrib.git"
```

You can run the following commands to create a new receiver, replacing "foobar" with whatever you desire

```bash
export MY_RECEIVER="${MY_RECEIVER:-foobar}"
mkdir "receivers/$MY_RECEIVER"
go mod init "github.com/$GITHUB_ORG/opentelemetry-collector-contrib/receivers/$MY_RECEIVER"
```

## Meta Data Generator
There's a lot of boilerplate to be done in scaffolding, and a lot of code for the OpenTelemetry community to maintain.
The community has created the Meta Data Generator ([`mdatagen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/mdatagen)) to help standardize and smooth out this process

To use `mdatagen`, include a `go:generate` directive in a file named [`doc.go`](https://github.com/search?q=repo%3Aopen-telemetry%2Fopentelemetry-collector-contrib%20path%3A*doc.go&type=code), and the configuration in [`metadata.yaml`](https://github.com/search?q=repo%3Aopen-telemetry%2Fopentelemetry-collector-contrib%20path%3A*metadata.yaml&type=code).
```bash
echo "//go:generate mdatagen mdatagen.yaml" >> "receivers/$MY_RECEIVER/docs.go"
echo "package $MY_RECEIVER" >> "receivers/$MY_RECEIVER/docs.go"
make addlicense # will add license to docs.go file
```

Next, define your `metadata.yaml` file.  `echo "type: \"$MY_RECEIVER\"" >> "receivers/$MY_RECEIVER/metadata.yaml"`, and use your favorite editor to
add the following.  What these keys mean will be explained later on.
```yaml
# Defines semantic conventions version this follows, recommend adhering to latest from 
# https://github.com/open-telemetry/semantic-conventions/tree/main/schemas
sem_conv_version: "0.0.0" # Defines semantic conventions version, see below
# You can configure the stability level for each consumer type, along with included distributions
status:
  class: "receiver"
  stability:
    development: ["trace", "metrics", "logs"]
# Resource attributes are attributes which apply to all metrics, traces, and logs
resource_attributes:
# Attributes are reusable
attributes:
# Metrics needs to exist for a metricsreceiver, even if of the scraping type
metrics:
```

Your `metadata.yaml` should now look something like

```yaml
type: "foobar"
sem_conv_version: "0.0.0"
status:
  class: "receiver"
  stability:
    development: ["trace", "metrics", "logs"]
resource_attributes:
metrics:
```

## Generate files

Run `make generate` to generate some boilerplate conventions in `receivers/foobar/internal/metadata`.

After you've written your `mdatagen.yaml` and ran `make generate` on the repo,
you should see a handful of files in a directory named `internal/metadata`
relative to your receiver's root directory (in this example,
`receivers/foobar`).

