---
title: Run OBI as a standalone process
linkTitle: Standalone
description: Learn how to setup and run OBI as a standalone Linux process.
weight: 5
cSpell:ignore: cyclonedx
---

OBI can run as a standalone Linux OS process with elevated privileges that can
inspect other running processes.

## Download and verify

OBI provides pre-built binaries for Linux (amd64 and arm64). Download the latest
release from the
[releases page](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases).
Each release includes:

- `obi-v<version>-linux-amd64.tar.gz` - Linux AMD64/x86_64 archive
- `obi-v<version>-linux-arm64.tar.gz` - Linux ARM64 archive
- `obi-v<version>-linux-amd64.cyclonedx.json` - CycloneDX SBOM for the AMD64
  archive
- `obi-v<version>-linux-arm64.cyclonedx.json` - CycloneDX SBOM for the ARM64
  archive
- `obi-v<version>-source-generated.cyclonedx.json` - CycloneDX SBOM for the
  source-generated archive
- `obi-java-agent-v<version>.cyclonedx.json` - CycloneDX SBOM for the embedded
  Java agent and its Java dependencies
- `SHA256SUMS` - Checksums for verification of the release archives and SBOM
  assets

Container images for the same release are also published. For image pull and
signature verification instructions, see
[Run OBI as a Docker container](../docker/).

Set your desired version and architecture:

```sh
# Set your desired version (find latest at
# https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)
VERSION=0.6.0

# Determine your architecture
# For Intel/AMD 64-bit: amd64
# For ARM 64-bit: arm64
ARCH=amd64

# Download the archive for your architecture
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.tar.gz

# Download checksums
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/SHA256SUMS

# Verify the archive
sha256sum -c SHA256SUMS --ignore-missing

# Extract the archive
tar -xzf obi-v${VERSION}-linux-${ARCH}.tar.gz
```

Successful verification prints an `OK` result for each downloaded file:

```text
obi-v${VERSION}-linux-${ARCH}.tar.gz: OK
```

If verification fails, `sha256sum` reports `FAILED`. When that happens:

- confirm that `VERSION` matches the archive and `SHA256SUMS` you downloaded
- remove any partially downloaded files and fetch them again
- verify only the files you actually downloaded from that release

The archive contains:

- `obi` - Main OBI binary
- `k8s-cache` - Kubernetes cache binary
- `LICENSE` - Project license
- `NOTICE` - Legal notices
- `NOTICES/` - Third-party licenses and attributions

> [!IMPORTANT]
>
> Starting in OBI v0.6.0, the Java agent is embedded in the `obi` binary. No
> separate `obi-java-agent.jar` file is required. At runtime, OBI extracts and
> caches the embedded Java agent under `$XDG_CACHE_HOME/obi/java` (or
> `~/.cache/obi/java`).
>
> The cache directory is determined by the user account running `obi`. When you
> use `sudo`, the cache will typically be created under the root user's cache
> directory (for example `/root/.cache/obi/java`) unless you override it. For
> system or service deployments, set `XDG_CACHE_HOME` to a suitable location
> (for example `XDG_CACHE_HOME=/var/cache/obi sudo -E obi ...`) or configure an
> explicit cache path according to your environment.

## SBOMs

CycloneDX SBOM files are optional metadata for supply-chain review and
automation. They are not required to install or run OBI.

The published SBOMs describe the contents of the binary archives and embedded
components in [CycloneDX JSON format](https://cyclonedx.org/). They can be used
with standard SBOM tooling to inspect dependencies, licenses, and components
without executing the binaries.

Download the SBOMs you want to inspect:

```sh
# SBOM for the binary archive you downloaded
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# SBOM for the embedded Java agent and its Java dependencies
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-java-agent-v${VERSION}.cyclonedx.json

# Optional: verify the downloaded SBOM files against SHA256SUMS too
sha256sum -c SHA256SUMS --ignore-missing
```

Example inspection commands:

```sh
# List component names and versions from the archive SBOM
jq '.components[] | {name, version}' obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Scan the SBOM with Grype
grype sbom:obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Inspect the Java agent dependency graph
jq '.components[] | {name, version}' obi-java-agent-v${VERSION}.cyclonedx.json
```

## Install to system

After extracting the archive, you can install the binaries to a location in your
PATH so they can be used from any directory.

The following example installs to `/usr/local/bin`, which is a standard location
on most Linux distributions. You can install to any other directory in your
PATH:

```bash
# Move binaries to a directory in your PATH
sudo cp obi /usr/local/bin/

# Verify installation
obi --version
```

## Set up OBI

1. Create a configuration file following the
   [configuration options](../../configure/options/) documentation. You can
   start with the [OBI configuration YAML example](../../configure/example/).

2. Run OBI as a privileged process:

   ```bash
   sudo obi --config=<path to config file>
   ```

   If you did not install OBI to your PATH, you can run it from the extracted
   directory:

   ```bash
   sudo ./obi --config=<path to config file>
   ```

## Permissions

OBI requires elevated privileges to function properly. For more information
about the specific capabilities required, see the
[security documentation](../../security/).
