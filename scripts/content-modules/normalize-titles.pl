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
my %versions = qw(
  spec: 1.22.0
  otlp: 1.0.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $seenFirstNonBlankLineBeforeTitle;
my $beforeTitle = '';

sub toTitleCase($) {
    my $str = shift;

    my @mixedCaseWords; # mixed-case or ALLCAPS
    while ($str =~ /\b([a-z]?[A-Z][A-Z0-9]+|[A-Z]\w*[A-Z]\w*)\b/g) {
      push @mixedCaseWords, $1;
    }

    $str =~ s/(\w+)/\u\L$1/g;

    foreach my $word (@mixedCaseWords) {
        my $lc_word = lc($word);
        $str =~ s/\b$lc_word\b/$word/ig;
    }
    $str =~ s/\b(A|And|As|By|For|In|On|\.Js)\b/\L$1/g;
    return $str;
}

my @specialWords = qw(Core); # for .NET

sub toSentenceCase($) {
    my $str = shift;

    my @mixedCaseWords = @specialWords; # mixed-case or ALLCAPS
    while ($str =~ /\b([a-z]?[A-Z][A-Z0-9]+|[A-Z]\w*[A-Z]\w*)\b/g) {
        push @mixedCaseWords, $1;
    }

    $str = lc $str;

    # Replace words with their mixed-case or ALL CAPS versions
    foreach my $word (@mixedCaseWords) {
        my $lc_word = lc($word);
        $str =~ s/\b\Q$lc_word\E\b/$word/g;
    }

    # Capitalize the first letter of the string
    $str =~ s/^(\s*\w)/\u$1/;

    return $str;
}

sub computeTitleAndFrontMatter() {
  my $frontMatter = '';
  if ($frontMatterFromFile) {
    # printf STDOUT "> $file has front matter:\n$frontMatterFromFile\n"; # if $gD;
    $frontMatterFromFile = '' unless $frontMatterFromFile =~ /aliases|cSpell|cascade/i;
    # printf STDOUT "> $file\n" if $ARGV =~ /\/system\b/;
  }
  $linkTitle = $title;

  if ($title =~ /^OpenTelemetry (Protocol )?(.*)/) {
    $linkTitle = $2;
  } elsif ($title =~ /^(.*?) Semantic Conventions?$/i) {
    $linkTitle = toTitleCase($1);
  } elsif ($title =~ /^.*? for (.*)$/i) {
    $linkTitle = toTitleCase($1);
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
  if ($linkTitle =~ /^(.*) Attributes$/i && $title ne 'General Attributes') {
    $linkTitle = $1;
  }

  $linkTitle = 'Attributes' if $title eq 'General Attributes';
  $linkTitle = 'Events' if $linkTitle =~ /Mobile Events/;
  $linkTitle = 'Connect' if $title =~ /Connect RPC$/i;
  $linkTitle = 'HTTP' if $linkTitle =~ /^HTTP Client and Server/i;
  $linkTitle = 'SQL' if $title =~ /SQL Databases$/i;
  $linkTitle = 'System use cases' if $title =~ /System .*?General Use Cases/i;

  # Missing an `s` in "Semantic Convention"?
  if ($title =~ /^Semantic Convention\b/i and $title !~ /Groups$/i) {
    $title =~ s/Semantic Convention\b/$&s/ig;
    printf STDOUT "> $title -> $linkTitle - added 's' to 'Conventions'\n";
  }
  $linkTitle =~ s/^Database Client //;
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

  $linkTitle = '.NET' if $linkTitle =~ /.net common language runtime/i;
  $linkTitle = 'CLI' if $linkTitle =~ /\(command line interface\) programs/i;

  if ($ARGV =~ /non-normative/) {
    $linkTitle =~ s/Semantic Conventions? Stability //i;
  }

  if ($linkTitle and $linkTitle ne $title) {
    $linkTitle = toSentenceCase($linkTitle) unless $linkTitle =~ /^gRPC/;
    if ($frontMatterFromFile =~ /linkTitle: /) {
      $frontMatterFromFile =~ s/^(linkTitle: ).*$/$1$linkTitle/m;
    } else {
      $frontMatter .= "linkTitle: $linkTitle\n"
    }
  }

  $frontMatter .= $frontMatterFromFile if $frontMatterFromFile;

  if ($ARGV =~ /docs\/(.*?)(README|_index).md$/) {
    $frontMatter .= "path_base_for_github_subdir:\n";
    $frontMatter .= "  from: tmp/semconv/docs/$1_index.md\n";
    $frontMatter .= "  to: $1README.md\n";
  }
  $frontMatter .= "weight: -1\n" if $title eq 'General Semantic Conventions';

  return $frontMatter;
}

sub printTitleAndFrontMatter() {
  my $frontMatter;


  # if ($ARGV =~ /docs\/(README|_index)/) {
  #   print STDOUT "> $ARGV\n  > frontMatterFromFile: $frontMatterFromFile\n";
  #   print STDOUT "  > title: $title\n";
  #   print STDOUT "    > linkTitle: $linkTitle\n";
  # }

  if ($frontMatterFromFile && $frontMatterFromFile =~ /auto_gen:\s*false/) {
    $frontMatter = $frontMatterFromFile;
  } else {
    $frontMatter = computeTitleAndFrontMatter();
  }

  if ($frontMatter) {
    $frontMatter = "<!--- Hugo front matter used to generate the website version of this page:\n" . $frontMatter;
    $frontMatter .= "--->\n";
    print "$frontMatter\n";
  }
  print $beforeTitle if $beforeTitle;
  $title = toTitleCase($title);
  print "# $title\n"
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
        while(<>) {
          last if /^--->/;
          $frontMatterFromFile .= $_;
        }
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
