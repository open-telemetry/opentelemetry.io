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
my %patchMsgCount;
my $lineNum;

my %versionsRaw = # Keyname must end with colons because the auto-version update script expects one
  qw(
    spec: 1.41.0
    otlp: 1.5.0
    semconv: 1.30.0
  );
# Versions map without the colon in the keys
my %versions = map { s/://r => $versionsRaw{$_} } keys %versionsRaw;
# Shorthands
my $otelSpecVers = $versions{'spec'};
my $otlpSpecVers = $versions{'otlp'};
my $semconvVers = $versions{'semconv'};

my %versFromSubmod = %versions; # Actual version of submodules. Updated by getVersFromSubmodule().

sub printFrontMatter() {
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
  } elsif ($ARGV =~ /^tmp\/semconv\/docs\/\w+.md$/) {
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

  if ($ARGV =~ m{^tmp/semconv/docs.*/(README|_index)\.md$}
    && applyPatchOrPrintMsgIf('2025-01-29-path-base', 'semconv', '1.30.0-19-g')
    && $frontMatterFromFile =~ /^path_base_for_github_subdir:/m
  ) {
    $frontMatterFromFile =~ s/\npath_base_for_github_subdir:.*?\n/\n/;
    $frontMatterFromFile =~ s|\n  from: tmp/semconv/docs/.*?\n|\n|;
    $frontMatterFromFile =~ s/\n  to: .*README.md($|\n)/$1/;
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

sub applyPatchOrPrintMsgIf($$$) {
  # Returns truthy if patch should be applied, otherwise prints message (once) as to why not.

  my ($patchID, $specName, $targetVers) = @_;
  my $vers;
  my $key = $specName . $patchID;

  return 0 if $patchMsgCount{$key};

  if (($vers = $versions{$specName}) gt $targetVers) {
    print STDOUT "INFO: remove obsolete patch '$patchID' now that spec '$specName' is at v$vers > v$targetVers - $0\n";
  } elsif (($vers = $versFromSubmod{$specName}) gt $targetVers) {
    print STDOUT "INFO [$patchID]: skipping patch '$patchID' since spec '$specName' submodule is at v$vers > v$targetVers - $0\n";
  } else {
    return 'Apply the patch';
  }
  $patchMsgCount{$key}++;
  return 0;
}

sub patchEventAliases() {
  return unless $ARGV =~ /^tmp\/otel\/specification\/logs\//
    && applyPatchOrPrintMsgIf('2025-01-23-event-aliases', 'spec', '1.41.0');

  my $aliases = '^(  - )(event-(api|sdk))$';
  s|$aliases|$1./$2|;
}

sub patchSemConv1_30_0() {
  return unless $ARGV =~ /^tmp\/semconv\/docs\//
    && applyPatchOrPrintMsgIf('2025-01-24-emit-an-event-etc', 'semconv', '1.30.0-18-g');

  s|Emit Event API|Log API|;
  s|(docs/specs/otel/logs/api.md#emit-a)n-event|$1-logrecord|;
  s|\[semantic-convention-groups\]|[group-stability]|;
  s|\Q../../docs/|../|g; # https://github.com/open-telemetry/semantic-conventions/pull/1843
  s|\Qhttps://wikipedia.org/wiki/Where_(SQL)#IN|https://wikipedia.org/wiki/SQL_syntax#Operators|g;
}

sub getVersFromSubmodule() {
  my %repoNames = qw(
    otlp    opentelemetry-proto
    semconv semantic-conventions
    spec    opentelemetry-specification
  );

  foreach my $spec (keys %repoNames) {
    my $directory = $repoNames{$spec};
    my $vers = qx(
      cd content-modules/$directory;
      git describe --tags 2>&1;
    );
    chomp($vers);

    if ($?) {
      warn "WARNING: submodule '$spec': call to 'git describe' failed: '$vers'";
    } else {
      $vers =~ s/v//;
      $versFromSubmod{$spec} = $vers;
    }
  }
}

# main

getVersFromSubmodule();

while(<>) {
  $lineNum++;
  # printf STDOUT "$ARGV Got:$lineNum: $_" if $gD;

  if ($file ne $ARGV) {
    $file = $ARGV;
    $frontMatterFromFile = '';
    $title = '';
    $lineNum = 1;
    if (/^(<!)?--- (# )?Hugo/) {
        while(<>) {
          $lineNum++;
          last if /^--->?/;
          patchEventAliases();
          patchSemConv1_30_0();
          $frontMatterFromFile .= $_;
        }
        next;
    }
  }
  if(! $title) {
    ($title) = /^#\s+(.*)/;
    $linkTitle = '';
    printFrontMatter() if $title;
    next;
  }

  if (/<details>/) {
    while(<>) { $lineNum++; last if /<\/details>/; }
    next;
  }
  if(/<!-- toc -->/) {
    my $tocstop = '<!-- tocstop -->';
    while(<>) {
      $lineNum++;
      last if/$tocstop/;
      next if /^\s*([-\+\*]\s|$)/;
      warn "WARN $ARGV:$lineNum: missing '$tocstop' directive? Aborting toc scan at line:\n  $lineNum: $_";
      print;
      last;
    }
    next;
  }

  ## Semconv

  if ($ARGV =~ /^tmp\/semconv/) {
    s|(\]\()/docs/|$1$specBasePath/semconv/|g;
    s|(\]:\s*)/docs/|$1$specBasePath/semconv/|;

    s|\((/model/.*?)\)|($semconvSpecRepoUrl/tree/v$semconvVers/$1)|g;
  }

  # SPECIFICATION custom processing

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

  patchSemConv1_30_0();

  print;
}
