#!/usr/bin/env perl
#
# Ensures that each changed non-en locale file has its default_lang_commit front
# matter field ending in "# patched".
#
# When making targeted changes to localized pages (e.g., link fixes, resource
# updates, or content additions) without fully syncing with the English version,
# add "# patched" as a YAML comment at the end of the default_lang_commit line.
# See content/en/docs/contributing/localization.md for details.
#
# Usage:
#   ./scripts/ensure-default-lang-commit-patched.pl [--dry-run]
#
# By default: adds "# patched" to default_lang_commit lines that lack it.
# With --dry-run: reports files that need the suffix (exit 1 if any).

use strict;
use warnings;

my $DRY_RUN = grep { $_ eq '--dry-run' } @ARGV;
my $CONTENT_DIR = 'content';
my $DEFAULT_LOCALE = 'en';

sub get_changed_files {
  open my $fh, '-|', 'git', 'diff', '--name-only', 'HEAD'
    or die "git diff failed: $!\n";
  my @files = grep { /\S/ } map { chomp; $_ } <$fh>;
  close $fh;
  return @files;
}

sub is_non_en_locale_file {
  my ($path) = @_;
  return 0 unless $path =~ m{^\Q$CONTENT_DIR\E/([^/]+)/};
  my $locale = $1;
  return $locale ne $DEFAULT_LOCALE;
}

sub needs_patched_suffix {
  my ($file) = @_;
  return 0 unless -f $file;
  open my $fh, '<', $file or return 0;
  while (my $line = <$fh>) {
    next unless $line =~ /^default_lang_commit:/;
    close $fh;
    # Already has "# patched" or "# patched (...)"
    return 0 if $line =~ /#\s*patched(\s|$)/;
    return 1;
  }
  close $fh;
  return 0;
}

sub add_patched_suffix {
  my ($file) = @_;
  open my $fh, '<', $file or die "Cannot read $file: $!\n";
  my $content = do { local $/; <$fh> };
  close $fh;
  $content =~ s/^(default_lang_commit:\s*\S+)[ \t]*$/$1 # patched/m;
  open $fh, '>', $file or die "Cannot write $file: $!\n";
  print $fh $content;
  close $fh;
}

my @need_fix = grep {
  is_non_en_locale_file($_) && needs_patched_suffix($_)
} get_changed_files();

exit 0 if @need_fix == 0;

if ($DRY_RUN) {
  print "The following changed non-en locale files need 'default_lang_commit' to end with '# patched':\n";
  print "  $_\n" for @need_fix;
  exit 1;
}

for my $f (@need_fix) {
  add_patched_suffix($f);
  print "Fixed: $f\n";
}
