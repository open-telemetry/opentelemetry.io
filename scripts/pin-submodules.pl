#!/usr/bin/perl -w
#
# Switch submodules to their pinned versions, all submodules by default. Pass
# submodule-path regex to specify submodules to skip.

use strict;
use warnings;
use FileHandle;

my $submodule_skip_regex = shift @ARGV;
my $baseDir = `pwd`;
chomp $baseDir;

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

    chdir($baseDir) or die "Failed to change directory to $baseDir: $!";
    chdir($submodule_path) or die "Failed to change directory to $submodule_path: $!";

    # Verify that the commit exists in the submodule
    my $verify_cmd = "git rev-parse --verify $commit > /dev/null 2>&1";
    system($verify_cmd);
    if ($? == -1) {
      die "Failed to execute '$verify_cmd': $!";
    } elsif ($? >> 8) {
      # Commit not found. The most common reason is that the submodule was
      # cloned with a fixed depth, and the commit is outside of the shallow
      # clone depth. Let's check if it's shallow or not.

      my $is_shallow_cmd = "git rev-parse --is-shallow-repository";
      die "Commit $commit does not exist in $submodule_path (and the submodule is not shallow)."
        if `$is_shallow_cmd` !~ /true/;

      warn "Commit $commit does not exist in $submodule_path, " .
        "but the submodule is a shallow clone. Let's unshallow it and try again.";

      my $unshallow_cmd = "git fetch --unshallow";
      system($unshallow_cmd);
      die "Failed to execute '$verify_cmd': $!" if $? != 0;
    }

    my $command = "git switch --detach $commit";
    print "> $command\n";
    system($command);
    die "Command exited with error: $!" if $? != 0;
}
