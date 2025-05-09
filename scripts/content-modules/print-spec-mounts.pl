#!/usr/bin/perl -w -i
#
# DRAFT script used to normalize semconv doc-page tiles and add Hugo front matter

$^W = 1;

use strict;
use warnings;
use diagnostics;

sub mountEntryFor() {
  s|^(./)?docs/||;
  my $target = $_;
  $target =~ s/README\.md$/_index.md/;
  return <<"EOS";
    - source: tmp/semconv/docs/$_
      target: content/docs/specs/semconv/$target
EOS
}

sub main() {
  foreach (@ARGV) {
    my $path = "";
    print mountEntryFor();
  }
}

main();
