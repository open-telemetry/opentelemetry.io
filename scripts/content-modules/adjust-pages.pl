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
my $semConvRef = "$otelSpecRepoUrl/blob/main/semantic_conventions/README.md";
my $specBasePath = '/docs/specs';
my $path_base_for_github_subdir = "content/en$specBasePath";
my %versions = qw(
  spec: 1.20.0
  otlp: main
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};

sub printTitleAndFrontMatter() {
  print "---\n";
  if ($title eq 'OpenTelemetry Specification') {
    $title .= " $otelSpecVers";
    # start:temporary adjustment to front matter until spec is updated:
    $frontMatterFromFile =~ s/linkTitle: .*/linkTitle: OTel spec/;
    # end:temporary adjustment
    $frontMatterFromFile =~ s/linkTitle: .*/$& $otelSpecVers/;
  } elsif ( $title eq 'OpenTelemetry Protocol' ) {
    # $frontMatterFromFile = "linkTitle: OTLP\n";
  }
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  print "title: $titleMaybeQuoted\n";
  ($linkTitle) = $title =~ /^OpenTelemetry (.*)/;
  print "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  # Temporary adjustment until OTel spec is updated:
  $frontMatterFromFile =~ s|(path_base_for_github_subdir: content/en/docs)/reference/specification/|$1/specification/otel/|;
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

  if (/\((https:\/\/github.com\/open-telemetry\/opentelemetry-specification\/\w+\/\w+\/specification([^\)]*))\)/) {
    printf STDOUT "WARNING: link to spec page encoded as an external URL, but should be a local path, fix this upstream;\n  File: $ARGV \n  Link: $1\n";
  }
  s|\(https://github.com/open-telemetry/opentelemetry-specification/\w+/\w+/specification([^\)]*)\)|($specBasePath/otel$1)|;

  # Images
  s|(\.\./)?internal(/img/[-\w]+\.png)|$2|g;
  s|(\]\()(img/.*?\))|$1../$2|g if $ARGV !~ /(logs|schemas)._index/;

  # Fix links that are to the title of the .md page
  # TODO: fix these in the spec
  s|(/context/api-propagators.md)#propagators-api|$1|g;
  s|(/semantic_conventions/faas.md)#function-as-a-service|$1|g;
  s|(/resource/sdk.md)#resource-sdk|$1|g;

  s|\.\.\/README.md\b|$otelSpecRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md\b|..| if $ARGV =~ /specification.library-guidelines.md/;

  s|\.\.\/(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/$otlpSpecVers/$1/|g if $ARGV =~ /\/tmp\/otlp/;
  s|\.\.\/README.md\b|$otlpSpecRepoUrl/|g if $ARGV =~ /\/tmp\/otlp/;

  s|\bREADME.md\b|_index.md|g;

  # Rewrite paths into experimental directory as external links
  s|(\.\.\/)+(experimental\/[^)]+)|https://github.com/open-telemetry/opentelemetry-specification/tree/main/$1|g;

  # Rewrite inline links
  s|\]\(([^:\)]*?\.md(#.*?)?)\)|]({{% relref "$1" %}})|g;

  # Rewrite link defs
  s|^(\[[^\]]+\]:\s*)([^:\s]*)(\s*(\(.*\))?)$|$1\{{% relref "$2" %}}$3|g;

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  print;
}
