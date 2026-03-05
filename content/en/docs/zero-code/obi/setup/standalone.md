---
title: Run OBI as a standalone process
linkTitle: Standalone
description: Learn how to setup and run OBI as a standalone Linux process.
weight: 5
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
- `SHA256SUMS` - Checksums for verification

Set your desired version and architecture:

```sh
# Set your desired version (find latest at
# https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)
VERSION=0.5.0

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

The archive contains:

- `obi` - Main OBI binary
- `k8s-cache` - Kubernetes cache binary
- `obi-java-agent.jar` - Java instrumentation agent
- `LICENSE` - Project license
- `NOTICE` - Legal notices
- `NOTICES/` - Third-party licenses and attributions

> [!IMPORTANT]
>
> The `obi-java-agent.jar` file must remain in the same directory as the `obi`
> binary. This is required for Java instrumentation to function properly.

## Install to system

After extracting the archive, you can install the binaries to a location in your
PATH so they can be used from any directory.

The following example installs to `/usr/local/bin`, which is a standard location
on most Linux distributions. You can install to any other directory in your
PATH:

```bash
# Move binaries to a directory in your PATH
sudo cp obi /usr/local/bin/

# The Java agent MUST be in the same directory as the OBI binary
sudo cp obi-java-agent.jar /usr/local/bin/

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
