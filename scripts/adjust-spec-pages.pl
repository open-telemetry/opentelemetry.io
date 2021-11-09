#!/usr/bin/perl -w -i

$^W = 1;

use strict;
use warnings;
use diagnostics;

my $file = '';
my $title = '';
my $linkTitle = '';
my $gD = 0;
my $semConvRef = 'https://github.com/open-telemetry/opentelemetry-specification/blob/main/semantic_conventions/README.md';

sub printTitle() {
  print "---\n";
  print "title: $title\n";
  print "weight: 1\n" if $title eq "Overview";
  ($linkTitle) = $title =~ /^OpenTelemetry (.*)/;
  $linkTitle = 'FaaS' if $ARGV =~ /faas-metrics.md$/;
  $linkTitle = 'HTTP' if $ARGV =~ /http-metrics.md$/;
  print "linkTitle: $linkTitle\n" if $linkTitle;
  if ($ARGV =~ /_index.md$/) {
    print "path_base_for_github_subdir:\n";
    print "  from: content/en/docs/specification/(.*?)/_index.md\n";
    print "  to: \$1/README.md\n";
  }
  print "---\n";
}

sub skipDetailsOrToc() {
  while(<>) { last if /<\/details>|<!-- tocstop/; }
}

# main

while(<>) {
  # printf STDOUT "$ARGV Got: $_" if $gD;

  if ($file ne $ARGV) {
    $title = '';
    $file = $ARGV;
  }
  if(! $title) {
    ($title) = /^#\s+(.*)/;
    printTitle() if $title;
    next;
  }

  if(/<details>|<!-- toc/) {
    skipDetailsOrToc();
    next;
  }

  s|../semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;

  # Bug fix from original source
  s/#(#(instrument|set-status))/$1/;

  # Images
  s|(\.\./)?internal(/img/[-\w]+\.png)|$2|g;
  s|(\]\()(img/.*?\))|$1../$2|g;

  # Fix links that are to the title of the .md page
  s|(/context/api-propagators.md)#propagators-api|$1|g;
  s|(/semantic_conventions/faas.md)#function-as-a-service|$1|g;
  s/#log-data-model/./;

  s|\bREADME.md\b|_index.md|g;

  # Rewrite inline links
  s|\]\(([^:\)]*?\.md(#.*?)?)\)|]({{< relref "$1" >}})|g;

  # Rewrite link defs
  s|^(\[[^\]]+\]:\s*)([^:\s]*)(\s*(\(.*\))?)$|$1\{{< relref "$2" >}}$3|g;

  print;
}