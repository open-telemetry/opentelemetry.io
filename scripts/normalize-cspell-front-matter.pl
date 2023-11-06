#!/usr/bin/perl -w -i

use strict;
use warnings;
use JSON::PP;
use FileHandle;

my @words;
my $lineLenLimit = 79;
my $last_file = '';
my $last_line = '';
my %dictionary = getSiteWideDictWords('.vscode/cspell.json', '.textlintrc.yml');

while (<>) {
  if (/^\s*(spelling: |-\s*)?cSpell:ignore:?\s*(.*)$/
      || (/^(\s+)(\S.*)$/ && @words)
  ) {
    push @words, split /[,\s]+/, $2;
    next;
  }

  if (@words && ($ARGV ne $last_file || eof)) {
    @words = grep { !/^\s*(cSpell:ignore|spelling):?\s*$/ && !$dictionary{$_} } @words;
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

  # Read the cspell.json file
  my $fh = FileHandle->new($dictionary_file, "r") or die "Could not open file '$dictionary_file': $!";
  my $json_text = join "", $fh->getlines();

  # Remove JSON comments
  $json_text =~ s/^\s*\/\/.*$//mg;

  my $json = JSON::PP->new;
  my $data = $json->decode($json_text);
  my %dictionary = map { $_ => 1 } @{ $data->{words} };

  my %textlintDictionary = processTextlintRcYml($textlintrc_file);

  # Merge dictionaries
  @dictionary{keys %textlintDictionary} = values %textlintDictionary;

  return %dictionary;
}

sub processTextlintRcYml {
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
