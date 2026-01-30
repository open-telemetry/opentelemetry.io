#!/usr/bin/env perl
#
# Sort and deduplicate word list files in place (one word per line), ignoring
# case.
#
# Usage: perl script.pl file [file ...]
#   file  Path(s) to .txt word list file(s) and/or .cspell.yml; each is
#         modified in place. If .cspell.yml exists in cwd, it is processed
#         automatically in addition to any files given.

use strict;
use warnings;
use Unicode::Collate;
use Unicode::Collate::Locale;

$^W = 1; # enable

die "Usage: $0 file [file ...]\n" if !@ARGV;

push @ARGV, '.cspell.yml' if -f '.cspell.yml' && !grep { m{\.cspell\.yml\z} } @ARGV;

sub collator_for_file {
  my ($path) = @_;
  my $base = $path;
  $base =~ s{.*/}{};
  my ($locale) = $base =~ /^([a-z]{2})[-_]/;
  return if !$locale;
  my $collator = eval {
    Unicode::Collate::Locale->new(locale => $locale, variable => 'Non-ignorable');
  };
  return $collator if $collator;
  return Unicode::Collate->new(variable => 'Non-ignorable');
}

sub sort_cspell_yml {
  my ($path, $collator) = @_;
  open my $fh, '<:utf8', $path or die "Cannot open $path: $!";
  my @lines = <$fh>;
  close $fh;

  my @out;
  my $in_words = 0;
  my @words;
  my @comment_lines;

  for my $line (@lines) {
    if (!$in_words) {
      if ($line =~ /^\s*words:\s*\z/) {
        $in_words = 1;
        push @out, $line;
        @comment_lines = ();
        next;
      }
      push @out, $line;
      next;
    }

    if ($line =~ /^\s+-\s+(\S[^\n]*)/) {
      push @words, $1;
      next;
    }
    if ($line =~ /^\s+#/) {
      push @comment_lines, $line;
      next;
    }

    # End of words section: emit sorted words then this line
    $line =~ s/\n\z//;
    my %by_lc;
    for my $w (@words) {
      my $key = lc($w);
      $by_lc{$key} = $w if !exists $by_lc{$key} || $w eq $key;
    }
    my @sorted = sort { $collator->cmp(lc($a), lc($b)) } values %by_lc;
    push @out, @comment_lines;
    push @out, "  - $_\n" for @sorted;
    push @out, $line . "\n";
    @words = ();
    @comment_lines = ();
    $in_words = 0;
  }

  if ($in_words && @words) {
    my %by_lc;
    for my $w (@words) {
      my $key = lc($w);
      $by_lc{$key} = $w if !exists $by_lc{$key} || $w eq $key;
    }
    my @sorted = sort { $collator->cmp(lc($a), lc($b)) } values %by_lc;
    push @out, @comment_lines;
    push @out, "  - $_\n" for @sorted;
  }

  open my $out_fh, '>:utf8', $path or die "Cannot open $path for writing: $!";
  print $out_fh @out;
  close $out_fh or die "Error closing $path: $!";
}

my $default_collator = Unicode::Collate->new(variable => 'Non-ignorable');

for my $path (@ARGV) {
  -f $path or die "Not a file: $path\n";

  if ($path =~ m{\.cspell\.yml\z}) {
    sort_cspell_yml($path, $default_collator);
    print STDOUT "Sorted: $path\n";
    next;
  }

  open my $fh, '<:utf8', $path or die "Cannot open $path: $!";
  my @lines = <$fh>;
  close $fh;

  chomp @lines;
  my %by_lc;
  for my $w (grep { !/^\s*\z/ } @lines) {
    my $key = lc($w);
    $by_lc{$key} = $w if !exists $by_lc{$key} || $w eq $key;  # prefer lowercase
  }
  my @words = values %by_lc;
  my $collator = collator_for_file($path) // $default_collator;
  my @sorted = sort { $collator->cmp(lc($a), lc($b)) } @words;

  open my $out, '>:utf8', $path or die "Cannot open $path for writing: $!";
  print $out "$_\n" for @sorted;
  close $out or die "Error closing $path: $!";

  print STDOUT "Sorted: $path\n";
}
