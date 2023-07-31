#!/usr/bin/perl -w -i

use strict;
use warnings;
use JSON;
use FileHandle;

my @words;
my $lineLenLimit = 79;
my $last_file = '';
my $last_line = '';
my %dictionary = getSiteWideDictWords('.vscode/cspell.json', '.textlintrc.json');

while (<>) {
  if (/^\s*(spelling: |-\s*)?cSpell:ignore:?(.*)$/
      || (/^(\s+)(\S.*)$/ && @words)
  ) {
    push @words, split ' ', $2;
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

  my $json = JSON->new;
  my $data = $json->decode($json_text);
  my %dictionary = map { $_ => 1 } @{ $data->{words} };

  # Read the .textlintrc.json file
  $fh = FileHandle->new($textlintrc_file, "r") or die "Could not open file '$textlintrc_file': $!";
  $json_text = join "", $fh->getlines();

  # Remove JSON comments
  $json_text =~ s/^\s*\/\/.*$//mg;

  $data = $json->decode($json_text);

  # Add terms from .textlintrc.json to dictionary
  my @terms = @{ $data->{rules}->{terminology}->{terms} };
  @dictionary{@terms} = (1) x @terms;

  return %dictionary;
}
