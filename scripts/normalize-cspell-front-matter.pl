#!/usr/bin/perl -w -i

use strict;
use warnings;
use FileHandle;

my @words;
my $lineLenLimit = 79;
my $last_file = '';
my $last_line = '';
my %dictionary = getSiteWideDictWords('.cspell/en-words.txt', '.textlintrc.yml');

while (<>) {
  if (/^\s*(spelling: |-\s*)?cSpell:ignore:?\s*(.*)$/
      || (/^(\s+)(\S.*)$/ && @words)
  ) {
    push @words, split /[,\s]+/, $2;
    next;
  }

  if (@words && ($ARGV ne $last_file || eof)) {
    @words = grep { !/^\s*(cSpell:ignore|spelling):?\s*$/ && !$dictionary{$_} } @words;
    # Ensure all words are unique.
    my %duplicates;
    @words = grep { !$duplicates{$_}++ } @words;
    if (@words) {
      my $words = join(' ', sort {lc($a) cmp lc($b)} @words);
      my $line = "cSpell:ignore: $words\n";
      # Only add `# prettier-ignore` if line is too long
      print "# prettier-ignore\n" if length($line) > $lineLenLimit;
      print $line;
      @words = ();
    }
  }

  print unless /^# prettier-ignore$/ || /^spelling:\s*[|>-]*$/;

  $last_line = $_;
  $last_file = $ARGV if eof;
}

sub getSiteWideDictWords {
  my $dictionary_file = shift;
  my $textlintrc_file = shift;

  my %dictionary = readYmOrPlainlListOfWords('', $dictionary_file);
  my %textlintDictionary = readYmOrPlainlListOfWords('terms', $textlintrc_file);
  # Merge dictionaries
  @dictionary{keys %textlintDictionary} = values %textlintDictionary;

  return %dictionary;
}

sub readYmOrPlainlListOfWords {
  # Read plain list of words if $wordsFieldName is empty
  my $wordsFieldName = shift;
  my $file_path = shift;
  my $fh = FileHandle->new($file_path, "r") or die "Could not open file '$file_path': $!";
  my @lines = $fh->getlines();
  $fh->close();

  my %dictionary;
  my $indentation = '';
  my $in_terms = $wordsFieldName eq '' ? 1 : 0;
  foreach my $line (@lines) {
    chomp $line;
    next if $line =~ /^\s*#|^\s*$/;
    # print "> $line\n" if $wordsFieldName;

    if ($wordsFieldName && $line =~ /^(\s*)$wordsFieldName:/) {
      $indentation = "$1  - " || '';
      $in_terms = 1;
      # print "> FOUND $wordsFieldName keyword\n"
    } elsif ($line =~ /^$indentation(\w[^\s]*)$/ && $in_terms) {
      my $term = $1;
      $dictionary{$term} = 1 if $term;
    } elsif ($wordsFieldName && $line !~ /^ / && $in_terms) {
      $in_terms = 0;
      # print "FINISHE word list\n" if $in_terms;
    } else {
      # print "OOPS LINE DID NOT MATCH\n" if $in_terms;
    }
  }

  die "ERROR: no words read from '$file_path'!" unless %dictionary; # sanity check

  return %dictionary;
}

sub processTextlintRc {
  my $file_path = shift;
  my $fh = FileHandle->new($file_path, "r") or die "Could not open file '$file_path': $!";
  my @lines = $fh->getlines();
  $fh->close();

  my %dictionary;
  my $indentation = '';
  my $in_terms = 0;
  foreach my $line (@lines) {
    chomp $line;
    if ($line =~ /^(\s*)terms:/) {
      $indentation = $1 || '';
      $in_terms = 1;
      # print STDOUT "Found terms!";
    } elsif ($line =~ /^$indentation  - (\w[^\s]*)$/ && $in_terms) {
      my $term = $1;
      $dictionary{$term} = 1 if $term;
    } elsif ($line !~ /^ / && $in_terms) {
      $in_terms = 0;
    }
  }

  die "ERROR: no words read from '$file_path'!" unless %dictionary; # sanity check

  return %dictionary;
}
