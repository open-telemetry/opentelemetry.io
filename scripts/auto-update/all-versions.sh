#!/bin/bash -e

GIT=git
NPM=npm

function auto_update_versions() {
  local cmd="./scripts/auto-update/version-in-file.sh"
  local repo_and_files_to_update=(

      # Format of an entry is
      # "repo-name regex file-name [regex file-name...]"

      "opentelemetry-collector-releases
        vers content/en/docs/collector/_index.md
        collector_vers content/en/docs/security/_index.md"
      "opentelemetry-java
        otel content/en/docs/languages/java/_index.md
        otel content/en/docs/zero-code/java/_index.md"
      "opentelemetry-java-instrumentation
        instrumentation content/en/docs/languages/java/_index.md
        instrumentation content/en/docs/zero-code/java/_index.md"
      "opentelemetry-java-contrib
        contrib content/en/docs/languages/java/_index.md"
      "opentelemetry-specification
        spec scripts/content-modules/adjust-pages.pl
        spec .gitmodules"
      "opentelemetry-proto
        otlp scripts/content-modules/adjust-pages.pl
        otlp .gitmodules"
      "semantic-conventions
        semconv scripts/content-modules/adjust-pages.pl
        semconv .gitmodules"
      "semantic-conventions-java
        semconv content/en/docs/languages/java/_index.md"
  )

  for args in "${repo_and_files_to_update[@]}"; do
      echo "> $cmd $args"
      $cmd $args
      echo
  done

  echo "Running fix:refcache..."
  $NPM run fix:refcache

  if ! git diff --quiet; then
    echo "Committing refcache fixes..."
    $GIT commit -a -m "Fix refcache"
    $GIT push
  else
    echo "No refcache changes to commit."
  fi
}

auto_update_versions
