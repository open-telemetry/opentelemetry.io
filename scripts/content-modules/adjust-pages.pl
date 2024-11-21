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
my %versions = qw(
  spec: 1.39.0
  otlp: 1.4.0
  semconv: 1.28.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $semconvVers = $versions{'semconv:'};
my $patchMsg2 = 0; # TODO remove along with patch-message 002

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
  } elsif ($ARGV =~ /semconv\/docs\/_index.md$/) {
    $title .= " $semconvVers";
    $frontMatterFromFile =~ s/linkTitle: .*/$& $semconvVers/;
    # $frontMatterFromFile =~ s/body_class: .*/$& td-page--draft/;
    # $frontMatterFromFile =~ s/cascade:\n/$&  draft: true\n/;
  } elsif ($ARGV =~ /otel\/specification\/logs\/api.md$/) {
    if ($otelSpecVers ne "1.39.0") {
      # TODO: delete the enclosing elsif body
      print STDOUT "INFO [001]: $0: remove obsolete code now that OTel spec has been updated.\n"
    }
    $frontMatterFromFile .= "linkTitle: API\naliases: [bridge-api]\n";
  }
  my $titleMaybeQuoted = ($title =~ ':') ? "\"$title\"" : $title;
  print "title: $titleMaybeQuoted\n" if $frontMatterFromFile !~ /title: /;
  if ($title =~ /^OpenTelemetry (Protocol )?(.*)/) {
    $linkTitle = $2;
  }
  # TODO: add to front matter of OTel spec file and drop next line:
  $linkTitle = 'Design Goals' if $title eq 'Design Goals for OpenTelemetry Wire Protocol';

  # printf STDOUT "> $title -> $linkTitle\n";
  print "linkTitle: $linkTitle\n" if $linkTitle and $frontMatterFromFile !~ /linkTitle: /;
  print "$frontMatterFromFile" if $frontMatterFromFile;
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

    s|\((/model/.*?)\)|($semconvSpecRepoUrl/tree/v$semconvVers/$1)|g;

    # TODO: drop after fix of https://github.com/open-telemetry/semantic-conventions/pull/1316
    s|#instrument-advice\b|#instrument-advisory-parameters|g;

    # TODO: drop after fix of https://github.com/open-telemetry/semantic-conventions/issues/1313
    s|(/database/database-spans\.md)#batch-operations|$1|g;
    s|(/messaging/messaging-spans\.md)#common-messaging-operations|$1|g;
  }


  # SPECIFICATION custom processing

  # TODO: drop the entire if statement patch code when OTel spec vers contains
  # https://github.com/open-telemetry/opentelemetry-specification/pull/4287,
  # which should be vers > 1.39.0.
  if ($ARGV =~ /otel\/spec/) {
    s|(/api\.md)#logs-api\b|$1|g;
    print STDOUT "INFO [002]: $0: remove obsolete patch code now that OTel spec has been updated.\n"
      if $otelSpecVers ne "1.39.0" && !$patchMsg2++
  }

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($specBasePath/otel/)|;
  s|(\]\()/specification/|$1$specBasePath/otel/)|;
  s|\.\./semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;
  s|\.\./specification/(.*?\))|../otel/$1)|g if $ARGV =~ /otel\/specification/;

  # Match markdown inline links or link definitions to OTel spec pages: "[...](URL)" or "[...]: URL"
  s|(\]:\s+\|\()https://github.com/open-telemetry/opentelemetry-specification/\w+/(main\|v$otelSpecVers)/specification(.*?\)?)|$1$specBasePath/otel$3|;

  # Match links to OTLP
  s|(\]:\s+\|\()?https://github.com/open-telemetry/opentelemetry-proto/(\w+/.*?/)?docs/specification.md(\)?)|$1$specBasePath/otlp/$3|g;
  s|github.com/open-telemetry/opentelemetry-proto/docs/specification.md|OTLP|g;

  # Localize links to semconv
  s|(\]:\s+\|\()https://github.com/open-telemetry/semantic-conventions/\w+/(main\|v$semconvVers)/docs(.*?\)?)|$1$specBasePath/semconv$3|g;

  # Images
  s|(\.\./)?internal(/img/[-\w]+\.png)|$2|g;
  s|(\]\()(img/.*?\))|$1../$2|g if $ARGV !~ /(logs|schemas)._index/ && $ARGV !~ /otlp\/docs/;
  s|(\]\()([^)]+\.png\))|$1../$2|g if $ARGV =~ /\btmp\/semconv\/docs\/general\/attributes/;
  s|(\]\()([^)]+\.png\))|$1../$2|g if $ARGV =~ /\btmp\/semconv\/docs\/http\/http-spans/;

  s|\.\.\/README.md\b|$otelSpecRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md\b|..| if $ARGV =~ /specification.library-guidelines.md/;

  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /\btmp\/otlp/;
  s|\.\./README.md\b|$otlpSpecRepoUrl/|g if $ARGV =~ /\btmp\/otlp/;
  s|\.\./examples/README.md\b|$otlpSpecRepoUrl/tree/v$otlpSpecVers/examples/|g if $ARGV =~ /\btmp\/otlp/;

  s|\bREADME.md\b|_index.md|g if $ARGV !~ /otel\/specification\/protocol\/_index.md/;

  # Rewrite paths that are outside of the main spec folder as external links
  s|(\.\.\/)+(experimental\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;
  s|(\.\.\/)+(supplementary-guidelines\/compatibility\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;

  # Rewrite inline links
  if ($ARGV =~ /\btmp\/opamp/) {
    s|\]\(([^:\)]*?)\.md((#.*?)?)\)|]($1/$2)|g;
  } else {
    s|\]\(([^:\)]*?\.md(#.*?)?)\)|]({{% relref "$1" %}})|g;
  }

  # Rewrite link defs to local pages such as the following:
  #
  # [specification]: overview.md
  # [faas]: some-path/faas-spans.md (FaaS trace conventions)
  #
  # The subregex `[:\s]+` excludes external URLs (because they contain a colon after the protocol)
  s|^(\[[^\]]+\]:\s*)([^:\s]+)(\s*(\(.*\))?)$|$1\{{% relref "$2" %}}$3|g;

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;

  print;
}
