#!/usr/bin/perl -w

use strict;
use warnings;
use FileHandle;

my $in_tabpane = 0;
my $in_tab = 0;
my $tab_title = '';
my $lang = '';
my $langIsHeader = 0;

for my $filename (@ARGV) {
  my $fh = FileHandle->new("< $filename") or die "Can't open $filename: $!";
  my @lines = <$fh>;
  $fh->close;

  for (my $i = 0; $i < @lines; $i++) {
    if ($lines[$i] =~ /\{\{<\s*tabpane(.*?)>\}\}\s*$/) {
      $in_tabpane = 1;
      my $args = $1;
      $langIsHeader = $args =~ /langEqualsHeader="?true"?/;
      ($lang) = $args =~ /\blang="?(.*?)"?\b/;
      $lang =~ s/^shell$/sh/ if $lang;
      $lines[$i] =~ s/tabpane /tabpane text=true /;
      # Remove comment lines before tabpane and optional blank line
      while (($i > 0 && $lines[$i-1] =~ /<!-- (prettier|\w+lint).*? -->/)
          || ($i > 1 && $lines[$i-2] =~ /<!-- (prettier|\w+lint).*? -->/)) {
        splice @lines, --$i, 1;
      }
    } elsif ($in_tabpane && $lines[$i] =~ /\{\{<\s*tab\s+([^>]*\S)\s*>\}\}/) {
      $in_tab = 1;
      $tab_title = $1;
      # Remove blank line before end tag if present
      splice @lines, --$i, 1 if $i > 1 && ($lines[$i-1] =~ /^\s*$/);
      $lang = $tab_title if $langIsHeader;
      $lang = 'js' if $lang eq 'JavaScript';
      $lang = 'ts' if $lang eq 'TypeScript';
      if ($lang) {
        $lang = lc($lang);
      } else {
        printf STDERR "$filename:$i - no language specified\n";
      }
      $lines[$i] = "{{% tab $tab_title %}}\n\n```$lang\n";
    } elsif ($in_tab && $lines[$i] =~ /\{\{<\s*\/tab\s*>\}\}/) {
      $in_tab = 0;
      $lines[$i] = "```\n\n{{% /tab %}}\n";
    } elsif ($in_tabpane && $lines[$i] =~ /\{\{<\s*\/tabpane\s*>\}\}/) {
      $in_tabpane = 0;
      $langIsHeader = 0;
      # Remove blank line before end tag if present
      splice @lines, --$i, 1 if $i > 2 && ($lines[$i-1] =~ /^\s*$/) && ($lines[$i-2] =~ /\/tab/);
      # Remove comment lines after tabpane and optional blank line
      while (($i + 0 < $#lines && $lines[$i+1] =~ /<!-- (prettier|\w+lint).*? -->/)
          || ($i + 1 < $#lines && $lines[$i+2] =~ /<!-- (prettier|\w+lint).*? -->/)) {
        splice @lines, $i+1, 1;
      }
    }
  }

  $fh = FileHandle->new("> $filename") or die "Can't open $filename: $!";
  print $fh @lines;
  $fh->close;
}
