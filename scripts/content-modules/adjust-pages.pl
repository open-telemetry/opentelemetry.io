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
  spec: 1.41.0
  otlp: 1.5.0
  semconv: 1.29.0
);
my %versFromRepo = %versions; # Use declared versions a defaults
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $semconvVers = $versions{'semconv:'};
my %patchMsgCount;

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
  }
  # Sample front-matter patch:
  #
  # } elsif ($ARGV =~ /otel\/specification\/logs\/api.md$/) {
  #   $frontMatterFromFile .= "linkTitle: API\naliases: [bridge-api]\n" if
  #     applyPatchOrPrintMsgIf('2024-12-01-bridge-api', 'spec', '1.39.0');
  # }

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

sub applyPatchOrPrintMsgIf($$$) {
  # Returns truthy if patch should be applied, otherwise prints message (once) as to why not.

  my ($patchID, $versKey_, $targetVers) = @_;
  my $versKey = $versKey_ . ':';
  my $vers;

  return 0 if $patchMsgCount{$patchID};

  if (($vers = $versions{$versKey}) ne $targetVers) {
    print STDOUT "INFO: remove obsolete patch '$patchID' now that spec '$versKey_' is at v$vers, not v$targetVers - $0\n";
  } elsif (($vers = $versFromRepo{$versKey}) ne $targetVers) {
    print STDOUT "INFO [$patchID]: skipping patch '$patchID' since spec '$versKey_' submodule is at v$vers not v$targetVers - $0\n";
  } else {
    return 'Apply the patch';
  }
  $patchMsgCount{$patchID}++;
  return 0;
}

sub patchAttrNaming() {
  return unless $ARGV =~ /^tmp\/otel\/specification/
    && applyPatchOrPrintMsgIf('2025-01-22-attribute-naming', 'semconv', '1.29.0');

  my $semconv_attr_naming = '(/docs/specs/semconv/general)/naming/';
  s|$semconv_attr_naming|$1/attribute-naming/|g if /$semconv_attr_naming/;
}

sub getVersFromRepo() {
  my $vers = qx(
    cd content-modules/semantic-conventions;
    git describe --tags 2>&1;
  );
  chomp($vers);

  if ($?) {
    warn "WARNING: semconv repo: call to 'git describe' failed: '$vers'";
  } else {
    $vers =~ s/v//;
    $versFromRepo{'semconv:'} = $vers;
  }
}

# main

getVersFromRepo();

while(<>) {
  # printf STDOUT "$ARGV Got: $_" if $gD;

  if ($file ne $ARGV) {
    $file = $ARGV;
    $frontMatterFromFile = '';
    $title = '';
    if (/^<!---? Hugo/) {
        while(<>) {
          last if /^-?-->/;
          patchAttrNaming(); # TEMPORARY patch
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

  if ($ARGV =~ /^tmp\/semconv/) {
    if (applyPatchOrPrintMsgIf('2025-01-22-event-(api|sdk)', 'semconv', '1.29.0')) {
      # Cf. https://github.com/open-telemetry/opentelemetry-specification/pull/4359
      my $otel_spec_event_deprecation = '(opentelemetry-specification/blob/main/specification/logs)/event-(api|sdk).md';
      s|$otel_spec_event_deprecation\b|$1/|g if /$otel_spec_event_deprecation/;
    }

    s|(\]\()/docs/|$1$specBasePath/semconv/|g;
    s|(\]:\s*)/docs/|$1$specBasePath/semconv/|;

    s|\((/model/.*?)\)|($semconvSpecRepoUrl/tree/v$semconvVers/$1)|g;
  }


  # SPECIFICATION custom processing

  if ($ARGV =~ /^tmp\/otel\/specification/ && applyPatchOrPrintMsgIf('2025-01-22-attribute-naming.md', 'semconv', '1.29.0')) {
    my $semconv_attr_naming_md = '(semantic-conventions/blob/main/docs/general)/naming.md(#\w+)?';
    s|$semconv_attr_naming_md\b|$1/attribute-naming.md|g if /$semconv_attr_naming_md/;
  }

  patchAttrNaming(); # TEMPORARY patch

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($specBasePath/otel/)|;
  s|(\]\()/specification/|$1$specBasePath/otel/)|;
  s|\.\./specification/(.*?\))|../otel/$1|g if $ARGV =~ /otel\/specification/;

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

  # Rewrite paths that are outside of the spec folders as external links:
  s|\.\.\/README.md|$otelSpecRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md|/docs/specs/otel/| if $ARGV =~ /specification\/library-guidelines.md/;

  s|(\.\.\/)+(experimental\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;
  s|(\.\.\/)+(supplementary-guidelines\/compatibility\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;

  s|\.\./((?:examples/)?README\.md)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /^tmp\/otlp/;

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  ## OTLP proto files: link into the repo:
  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /\btmp\/otlp/;

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;

  print;
}
