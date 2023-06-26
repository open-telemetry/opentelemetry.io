#!/usr/bin/perl -w -i

$^W = 1;

use strict;
use warnings;
use diagnostics;

my $file = '';
my $frontMatterFromFile = '';
my $title = '';
my $linkTitle = '';
my $gD = 0;
my $otelSpecRepoUrl = 'https://github.com/open-telemetry/opentelemetry-specification';
my $otlpSpecRepoUrl = 'https://github.com/open-telemetry/opentelemetry-proto';
my $semconvSpecRepoUrl = 'https://github.com/open-telemetry/semantic-conventions';
my $semConvRef = "$otelSpecRepoUrl/blob/main/semantic_conventions/README.md";
my $specBasePath = '/docs/specs';
my $path_base_for_github_subdir = "content/en$specBasePath";
my %versions = qw(
  spec: 1.22.0
  otlp: 0.20.0
  semconv: 1.21.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $semconvSpecVers = $versions{'semconv:'};
my $unused;

sub printTitleAndFrontMatter() {
  print "---\n";
  if ($title eq 'OpenTelemetry Specification') {
    $title .= " $otelSpecVers";
    $frontMatterFromFile =~ s/(linkTitle:) .*/$1 OTel $otelSpecVers/;
  } elsif ($title eq 'OpenTelemetry Protocol Specification') {
    $frontMatterFromFile =~ s/(title|linkTitle): .*/$& $otlpSpecVers/g;
  } elsif ($title eq 'OpenTelemetry Semantic Conventions') {
    $frontMatterFromFile =~ s/(title|linkTitle): .*/$& $semconvSpecVers/g;
  }
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  print "title: $titleMaybeQuoted\n" if $frontMatterFromFile !~ /title: /;
  ($unused, $linkTitle) = $title =~ /^OpenTelemetry (Protocol )?(.*)/;
  $linkTitle = 'Design Goals' if $title eq 'Design Goals for OpenTelemetry Wire Protocol';
  print "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  print "$frontMatterFromFile" if $frontMatterFromFile;
  if ($ARGV =~ /otel\/specification\/(.*?)_index.md$/) {
    print "path_base_for_github_subdir:\n";
    print "  from: $path_base_for_github_subdir/otel/$1_index.md\n";
    print "  to: $1README.md\n";
  }
  print "---\n";
}

# main

while(<>) {
  # printf STDOUT "$ARGV Got: $_" if $gD;

  if ($file ne $ARGV) {
    $file = $ARGV;
    $frontMatterFromFile = '';
    $title = '';
    if (/^<!---? Hugo/) {
        while(<>) {
          last if /^-?-->/;
          $frontMatterFromFile .= $_;
        }
        next;
    }
  }
  if(! $title) {
    ($title) = /^#\s+(.*)/;
    printTitleAndFrontMatter() if $title;
    next;
  }

  if (/<details>/) {
    while(<>) { last if /<\/details>/; }
    next;
  }
  if(/<!-- toc -->/) {
    while(<>) { last if/<!-- tocstop -->/; }
    next;
  }

  # SPECIFICATION custom processing

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($specBasePath/otel/)|;
  s|(\]\()/specification/|$1$specBasePath/otel/)|;
  s|\.\./semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;
  s|\.\./specification/(.*?\))|../otel/$1)|g if $ARGV =~ /otel\/specification/;

  if (
    /\((https:\/\/github.com\/open-telemetry\/opentelemetry-specification\/\w+\/\w+\/specification([^\)]*))\)/ &&
    $ARGV !~ /semantic_conventions|otlp\/docs/
    ) {
    printf STDOUT "WARNING: link to spec page encoded as an external URL, but should be a local path, fix this upstream;\n  File: $ARGV \n  Link: $1\n";
  }
  s|\(https://github.com/open-telemetry/opentelemetry-specification/\w+/\w+/specification([^\)]*)\)|($specBasePath/otel$1)|;

  s|(https://)?github.com/open-telemetry/opentelemetry-proto/(blob/main/)?docs/specification.md|$specBasePath/otlp/|g;

  # Images
  s|(\.\./)?internal(/img/[-\w]+\.png)|$2|g;
  s|(\]\()(img/.*?\))|$1../$2|g if $ARGV !~ /(logs|schemas)._index/ && $ARGV !~ /otlp\/docs/;

  # Fix links that are to the title of the .md page
  # TODO: fix these in the spec
  s|(/context/api-propagators.md)#propagators-api|$1|g;
  s|(/semantic_conventions/faas.md)#function-as-a-service|$1|g;
  s|(/resource/sdk.md)#resource-sdk|$1|g;

  s|\.\.\/README.md\b|$otelSpecRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md\b|..| if $ARGV =~ /specification.library-guidelines.md/;

  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/$otlpSpecVers/$1|g if $ARGV =~ /\/tmp\/otlp/;
  s|\.\./README.md\b|$otlpSpecRepoUrl/|g if $ARGV =~ /\/tmp\/otlp/;
  s|\.\./examples/README.md\b|$otlpSpecRepoUrl/tree/$otlpSpecVers/examples/|g if $ARGV =~ /\/tmp\/otlp/;

  s|\bREADME.md\b|_index.md|g if $ARGV !~ /otel\/specification\/protocol\/_index.md/;

  # Rewrite paths that are outside of the main spec folder as external links
  s|(\.\.\/)+(experimental\/[^)]+)|$otelSpecRepoUrl/tree/$otelSpecVers/$2|g;
  s|(\.\.\/)+(supplementary-guidelines\/compatibility\/[^)]+)|$otelSpecRepoUrl/tree/$otelSpecVers/$2|g;

  # Rewrite inline links
  s|\]\(([^:\)]*?\.md(#.*?)?)\)|]({{% relref "$1" %}})|g;

  # Rewrite link defs
  s|^(\[[^\]]+\]:\s*)([^:\s]*)(\s*(\(.*\))?)$|$1\{{% relref "$2" %}}$3|g;

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  print;
}
