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
no_list: true
cascade:
  body_class: otel-docs-spec
  github_repo: &repo $semconvSpecRepoUrl
  github_subdir: docs
  path_base_for_github_subdir: content/en/docs/specs/semconv/
  github_project_repo: *repo
  draft: true
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
  print "---\n";
  if ($title eq 'OpenTelemetry Specification') {
    $title .= " $otelSpecVers";
    $frontMatterFromFile =~ s/(linkTitle:) .*/$1 OTel $otelSpecVers/;
    # TODO: add to spec landing page
    $frontMatterFromFile .= "weight: 10\n" if $frontMatterFromFile !~ /^\s*weight/;
  } elsif ($title eq 'OpenTelemetry Protocol Specification') {
    $frontMatterFromFile =~ s/(title|linkTitle): .*/$& $otlpSpecVers/g;
    # TODO: add to spec landing page
    $frontMatterFromFile .= "weight: 20\n" if $frontMatterFromFile !~ /^\s*weight/;
  } elsif ($title eq 'OpAMP: Open Agent Management Protocol') {
    $frontMatterFromFile = $opampFrontMatter unless $frontMatterFromFile;
  } elsif ($title eq 'OpenTelemetry Semantic Conventions') {
    $frontMatterFromFile = $semconvFrontMatter unless $frontMatterFromFile;
  } elsif ($ARGV =~ /tmp\/semconv\/docs/) {
    $title = toTitleCase($title);
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
    }
  }
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  print "title: $titleMaybeQuoted\n" if $frontMatterFromFile !~ /title: /;
  printf STDOUT ">1 $title -> $linkTitle\n" if $title =~ /Function/;
  if ($title =~ /^OpenTelemetry (Protocol )?(.*)/) {
    $linkTitle = $2;
  } elsif ($title =~ /^(.*?) Semantic Conventions?$/i && !$linkTitle) {
    $linkTitle = $1;
  } elsif ($title =~ /^Semantic Conventions? for (.*)$/i && !$linkTitle) {
    $linkTitle = $1;
  }
  if ($linkTitle =~ /^Function.as.a.Service$/i) {
    $linkTitle = 'FaaS';
  }
  printf STDOUT ">2 $title -> $linkTitle\n" if $title =~ /Function/;
  # TODO: add to front matter of OTel spec file and drop next line:
  $linkTitle = 'Design Goals' if $title eq 'Design Goals for OpenTelemetry Wire Protocol';
  print "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  print "$frontMatterFromFile" if $frontMatterFromFile;
  if ($ARGV =~ /otel\/specification\/(.*?)_index.md$/) {
    print "path_base_for_github_subdir:\n";
    print "  from: $path_base_for_github_subdir/otel/$1_index.md\n";
    print "  to: $1README.md\n";
  } elsif ($ARGV =~ /tmp\/semconv\/docs\/(.*?)_index.md$/) {
    print "path_base_for_github_subdir:\n";
    print "  from: $path_base_for_github_subdir/semconv/$1_index.md\n";
    print "  to: $1README.md\n";
    if ($linkTitle eq 'General') {
      print "weight: -1\n";
    }
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
    $linkTitle = '';
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

  ## Semconv

  if ($ARGV =~ /\/semconv/) {
    s|(\]\()/docs/|$1$specBasePath/semconv/|g;
    s|(\]:\s*)/docs/|$1$specBasePath/semconv/|;

    # TODO: drop once semconv pages are fixed:
    s|(/resource/faas\.md)#function-as-a-service|$1|;
  }

  # SPECIFICATION custom processing

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($specBasePath/otel/)|;
  s|(\]\()/specification/|$1$specBasePath/otel/)|;
  s|\.\./semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;
  s|\.\./specification/(.*?\))|../otel/$1)|g if $ARGV =~ /otel\/specification/;

  if (
    /\((https:\/\/github.com\/open-telemetry\/opentelemetry-specification\/\w+\/\w+\/specification([^\)]*))\)/ &&
    $ARGV !~ /tmp\/(opamp|otlp\/docs)|semantic_conventions/
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

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;
  # TODO: drop once OpAMP spec has been updated
  s|^#+|#$&| if $ARGV =~ /\/opamp/;

  print;
}
