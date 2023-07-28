#!/usr/bin/perl -w -i

use strict;
use warnings;

my @words;
my $lineLenLimit = 79;
my $last_file = "";
my $last_line = "";

while (<>) {
  if (/^(spelling: )?cSpell:ignore:? (.+)$/) {
    push @words, split ' ', $2;
    next;
  }

  if (@words && ($ARGV ne $last_file || eof)) {
    my $line = "cSpell:ignore: " . join(' ', sort {lc($a) cmp lc($b)} @words) . "\n";
    # Only add `# prettier-ignore` if line is too long
    print "# prettier-ignore\n" if length($line) > $lineLenLimit;
    print $line;
    @words = ();
  }

  print unless /^# prettier-ignore$/;

  $last_line = $_;
  $last_file = $ARGV if eof;
}
