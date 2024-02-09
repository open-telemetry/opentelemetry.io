#!/bin/bash -e

function auto_update_versions() {
  local cmd="./scripts/auto-update/version-in-file.sh"
  local updates=(
      "opentelemetry-collector-releases vers content/en/docs/collector/_index.md"
      "opentelemetry-java otel content/en/docs/languages/java/_index.md"
      "opentelemetry-java-instrumentation instrumentation content/en/docs/languages/java/_index.md"
      "opentelemetry-specification spec scripts/content-modules/adjust-pages.pl .gitmodules"
      "opentelemetry-proto otlp scripts/content-modules/adjust-pages.pl .gitmodules"
      "semantic-conventions semconv scripts/content-modules/adjust-pages.pl .gitmodules"
      "semantic-conventions-java semconv content/en/docs/languages/java/_index.md"
  )

  for args in "${updates[@]}"; do
      echo "> $cmd $args"
      $cmd $args
      echo
  done
}

auto_update_versions
