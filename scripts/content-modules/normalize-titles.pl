#!/usr/bin/perl -w -i
#
# DRAFT script used to normalize semconv doc-page tiles and add Hugo front matter

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
my %versions = qw(
  spec: 1.22.0
  otlp: 1.0.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $seenFirstNonBlankLineBeforeTitle;
my $beforeTitle = '';

sub toTitleCase($) {
    my ($str) = @_;

    # Capitalize non-mixedcase words
    $str =~ s/(^|\s)([a-zA-Z])([a-z][a-z0-9]*)\b/$1\u$2$3/g;

    # Revert / lowercase articles etc.
    $str =~ s/\b(A|And|As|By|For|In|On)\b/\L$1/g;

    return $str;
}

my $properNames = <<'EON';
  .NET Core
  AI Inference
  AWS Lambda
  Azure
  Cassandra
  Cloud Run
  Common Language Runtime
  Compute Engine
  Connect RPC
  Cosmos
  Elasticsearch
  Go
  Google
  Google Cloud
  Kafka
  Kestrel
  Kubernetes
  Microsoft
  Node.js
  Pub/Sub
  Redis
EON

my @properNames =
  grep { /\S/ } # drop blank lines
    map { s/^\s+|\s+$//gr } # trim whitespace
      split(/\n/, $properNames);

sub toSentenceCase($) {
    my ($str) = @_;

    # Lowercase non-mixedcase words
    $str =~ s/\b([A-Z]?[a-z][a-z0-9]*)\b/\l$1/g;

    # Capitalize the first word unless it is mixed case
    $str =~ s/^([a-z][a-z0-9]*)\b/\u$1/;

    # Handle exceptions
    for my $name (@properNames) {
        $str =~ s/\b\Q$name\E\b/$name/gi;
    }
    $str =~ s/Function(.)as.a.Service/Function$1as$1a$1Service/i;

    return $str;
}

sub computeTitleAndFrontMatter() {
  my $frontMatter = '';
  if ($frontMatterFromFile) {
    # printf STDOUT "> $file has front matter:\n$frontMatterFromFile\n"; # if $gD;
    $frontMatterFromFile = '' unless $frontMatterFromFile =~ /auto_gen|aliases/i;
    # printf STDOUT "> $file\n" if $ARGV =~ /\/system\b/;
  }
  $linkTitle = $title;

  if ($title =~ /^OpenTelemetry (Protocol )?(.*)/) {
    $linkTitle = $2;
  } elsif ($title =~ /^(.*?) Semantic Conventions?$/i) {
    $linkTitle = $1; # toTitleCase($1);
  } elsif ($title =~ /^.*? for (.*)$/i) {
    $linkTitle = $1; # toTitleCase($1);
  }
  if ($linkTitle =~ /^Function.as.a.Service$/i) {
    $linkTitle = 'FaaS';
  }
  $linkTitle = 'Database' if $title =~ /Database Calls and Systems$/i;
  if ($linkTitle =~ /^(?:FaaS|HTTP) (.*)$/i && $ARGV !~ /dotnet|migration/) {
    $linkTitle = $1;
  } elsif ($linkTitle =~ /^Microsoft (?:Azure)? (.*)$/i) {
    $linkTitle = $1;
  } elsif ($linkTitle =~ /^RPC (.*)$/i) {
    $linkTitle = $1;
  } elsif ($linkTitle =~ /^(Exceptions|Feature Flags) .. (.*)$/i) {
    $linkTitle = $2;
  }

  $linkTitle = 'Events' if $linkTitle =~ /Mobile Events/i;
  $linkTitle = 'Connect' if $title =~ /Connect RPC$/i;
  $linkTitle = 'HTTP' if $linkTitle =~ /^HTTP Client and Server/i;
  $linkTitle = 'SQL' if $title =~ /SQL Databases$/i;
  $linkTitle = 'System use cases' if $title =~ /System .*?General Use Cases/i;
  $linkTitle = $1 if $title =~ /Gen(?:erative) ?AI (\w+)$/i && $title !~ /Systems$/i;
  $linkTitle = $1 if $title =~ /(OpenAI) \w+$/i;

  # Missing an `s` in "Semantic convention"?
  if ($title =~ /^Semantic convention\b/i and $title !~ /Groups$/i) {
    $title =~ s/Semantic convention\b/$&s/ig;
    printf STDOUT "> $title -> $linkTitle - added 's' to 'Conventions'\n";
  }
  $linkTitle =~ s/^(Database|Messaging) Client //i;
  if ($ARGV =~ /docs\/azure/) {
    $linkTitle =~ s/ Resource Logs?//i;
    $linkTitle =~ s/Azure //i;
  } elsif ($ARGV =~ /docs\/messaging\/[^R]/) {
    $linkTitle =~ s/( messaging|messaging )//i;
  }

  $linkTitle =~ s/^General //i; # if $ARGV =~ /docs\/general/
  $linkTitle =~ s/( (runtime|(web )?server))? metrics( emitted by .*)?$//i
    unless $ARGV =~ /gen-ai-metrics/;
  $linkTitle =~ s/ (components|guide|queries|supplementary information|systems|platform)$//i;
  $linkTitle =~ s/ \(command line interface\)//i;
  $linkTitle =~ s/ (attributes|resources)$//i;
  $linkTitle =~ s/(Process) and process runtime$/$1/i;

  $linkTitle = '.NET' if $linkTitle =~ /.net common language runtime/i;
  $linkTitle = 'CLI' if $linkTitle =~ /\(command line interface\) programs/i;

  if ($ARGV =~ /non-normative/) {
    $linkTitle =~ s/Semantic Conventions? Stability //i;
  }

  $frontMatter .= $frontMatterFromFile if $frontMatterFromFile;

  $linkTitle = toSentenceCase($linkTitle);
  if ($linkTitle) {
    if ($frontMatter !~ /linkTitle: / && $linkTitle ne $title) {
      $frontMatter .= "linkTitle: $linkTitle\n";
    } elsif ($frontMatter !~ /^auto_gen:/m) {
      $frontMatter =~ s/^(linkTitle: ).*$/$1$linkTitle/m;
    }
  }

  # if ($ARGV =~ /docs\/(.*?)(README|_index).md$/) {
  #   $frontMatter .= "path_base_for_github_subdir:\n";
  #   $frontMatter .= "  from: tmp/semconv/docs/$1_index.md\n";
  #   $frontMatter .= "  to: $1README.md\n";
  # }

  return $frontMatter;
}

sub printTitleAndFrontMatter() {
  my $frontMatter = computeTitleAndFrontMatter();

  if ($frontMatter) {
    $frontMatter = "<!--- Hugo front matter used to generate the website version of this page:\n" . $frontMatter;
    $frontMatter .= "--->\n";
    print "$frontMatter\n";
  }

  print $beforeTitle if $beforeTitle;
  $title = toSentenceCase($title);
  print "# $title\n"
}

sub gatherFrontMatter() {
  my $autoGenValues = 'false|below';
  my $autoGenDirective = '';
  my $autoGenSkip = 0;

  while(<>) {
    last if /^--->/;
    next if $autoGenSkip;

    my ($keyWord, $autoGenDirective) = /^(auto.?gen): ([^\#]+)/;
    if ($keyWord) {
      # print STDOUT ">> $ARGV:\n$frontMatterFromFile";
      if ($keyWord ne 'auto_gen') {
        warn "$ARGV: WARN: misspelled keyword, should be 'auto_gen' not '$keyWord'\n";
      } elsif (!$autoGenDirective or $autoGenDirective !~ /^($autoGenValues)/) {
        warn "$ARGV: WARN: missing or unrecognized 'auto_gen' value, should match '$autoGenValues', not $autoGenDirective\n";
      } elsif ($autoGenDirective =~ /^below/) {
        $autoGenSkip = 1;
        # print STDOUT ">>>> skipping\n";
      } else {
        # print STDOUT ">> wa?\n";
      }
    }

    $frontMatterFromFile .= $_;
  }
}

# main

my $titleRegexStr = '^#\s+(.*)';

while(<>) {
  # printf STDOUT "$ARGV Got: $_" if $gD;

  if ($file ne $ARGV) {
    $file = $ARGV;
    # printf STDOUT "> $file\n"; # if $gD;
    $seenFirstNonBlankLineBeforeTitle = 0;
    $frontMatterFromFile = '';
    $title = '';
    $beforeTitle = '';
    $linkTitle = '';
    if (/^<!--- Hugo/) {
        gatherFrontMatter();
        next;
    }
  }

  if ($title) {
    print;
  } elsif (/^\s*$/ && !$seenFirstNonBlankLineBeforeTitle) {
    next; # Drop blank lines until we see a title
  } elsif (($title) = /$titleRegexStr/) {
    printTitleAndFrontMatter();
  } else {
    $seenFirstNonBlankLineBeforeTitle = 1;
    $beforeTitle .= $_;
  }
}
