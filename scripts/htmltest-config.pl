#!/usr/bin/perl

use strict;
use warnings;

my $gD = 0;

sub main {
    my @ignore_dirs;

    collect_htmltest_config_from_front_matter(\@ignore_dirs, @ARGV);
    update_htmltest_config_file(\@ignore_dirs);
}

sub collect_htmltest_config_from_front_matter {
    my ($ignore_dirs_ref, @files) = @_;

    foreach my $file_path (sort @files) {
        my @htmltest_config = extract_htmltest_config($file_path);
        next unless @htmltest_config;
        push @$ignore_dirs_ref, @htmltest_config;
    }
}

sub extract_htmltest_config {
    # Returns list of htmlconfig lines extracted from the front matter of $file_path
    my ($file_path) = @_;

    open my $fh, '<', $file_path or die "Could not open '$file_path': $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    return unless $content =~ /---\n(.*?)\n---/s;

    my $front_matter = $1;
    my @htmltest_config = _extract_htmltest_config($front_matter);

    return unless @htmltest_config;

    if (@htmltest_config == 1) {
        warn "WARNING: Failed to extract htmltest config from front matter in file '$file_path'.\n";
        return;
    }

    do {
      shift @htmltest_config;
    } until !@htmltest_config # No more config
       || $htmltest_config[0] !~ /^\s*#/; # Non-comment line

    return _extract_ignore_dirs($file_path, @htmltest_config) if $htmltest_config[0] =~ /^IgnoreDirs:/i;

    # TODO: Add support for `IgnoreURLs`.

    warn "WARNING: Unrecognized htmltest config from front matter in file '$file_path'.\n";
}

sub _extract_ignore_dirs {
    my ($file_path,
        @ignore_dirs_config_lines # Can include comment lines
    ) = @_;
    my @config;

    foreach my $line (@ignore_dirs_config_lines) {
      next if $line =~ /^IgnoreDirs:\s*$/i;
      if ($line =~ /\s*#/) {
        push @config, $line;
      } elsif ($line =~ /^IgnoreDirs:\s*\[\s*(.*?)\s*\]/i || $line =~ /^\s*-\s*(.*?)$/) {
        push @config, (split /\s*,\s*/, $1);
      } else {
        warn "WARNING: Unrecognized htmltest IgnoreDirs config from front matter in file '$file_path': $line\n";
      }
    }
    return @config;
}

sub _extract_htmltest_config {
    # Returns a list of htmltest config lines with whitespace trimmed away.

    my ($front_matter) = @_;
    my @lines = split /\n/, $front_matter;
    my @htmltest_lines;
    my $in_htmltest_section = 0;

    foreach my $line (@lines) {
        if ($line =~ /^htmltest:(.*?)(#.*)?$/) {
            $in_htmltest_section = 1;
            push @htmltest_lines, $line;
        } elsif ($in_htmltest_section) {
            if ($line =~ /^(\s{2,})(.*)$/) {
                push @htmltest_lines, $2;
                printf "  > Config line: $line" if $gD;
            } else {
                last;
            }
        }
    }
    return @htmltest_lines;
}

sub update_htmltest_config_file {
    my ($ignore_dirs_ref) = @_;
    my $htmltest_config_path = '.htmltest.yml';
    my $do_not_edit_msg = "  # DO NOT EDIT! IgnoreDirs list is auto-generated from markdown file front matter.\n";

    # Read config file as array of lines
    open my $fh, '<', $htmltest_config_path or die "Could not open '$htmltest_config_path' for reading: $!";
    my @lines = <$fh>;
    close $fh;

    # Replace the existing IgnoreDirs entries with the new ones
    my $in_ignore_dirs = 0;
    my @new_lines;
    foreach my $line (@lines) {
        if ($line =~ /^IgnoreDirs:/) {
            push @new_lines, ($line, $do_not_edit_msg);
            foreach my $ignore_dir (@$ignore_dirs_ref) {
                my $prefix = $ignore_dir =~ /^#/ ? '  ' : '  - ';
                push @new_lines, "$prefix$ignore_dir\n";
            }
            push @new_lines, $do_not_edit_msg;
            $in_ignore_dirs = 1;
        } elsif ($in_ignore_dirs) {
            next if $line =~ /^\s*([#-]|$)/;
            $in_ignore_dirs = 0;
            push @new_lines, $line;
        } else {
            push @new_lines, $line;
        }
    }

    open my $fh_out, '>', $htmltest_config_path or die "Could not open '$htmltest_config_path' for writing: $!";
    print $fh_out @new_lines;
    close $fh_out;
}

main();
