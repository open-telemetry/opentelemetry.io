#!/usr/bin/perl -w -i
#
# DRAFT script used to normalize semconv doc-page tiles and add Hugo front matter
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

# TODO: remove once OpAMP spec has been updated
my $opampFrontMatter = << "EOS";
title: Open Agent Management Protocol
linkTitle: OpAMP
body_class: otel-docs-spec
github_repo: &repo $opAmpSpecRepoUrl
github_project_repo: *repo
path_base_for_github_subdir:
  from: content/en/docs/specs/opamp/index.md
  to: specification.md
EOS

# TODO: remove once Semconv spec has been updated
my $semconvFrontMatter = << "EOS";
linkTitle: Semantic Conventions
# no_list: true
cascade:
  body_class: otel-docs-spec
  github_repo: &repo $semconvSpecRepoUrl
  github_subdir: docs
  path_base_for_github_subdir: content/en/docs/specs/semconv/
  github_project_repo: *repo
EOS

# Adjust semconv title capitalization
sub toTitleCase($) {
    my $str = shift;
    my @specialCaseWords = qw(
        CloudEvents
        CouchDB
        DynamoDB
        FaaS
        GraphQL
        gRPC
        HBase
        MongoDB
        OpenTelemetry
        RabbitMQ
        RocketMQ
    );
    my %specialCases = map { lc($_) => $_ } @specialCaseWords;
    while ($str =~ /(\b[A-Z]+\b)/g) {
        $specialCases{lc $1} = $1;
    }
    $str =~ s/(\w+)/\u\L$1/g;
    while (my ($key, $value) = each %specialCases) {
        $str =~ s/\b\u\L$key\b/$value/g;
    }
    $str =~ s/\b(A|And|As|For|In|On)\b/\L$1/g;
    return $str;
}

sub printTitleAndFrontMatter() {
  my $frontMatter = '';
  my $originalTitle = $title;
  if ($frontMatterFromFile) {
    # printf STDOUT "> $file has front matter:\n$frontMatterFromFile\n"; # if $gD;
    $frontMatterFromFile = '' unless $ARGV =~ /\/system\/[^R]/;
    # printf STDOUT "> $file\n" if $ARGV =~ /\/system\b/;
  }
  if ($title eq 'OpenTelemetry Semantic Conventions') {
    $frontMatterFromFile = $semconvFrontMatter unless $frontMatterFromFile;
  } elsif ($ARGV =~ /json-rpc/) {
    $title = 'Semantic Conventions for JSON-RPC';
  }
  $title = toTitleCase($title);
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  # $frontMatter .= "title: $titleMaybeQuoted\n" if $frontMatterFromFile !~ /title: /;
  if ($title =~ /^OpenTelemetry (Protocol )?(.*)/) {
    $linkTitle = $2;
  } elsif ($title =~ /^(.*?) Semantic Conventions?$/i) {
    $linkTitle = toTitleCase($1);
  } elsif ($title =~ /^Semantic Conventions? for (.*)$/i) {
    $linkTitle = toTitleCase($1);
  }
  if ($linkTitle =~ /^Function.as.a.Service$/i) {
    $linkTitle = 'FaaS';
  }
  $linkTitle = 'Database' if $title =~ /Database Calls and Systems$/i;
  if ($linkTitle =~ /^Database (.*)$/i) {
    $linkTitle = "$1";
  } elsif ($linkTitle =~ /^FaaS (.*)$/i) {
    $linkTitle = "$1";
  } elsif ($linkTitle =~ /^HTTP (.*)$/i) {
    $linkTitle = "$1";
  } elsif ($linkTitle =~ /^Microsoft (.*)$/i) {
    $linkTitle = "$1";
  } elsif ($linkTitle =~ /^RPC (.*)$/i) {
    $linkTitle = "$1";
  } elsif ($linkTitle =~ /^(Exceptions|Feature Flags) .. (.*)$/i) {
    $linkTitle = "$2";
  }
  if ($linkTitle =~ /^(.*) Attributes$/i && $title ne 'General Attributes') {
    $linkTitle = "$1";
  }
  $linkTitle = 'Attributes' if $title eq 'General Attributes';
  $linkTitle = 'Events' if $linkTitle eq 'Event';
  $linkTitle = 'Logs' if $title =~ /Logs Attributes$/;
  $linkTitle = 'Connect' if $title =~ /Connect RPC$/;
  $linkTitle = 'SQL' if $title =~ /SQL Databases$/;
  $title = 'Semantic Conventions for Function-as-a-Service' if $title eq 'Semantic Conventions for FaaS';
  $linkTitle = 'Tracing Compatibility' if $linkTitle eq 'Tracing Compatibility Components';
  if ($title =~ /Semantic Convention\b/) {
    $title =~ s/Semantic Convention\b/$&s/g;
    printf STDOUT "> $title -> $linkTitle\n";
  }

  $frontMatter .= "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  $frontMatter .= $frontMatterFromFile if $frontMatterFromFile;
  if ($ARGV =~ /docs\/(.*?)README.md$/) {
    $frontMatter .= "path_base_for_github_subdir:\n";
    $frontMatter .= "  from: $path_base_for_github_subdir/semconv/$1_index.md\n";
    $frontMatter .= "  to: $1README.md\n";
  }
  $frontMatter .= "weight: -1\n" if $title eq 'General Semantic Conventions';
  if ($frontMatter) {
    $frontMatter = "<!--- Hugo front matter used to generate the website version of this page:\n" . $frontMatter;
    $frontMatter .= "--->\n";
    print "$frontMatter\n";
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
