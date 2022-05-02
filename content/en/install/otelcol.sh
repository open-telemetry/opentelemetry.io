#!/bin/bash

echo -n "Installing the OpenTelemetry Collector into your current directory: $(pwd) in 3"
#sleep 1
#echo -n " 2"
#sleep 1
#echo -n " 1"
#sleep 1
echo ""

LATEST_URL=$(curl -Ls -o /dev/null -w %{url_effective} https://github.com/open-telemetry/opentelemetry-collector-releases/releases/latest)

VERSION=${LATEST_URL##*/v}

ARCH=""

case "$(uname -m)" in
   x86_64)
     ARCH="amd64"
     ;;
   arm64)
     ARCH="arm64"
     ;;
   *)
     echo "Your operating system is not supported, please compile the collector following these instructions: http://localhost:8888/docs/collector/getting-started/#local"
     exit -1
     ;;
esac

case "$(uname -s)" in
   Darwin)
     SUFFIX="darwin_${ARCH}.tar.gz"
     ;;
   Linux)
     SUFFIX="linux_${ARCH}.tar.gz"
     ;;
   CYGWIN*|MINGW32*|MSYS*|MINGW*)
     SUFFIX="linux_${ARCH}.tar.gz"
     ;;
   *)
     echo "Your operating system is not supported, please compile the collector following these instructions: http://localhost:8888/docs/collector/getting-started/#local"
     exit -1
     ;;
esac

URL="https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${VERSION}/otelcol_${VERSION}_${SUFFIX}"
FILE="otelcol_${VERSION}_${SUFFIX}"

echo " * Downloading ${URL}"

curl -L -o "${FILE}" "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${VERSION}/otelcol_${VERSION}_${SUFFIX}"

echo " * Unpacking ${FILE}"

tar xvfz ${FILE}
