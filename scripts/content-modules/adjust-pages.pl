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
my $specRepoUrl = 'https://github.com/open-telemetry/opentelemetry-specification';
my $semConvRef = "$specRepoUrl/blob/main/semantic_conventions/README.md";
my $spec_base_path = '/docs/reference/specification';
my $path_base_for_github_subdir = "content/en$spec_base_path";

my $rootFrontMatterExtra = <<"EOS";
no_list: true
cascade:
  body_class: otel-docs-spec
  github_repo: &repo $specRepoUrl
  github_subdir: specification
  path_base_for_github_subdir: $path_base_for_github_subdir/
  github_project_repo: *repo
EOS

sub printTitleAndFrontMatter() {
  print "---\n";
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  print "title: $titleMaybeQuoted\n";
  ($linkTitle) = $title =~ /^OpenTelemetry (.*)/;
  print "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  print "$frontMatterFromFile" if $frontMatterFromFile;
  if ($ARGV =~ /specification.(.*?)_index.md$/) {
    print "path_base_for_github_subdir:\n";
    print "  from: $path_base_for_github_subdir/$1_index.md\n";
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

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($spec_base_path/)|;
  s|(\]\()/specification/|$1$spec_base_path/)|;
  s|\.\./semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;

  # Bug fix from original source
  s/#(#(instrument|set-status))/$1/;

  # Images
  s|(\.\./)?internal(/img/[-\w]+\.png)|$2|g;
  s|(\]\()(img/.*?\))|$1../$2|g if $ARGV !~ /(logs|schemas)._index/;

  # Fix links that are to the title of the .md page
  # TODO: fix these in the spec
  s|(/context/api-propagators.md)#propagators-api|$1|g;
  s|(/semantic_conventions/faas.md)#function-as-a-service|$1|g;
  s|(/resource/sdk.md)#resource-sdk|$1|g;
  s/#log-data-model/./;

  s|\.\.\/README.md\b|$specRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md\b|..| if $ARGV =~ /specification.library-guidelines.md/;
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
