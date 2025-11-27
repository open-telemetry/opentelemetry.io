#!/usr/bin/perl -w -i
#
# cSpell:ignore oteps

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
    spec: 1.51.0
    otlp: 1.9.0
    semconv: 1.38.0
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

sub getVersFromGitmodules($) {
  # Returns the pinned version of the submodule $specName from .gitmodules, or undef if not found.
  my ($specName) = @_;
  my $pinKey = "$specName-pin";

  open(my $fh, '<', '.gitmodules') or return undef;
  my $vers;

  while (my $line = <$fh>) {
    if ($line =~ /^\s*$pinKey\s*=\s*(.+)/) {
      $vers = $1;
      chomp($vers);
      $vers =~ s/^v//;  # Remove leading v
      last;
    }
  }
  close($fh);
  return $vers;
}

sub applyPatchOrPrintMsgIf($$$) {
  # Returns truthy if patch should be applied, otherwise prints message (once) as to why not.
  # The patch is applied if $submoduleVers starts with $targetVers.

  my ($patchID, $specName, $targetVers) = @_;
  my $vers = $versions{$specName};
  my $submoduleVers = getVersFromGitmodules($specName);
  my $key = $specName . $patchID;

  return 0 if $patchMsgCount{$key} && $patchMsgCount{$key} ne 'Apply the patch';

  if ($submoduleVers && $submoduleVers =~ /^$targetVers/) {
    print STDOUT "INFO: $0: applying patch '$patchID' since spec '$specName' " .
      "submodule is at version '$submoduleVers', and it starts with the patch target '$targetVers'" .
      "\n" unless $patchMsgCount{$key};
    return $patchMsgCount{$key} = 'Apply the patch';
  } elsif ($vers ge $targetVers) {
    print STDOUT "INFO: $0: patch '$patchID' is probably obsolete now that " .
      "spec '$specName' is at version '$vers' >= '$targetVers' (patch target version); " .
      "if so, remove the patch\n";
  } else {
    print STDOUT "INFO: $0: skipping patch '$patchID' since spec '$specName' " .
      "submodule is at version '$vers' < '$targetVers' (patch target version); " .
      "and submodule version '$submoduleVers' doesn't start with the patch target '$targetVers'\n";
  }
  $patchMsgCount{$key}++;
  return 0;
}

# =================================================================================
# KEEP THE FOLLOWING AS A TEMPLATE; copy it and modify it as needed.
# =================================================================================
sub patchSpec_because_of_SemConv_DockerAPIVersions_AsTemplate() {
  return unless
    # Restrict the patch to the proper spec, and section or file:
    $ARGV =~ m|^tmp/semconv/docs/|
    &&
    # Call helper function that will cause the function to return early if the
    # patch should not be applied. The patch is applied if the submodule version
    # (from .gitmodules) starts with the target version (arg 3). The first
    # argument is a unique id that will be printed if the patch is outdated.
    # Otherwise, if the patch is still relevant we fall through to the body of
    # this patch function.
    #
    # Specify the target version as, e.g., '1.38.0', or to apply only to dev
    # versions, use '1.38.0-' with a trailing hyphen.
    applyPatchOrPrintMsgIf('2025-11-21-docker-api-versions', 'semconv', '1.38.0');

  # Give infor about the patch:
  #
  # For the problematic links, see:
  # https://github.com/open-telemetry/semantic-conventions/issues/3103
  #
  # Replace older Docker API versions with the latest one like in:
  # https://github.com/open-telemetry/semantic-conventions/pull/3093

  # This is the actual regex-based patch code:
  s{
    (https://docs.docker.com/reference/api/engine/version)/v1.(43|51)/(\#tag/)
  }{$1/v1.52/$3}gx;
}

sub patchSpec_because_of_SemConv_DockerAPIVersions() {
  return unless
    # Restrict the patch to the proper spec, and section or file:
    $ARGV =~ m|^tmp/semconv/docs/|
    &&
    # Call helper function that will cause the function to return early if the
    # patch should not be applied. See patch template above for details.
    applyPatchOrPrintMsgIf('2025-11-21-docker-api-versions', 'semconv', '1.38.0');

  # Give infor about the patch:
  #
  # For the problematic links, see:
  # https://github.com/open-telemetry/semantic-conventions/issues/3103
  #
  # Replace older Docker API versions with the latest one like in:
  # https://github.com/open-telemetry/semantic-conventions/pull/3093

  # This is the actual regex-based patch code:
  s{
    (https://docs.docker.com/reference/api/engine/version)/v1.(43|51)/(\#tag/)
  }{$1/v1.52/$3}gx;
}

sub patchSpec_because_of_SemConv_DatabaseRenamedToDb() {
  return unless
    # Restrict the patch to the proper spec, and section or file:
    # Note that here we replace links into semconv from the spec
    $ARGV =~ m|^tmp/otel/specification/|
      && applyPatchOrPrintMsgIf('2025-11-26-database-section-renamed-to-db', 'semconv', '1.38.0-');

  # Give infor about the patch, see:
  # https://github.com/open-telemetry/opentelemetry.io/pull/8311#issue-3577941378

  s|(/semconv)/database(/database-)|$1/db$2|g;
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
    # Did the previous file not have a title?
    warn "WARN: $file: no level 1 heading found, so no page will be generated"
      if $file && $lineNum && ! $title;
    $file = $ARGV;
    $frontMatterFromFile = '';
    $title = '';
    $lineNum = 1;
    # Skip single-line markdownlint directives at top of file. Added to handle
    # https://github.com/open-telemetry/opentelemetry.io/issues/7750
    if (/^<!--\s*markdownlint.*-->\s*$/) {
      $_ = <>;
    }
    # Extract Hugo front matter encoded as a comment:
    if (/^(<!)?--- (# )?Hugo/) {
        while(<>) {
          $lineNum++;
          last if /^--->?/;
          $frontMatterFromFile .= $_;
        }
        next;
    }
  }
  if (! $title) {
    ($title) = /^#\s+(.*)/;
    $linkTitle = '';
    printFrontMatter() if $title;
    next;
  }

  if (/<details>/) {
    while(<>) { $lineNum++; last if /<\/details>/; }
    next;
  }
  if (/<!-- toc -->/) {
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

    patchSpec_because_of_SemConv_DockerAPIVersions();
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
  s{
    (\.\.\/)+
    (
      (?:oteps|supplementary-guidelines)\/
      [^)]+
    )
  }{$otelSpecRepoUrl/tree/v$otelSpecVers/$2}gx;

  patchSpec_because_of_SemConv_DatabaseRenamedToDb();

  s|\.\./((?:examples/)?README\.md)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /^tmp\/otlp/;

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  ## OTLP proto files: link into the repo:
  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /\btmp\/otlp/;

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;

  print;
}
