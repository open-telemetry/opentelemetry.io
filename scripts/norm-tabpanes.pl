#!/usr/bin/perl -w

use strict;
use warnings;
use FileHandle;

my $in_tabpane = 0;
my $in_tab = 0;
my $tab_title = '';
my $lang = '';

for my $filename (@ARGV) {
  my $fh = FileHandle->new("< $filename") or die "Can't open $filename: $!";
  my @lines = <$fh>;
  $fh->close;

  for (my $i = 0; $i < @lines; $i++) {
    if ($lines[$i] =~ /\{\{<\s*tabpane\s*lang=([^ ]+)[^>]*>\}\}/) {
      $in_tabpane = 1;
      $lang = $1;
      $lines[$i] =~ s/lang=$lang/text=true/;
      $lang =~ s/^shell$/sh/;
      # Remove comment lines before tabpane and optional blank line
      while ($i > 1 && ($lines[$i-1] =~ /<!-- (prettier|markdown).*? -->/ || $lines[$i-2] =~ /<!-- (prettier|markdown).*? -->/)) {
        splice @lines, --$i, 1;
      }
    } elsif ($in_tabpane && $lines[$i] =~ /\{\{<\s*tab\s+([^>]+)\s*>\}\}/) {
      $in_tab = 1;
      $tab_title = $1;
      # Remove blank line before end tag if present
      splice @lines, --$i, 1 if $i > 1 && ($lines[$i-1] =~ /^\s*$/);
      $lines[$i] = "{{% tab $tab_title %}}\n\n```$lang\n";
    } elsif ($in_tab && $lines[$i] =~ /\{\{<\s*\/tab\s*>\}\}/) {
      $in_tab = 0;
      $lines[$i] = "```\n\n{{% /tab %}}\n";
    } elsif ($in_tabpane && $lines[$i] =~ /\{\{<\s*\/tabpane\s*>\}\}/) {
      $in_tabpane = 0;
      # Remove blank line before end tag if present
      splice @lines, --$i, 1 if $i > 1 && ($lines[$i-1] =~ /^\s*$/);
      # Remove comment lines after tabpane and optional blank line
      while ($i + 1 < $#lines && ($lines[$i+1] =~ /<!-- (prettier|markdown).*? -->/ || $lines[$i+2] =~ /<!-- (prettier|markdown).*? -->/)) {
        splice @lines, $i+1, 1;
      }
    }
  }

  $fh = FileHandle->new("> $filename") or die "Can't open $filename: $!";
  print $fh @lines;
  $fh->close;
}
