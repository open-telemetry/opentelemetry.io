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
  spec: 1.40.0
  otlp: 1.5.0
  semconv: 1.29.0
);
my $otelSpecVers = $versions{'spec:'};
my $otlpSpecVers = $versions{'otlp:'};
my $semconvVers = $versions{'semconv:'};
my %patchMsgCount;
my $openRelref = '{{% relref';

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
  #   $frontMatterFromFile .= "linkTitle: API\naliases: [bridge-api]\n";
  #   printPatchInfoIf("2024-12-01-bridge-api", $otelSpecVers ne "1.39.0");
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

sub printPatchInfoIf($$) {
  my ($patchID, $specVersTest) = @_;
  print STDOUT "INFO [$patchID]: $0: remove obsolete patch code now that OTel spec has been updated.\n"
    if $specVersTest && !$patchMsgCount{$patchID}++;
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
  # https://github.com/open-telemetry/opentelemetry-specification/issues/4338,
  # which should be vers > 1.40.0.
  if ($ARGV =~ /otel\/specification\/logs/) {
    s|(/data-model.md/?)#event-name\b|$1#field-eventname|g;
    printPatchInfoIf("2024-12-13-event-name", $otelSpecVers ne "1.40.0");
  }

  s|\(https://github.com/open-telemetry/opentelemetry-specification\)|($specBasePath/otel/)|;
  s|(\]\()/specification/|$1$specBasePath/otel/)|;
  s|\.\./semantic_conventions/README.md|$semConvRef| if $ARGV =~ /overview/;
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

  # Handle links containing `README.md`

  # Rewrite paths that are outside of the spec folders as external links:

  s|\.\.\/README.md|$otelSpecRepoUrl/|g if $ARGV =~ /specification._index/;
  s|\.\.\/README.md|..| if $ARGV =~ /specification\/library-guidelines.md/;

  s|(\.\.\/)+(experimental\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;
  s|(\.\.\/)+(supplementary-guidelines\/compatibility\/[^)]+)|$otelSpecRepoUrl/tree/v$otelSpecVers/$2|g;

  s|\.\./((?:examples/)?README\.md)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /^tmp\/otlp/;

  # Replace `README.md` by `_index.md` in markdown links:
  s{
      # An inline markdown link, just before the URL: `](` like in `[docs](/docs)`
      (
        \]\(
      )

      # Match any local path. In the `[^...]` exclude group we have:
      # - `:` so as to exclude external links, which use `:` after a protocol specifier
      # - `)` prevents us from gobbling up past the end of the inline link

      ([^:\)]*)
      README\.md
      ([^)]*)  # Any anchor specifier
      (\))     # The end of the inline link
  }{$1$openRelref "$2_index.md$3" \%\}\}$4}gx;

  # Replace `README.md` by `_index.md` in markdown link definitions:
  s{
      # A markdown link definition, just before the URL: `]:`, like in `[docs]: /docs`
      (
        \]:\s*
      )

      # Match any local path. In the `[^...]` exclude group we have:
      # - `:` so as to exclude external links, which use `:` after a protocol specifier
      # - A space should prevent us from gobbling up beyond the end of a link def

      ([^: ]*)
      README\.md
      ([^)]*) # Any anchor specifier
      (\n)$   # End of the link definition
  }{$1$openRelref "$2_index.md$3" \%\}\}$4}gx;

  # Rewrite inline links
  if ($ARGV =~ /\btmp\/opamp/) {
    s|\]\(([^:\)]*?)\.md((#.*?)?)\)|]($1/$2)|g;
  } else {
    # Generally rewrite markdown links as {{% relref "..." %}} expressions,
    # since that gets Hugo to resolve the links. We can't use the raw path since
    # some need a `../` prefix to resolve. We let Hugo handle that.
    s{
        # Match markdown link `](` just before the URL
        (\]\()

        # Match the link path:
        (
          # Match paths upto but excluding `.md`. The character exclusions are as follows:
          #
          # - `:` ensures the URL is a path, not an external link, which has a protocol followed by `:`
          # - `)` so we don't overrun the end of the markdown link, which ends with `)`
          # - `{` or `}` so that the path doesn't contain Hugo {{...}}

          [^:\)\{\}]*?

          \.md

          # Match optional anchor of the form `#some-id`
          (?:
            \#.*?
          )?
        )
        # Closing parenthesis of markdown link
        \)
    }{$1$openRelref "$2" \%\}\}\)}gx;
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

  ## OTLP proto files: link into the repo:
  s|\.\./(opentelemetry/proto/?.*)|$otlpSpecRepoUrl/tree/v$otlpSpecVers/$1|g if $ARGV =~ /\btmp\/otlp/;

  ## OpAMP

  s|\]\((proto/opamp.proto)\)|]($opAmpSpecRepoUrl/blob/main/$1)|;

  print;
}
