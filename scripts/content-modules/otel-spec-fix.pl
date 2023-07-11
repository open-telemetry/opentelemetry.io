#!/usr/bin/perl -w -i
#
# DRAFT script used to fix otel-spec page Hugo front matter
#

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
my $opAmpSpecRepoUrl = 'https://github.com/open-telemetry/opamp-spec';
my $semconvSpecRepoUrl = 'https://github.com/open-telemetry/semantic-conventions';
my $semConvRef = "$otelSpecRepoUrl/blob/main/semantic_conventions/README.md";
my $specBasePath = '/docs/specs';
my $path_base_for_github_subdir = "content/en$specBasePath";
my %versions = qw(
  spec: 1.22.0
  otlp: 1.0.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};

my $openmetricsAliases = << 'EOS';
aliases:
  - /docs/reference/specification/compatibility/openmetrics
  - /docs/specs/otel/compatibility/openmetrics
EOS
sub printTitleAndFrontMatter() {
  my $frontMatter = '';
  my $originalTitle = $title;
  # printf STDOUT "> $file has front matter:\n$frontMatterFromFile\n"; # if $gD;
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  $frontMatter .= "title: $titleMaybeQuoted\n" if $frontMatterFromFile !~ /title: / && $title ne $originalTitle;
  if ($title =~ /^(.*?) Compatibility$/) {
    $linkTitle = "$1";
  }
  $frontMatterFromFile =~ s/^(linkTitle:) noop$/$1 No-Op/;
  $frontMatter .= "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  $frontMatter .= $frontMatterFromFile if $frontMatterFromFile;

  if ($ARGV =~ /prometheus_and_openmetrics.md$/) {
    $frontMatter .= $openmetricsAliases;
  }

  if ($frontMatter) {
    print "<!--- Hugo front matter used to generate the website version of this page:\n";
    print "$frontMatter";
    print "--->\n\n";
  }
  print "# $title\n"
}

# main

while(<>) {
  # printf STDOUT "$ARGV Got: $_" if $gD;

  if ($file ne $ARGV) {
    $file = $ARGV;
    # printf STDOUT "> $file\n"; # if $gD;
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
    $linkTitle = '';
    printTitleAndFrontMatter() if $title;
    next;
  }

  print;
}
