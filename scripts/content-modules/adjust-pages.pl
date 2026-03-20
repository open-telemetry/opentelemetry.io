#!/usr/bin/perl -w -i
#
# cSpell:ignore oteps submod

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
    spec: 1.55.0
    otlp: 1.10.0
    semconv: 1.40.0
  );
# Versions map without the colon in the keys
my %versions = map { s/://r => $versionsRaw{$_} } keys %versionsRaw;
# Shorthands
my $otelSpecVers = $versions{'spec'};
my $otlpSpecVers = $versions{'otlp'};
my $semconvVers = $versions{'semconv'};

my %versFromSubmod = %versions; # Actual version of submodules. Updated by getVersFromSubmodule().

# =================================================================================
# Patches: data-driven list of spec patches.
# To add a new patch, append an entry to this array:
#
#  {
#    id      => '2026-01-01-some-unique-id',   # unique patch identifier
#    module    => 'semconv',                   # module name: 'spec', 'otlp', 'semconv'
#    minVers => '1.39.0',                      # target version (patch applies at this version)
#    maxVers => '1.40.0',                      # optional upper bound (undef if none)
#    file    => qr|^tmp/semconv/docs/|,        # regex matching file path
#    context => 'body',                        # 'body' (default, operates on $_) or
#                                              # 'frontmatter' (operates on $frontMatterFromFile)
#    apply   => sub { s{old}{new}gx; },        # regex substitution to apply
#  },
# =================================================================================

my @patches = (
  {
    # For the problematic links, see:
    # https://github.com/open-telemetry/opentelemetry-specification/issues/4958
    #
    # Update migration links to new compatibility/migration paths:
    # https://github.com/open-telemetry/opentelemetry-specification/pull/4958
    id      => '2026-03-18-opentracing-migration-links',
    module    => 'spec',
    minVers => '1.55.0',
    maxVers => undef,
    file    => qr|^tmp/otel/specification/compatibility/opentracing\.md$|,
    apply   => sub {
      s{
        (https://opentelemetry\.io/docs)/migration/(opentracing/)
      }{$1/compatibility/migration/$2}gx;
    },
  },
);

sub applyPatches($) {
  my ($context) = @_;
  for my $patch (@patches) {
    next unless ($patch->{context} // 'body') eq $context;
    next unless $ARGV =~ $patch->{file};
    next unless applyPatchOrPrintMsgIf(
      $patch->{id}, $patch->{module}, $patch->{minVers}, $patch->{maxVers}
    );
    if ($context eq 'frontmatter') {
      local $_ = $frontMatterFromFile;
      $patch->{apply}->();
      $frontMatterFromFile = $_;
    } else {
      $patch->{apply}->();
    }
  }
}

sub _parseSemver($) {
  my ($v) = @_;
  $v =~ s/^v//;
  if ($v =~ /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/) {
    my ($maj, $min, $pat, $suffix) = ($1, $2, $3, $4);
    if (!defined $suffix) {
      return ($maj, $min, $pat, 0, 0);              # clean release
    } elsif ($suffix =~ /^(\d+)-g[0-9a-f]+$/) {
      return ($maj, $min, $pat, 1, $1);              # git describe: N-gHASH
    } elsif ($suffix =~ /^(\d+)$/) {
      return ($maj, $min, $pat, 1, $1);              # partial git describe: N
    } else {
      return ($maj, $min, $pat, -1, 0);              # pre-release (e.g., -dev, -rc1)
    }
  }
  warn "WARNING: cannot parse version '$v'";
  return (0, 0, 0, 0, 0);
}

sub semverCmp($$) {
  # Compare two version strings numerically. Returns -1, 0, or 1.
  # Handles: X.Y.Z, X.Y.Z-pre-release, X.Y.Z-N-gHASH (git describe).
  # For the same X.Y.Z: pre-release < release < git-describe.
  my ($a, $b) = @_;
  my @ap = _parseSemver($a);
  my @bp = _parseSemver($b);
  for my $i (0..4) {
    return $ap[$i] <=> $bp[$i] if $ap[$i] != $bp[$i];
  }
  return 0;
}

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

  applyPatches('frontmatter');

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

my %_gitmodulesCache;
my $_gitmodulesCacheLoaded;

sub getVersFromGitmodules($) {
  # Returns the pinned version of the submodule $specName from .gitmodules, or undef if not found.
  # Results are cached since .gitmodules doesn't change during script execution.
  my ($specName) = @_;

  if (!$_gitmodulesCacheLoaded) {
    $_gitmodulesCacheLoaded = 1;
    if (open(my $fh, '<', '.gitmodules')) {
      while (my $line = <$fh>) {
        if ($line =~ /^\s*(\w+)-pin\s*=\s*(.+)/) {
          my $vers = $2;
          chomp($vers);
          $vers =~ s/^v//;
          $_gitmodulesCache{$1} = $vers;
        }
      }
      close($fh);
    }
  }
  return $_gitmodulesCache{$specName};
}

sub applyPatchOrPrintMsgIf($$$;$) {
  # Returns truthy if patch should be applied, otherwise prints message (once) as to why not.
  # The patch is applied if $submoduleVers starts with $targetVers and is <= $maxVers (if provided).

  my ($patchID, $specName, $targetVers, $maxVers) = @_;
  my $vers = $versions{$specName};
  my $submoduleVers = getVersFromGitmodules($specName);
  my $key = $specName . $patchID;

  return 0 if $patchMsgCount{$key} && $patchMsgCount{$key} ne 'Apply the patch';

  if ($maxVers && $submoduleVers && semverCmp($submoduleVers, $maxVers) > 0) {
    print STDOUT "INFO: $0: skipping patch '$patchID' since spec '$specName' " .
      "submodule is at version '$submoduleVers' > '$maxVers' (patch max version); " .
      "the fix is likely in upstream now\n" unless $patchMsgCount{$key};
    $patchMsgCount{$key}++;
    return 0;
  }

  if ($submoduleVers && $submoduleVers =~ /^\Q$targetVers\E/) {
    print STDOUT "INFO: $0: applying patch '$patchID' since spec '$specName' " .
      "submodule is at version '$submoduleVers', and it starts with the patch target '$targetVers'" .
      "\n" unless $patchMsgCount{$key};
    return $patchMsgCount{$key} = 'Apply the patch';
  } elsif (($maxVers && semverCmp($vers, $maxVers) > 0) || semverCmp($vers, $targetVers) >= 0) {
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

  s|\.\./((?:examples/)?README\.md)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /^tmp\/otlp/;

  applyPatches('body');

  # Make website-local page references local:
  s|https://opentelemetry.io/|/|g;

  ## OTLP proto files: link into the repo:
  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /\btmp\/otlp/;

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;

  print;
}
