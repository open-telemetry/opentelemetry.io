#!/usr/bin/perl -w -i
#
# cSpell:ignore textlintrc

use strict;
use warnings;
use FileHandle;

my @words;
my $lineLenLimit = 79;
my $current_file = '';
my $has_front_matter = 0;
my $in_front_matter = 0;
my $last_line_contained_dict_words = 0;
my %dictionary = getSiteWideDictWords('.cspell/en-words.txt', '.textlintrc.yml');

while (<>) {
  # Starting a new file?
  if ($current_file ne $ARGV) {
    $current_file = $ARGV;
    if(/^---$/) {
      $has_front_matter = 1;
      $in_front_matter = 1;
      print;
      next;
    } else {
      $has_front_matter = 0;
      $in_front_matter = 0;
    }
  }

  if ($has_front_matter && !$in_front_matter) {
    print; next;
  }

  $in_front_matter = 0 if $has_front_matter && $in_front_matter && /^---$/;

  # Process cSpell words

  if (/^\s*(spelling: |-\s*)?cSpell:ignore:?\s*(.*)$/
      || (/^(\s+)(\S.*)$/ && $last_line_contained_dict_words)
  ) {
    push @words, split /[,\s]+/, $2;
    $last_line_contained_dict_words = 1;
    next;
  } else {
    $last_line_contained_dict_words = 0;
  }

  if (@words && (!$has_front_matter || !$in_front_matter)) {
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
      # print STDOUT "> printing line: $line";
      @words = ();
    }
  }

  print unless /^# prettier-ignore$/ || /^spelling:\s*[|>-]*$/;
}

sub getSiteWideDictWords {
  my $dictionary_file = shift;
  my $textlintrc_file = shift;

  my %dictionary = readYmlOrPlainListOfWords('', $dictionary_file);
  my %textlintDictionary = readYmlOrPlainListOfWords('terms', $textlintrc_file);
  # Merge dictionaries
  @dictionary{keys %textlintDictionary} = values %textlintDictionary;

  return %dictionary;
}

sub readYmlOrPlainListOfWords {
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
      # print "FINISH word list\n" if $in_terms;
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
