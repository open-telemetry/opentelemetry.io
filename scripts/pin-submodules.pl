#!/usr/bin/perl -w
#
# Switch submodules to their pinned versions, all submodules by default. Pass
# submodule-path regex to specify submodules to skip.

use strict;
use warnings;
use FileHandle;

my $submodule_skip_regex = shift @ARGV;

print "Using submodule-path skip regex: $submodule_skip_regex\n\n"
  if $submodule_skip_regex;

my $file = '.gitmodules';
my $fh = FileHandle->new($file, 'r') or die "Error opening $file: $!";
my $content = do { local $/; <$fh> };
$fh->close or die "Error closing $file: $!";

# Extract submodule paths and pin values
my @submodules = $content =~ /\[submodule "(.*?)".*?\w+-pin = ([^\s]+)/gs;

# Iterate through submodules
for (my $i = 0; $i < @submodules; $i += 2) {
    my $submodule_path = $submodules[$i];
    my $commit = $submodules[$i + 1];

    if ($submodule_skip_regex && $submodule_path =~ /$submodule_skip_regex/) {
      printf "Skipping $submodule_path\n";
      next;
    }

    my $command = "cd $submodule_path && git switch --detach $commit";
    print "> $command\n";
    system($command);

    if ($? == -1) {
        die "Failed to execute command: $!";
    } elsif ($? >> 8) {
        die "Command exited with error: $!";
    }
}
