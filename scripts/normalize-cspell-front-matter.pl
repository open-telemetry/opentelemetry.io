#!/usr/bin/perl -w
#
# cSpell:ignore textlintrc

use strict;
use warnings;
use FileHandle;

my $lineLenLimit = 79;
my %dictionary = getSiteWideDictWords('.cspell/en-words.txt', '.textlintrc.yml');

while (my $current_file = shift @ARGV) {
  my @words;
  my $has_front_matter = 0;
  my $in_front_matter = 0;
  my $last_line_contained_dict_words = 0;

  # Read the entire file content into an array
  open my $fh, '<', $current_file or die "Cannot open $current_file: $!";
  my @file_content = <$fh>;
  close $fh;

  my $file_length = scalar @file_content;
  my $line_number = 0;
  my @output_content;

  while ($line_number < $file_length) {
    $_ = $file_content[$line_number];
    $line_number++;

    if ($line_number == 1 && /^---$/) {
      $has_front_matter = 1;
      $in_front_matter = 1;
      push @output_content, $_;
      next;
    }

    if ($has_front_matter && !$in_front_matter) {
      push @output_content, $_;
      next;
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
      my %duplicates;
      # Ensure all words are unique (case-insensitive), drop duplicates
      @words = grep { !$duplicates{lc $_}++ } @words;
      # Words that were duplicates (usually because they differed in
      # capitalization) should be in lowercase since lowercase words match the
      # spelling of all capitalized forms of the word.
      @words = map { $duplicates{lc $_} > 1 ? lc $_ : $_ } @words;

      # Check if each word is present in the remainder of the file
      my @filtered_words;
      foreach my $word (@words) {
        my $found = 0;
        for (my $i = 1; $i < $file_length; $i++) {
          my $line = $file_content[$i];
          if ($line !~ /cSpell/i && $line =~ /\Q$word\E/i) {
            $found = 1;
            last;
          }
        }
        push @filtered_words, $word if $found;
      }

      if (@filtered_words) {
        my $words = join(' ', sort {lc($a) cmp lc($b)} @filtered_words);
        my $line = "cSpell:ignore: $words\n";
        # Only add `# prettier-ignore` if line is too long
        push @output_content, "# prettier-ignore\n" if length($line) > $lineLenLimit;
        push @output_content, $line;
        @words = ();
      }
    }

    push @output_content, $_ unless /^# prettier-ignore$/ || /^spelling:\s*[|>-]*$/;
  }

  # Write the modified content back to the file
  open my $out_fh, '>', $current_file or die "Cannot open $current_file: $!";
  print $out_fh @output_content;
  close $out_fh;
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
