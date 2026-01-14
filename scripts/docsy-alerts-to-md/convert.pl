#!/usr/bin/perl -w
#
# Convert Docsy alert shortcodes to GFM/Obsidian blockquote alert syntax.
# Currently handles: {{% alert title="Note" %}} or "Notes" (no color specifier)
#
# Skips alerts containing `{{<...>}}`.
#
# Usage: perl convert.pl <file1> [file2] ...

use strict;
use warnings;
use FileHandle;

my $ALERT_OPEN = qr/\{\{%\s*alert\s+title="Notes?"\s*%\}\}/;
my $ALERT_CLOSE = qr/\{\{%\s*\/alert\s*%\}\}/;

sub has_html_shortcode {
  my ($lines_ref, $start, $end) = @_;
  for (my $j = $start; $j <= $end; $j++) {
    return 1 if $lines_ref->[$j] =~ /\{\{<\s*[^>]*>\}/;
  }
  return 0;
}

sub find_closing_tag {
  my ($lines_ref, $start) = @_;
  for (my $j = $start; $j < @$lines_ref; $j++) {
    return $j if $lines_ref->[$j] =~ /$ALERT_CLOSE/;
  }
  return -1;
}

for my $filename (@ARGV) {
  my $fh = FileHandle->new("< $filename") or die "Can't open $filename: $!";
  my @lines = <$fh>;
  $fh->close;

  my @output;

  for (my $i = 0; $i < @lines; $i++) {
    my $line = $lines[$i];

    # Check for alert opening tag
    if ($line =~ /^\s*$ALERT_OPEN\s*(.*)$/) {
      my $first_content = $1;

      # Check for single-line alert (closing tag on same line)
      if ($first_content =~ /^(.*?)\s*$ALERT_CLOSE\s*$/) {
        my $content = $1;
        if ($content =~ /\{\{</) {
          push @output, $line;
        } elsif ($content eq '') {
          push @output, "> [!NOTE]\n";
        } else {
          push @output, "> [!NOTE]\n>\n> $content\n";
        }
        next;
      }

      # Multi-line alert: find closing tag
      my $close_idx = find_closing_tag(\@lines, $i + 1);
      if ($close_idx < 0) {
        push @output, $line;
        next;
      }

      # Skip if contains HTML shortcode
      if (has_html_shortcode(\@lines, $i, $close_idx)) {
        for (my $j = $i; $j <= $close_idx; $j++) {
          push @output, $lines[$j];
        }
        $i = $close_idx;
        next;
      }

      # Collect all content lines
      my @content;
      push @content, $first_content if $first_content =~ /\S/;

      for (my $j = $i + 1; $j <= $close_idx; $j++) {
        my $l = $lines[$j];
        $l =~ s/\s*$ALERT_CLOSE\s*$//;  # Strip closing tag if present
        chomp $l;
        push @content, $l;
      }

      # Remove trailing empty lines
      pop @content while @content && $content[-1] =~ /^\s*$/;

      # Output as blockquote
      push @output, "> [!NOTE]\n";
      # Add blank line after header if first content isn't blank
      push @output, ">\n" if @content && $content[0] !~ /^\s*$/;
      for my $c (@content) {
        if ($c =~ /^\s*$/) {
          push @output, ">\n";
        } else {
          push @output, "> $c\n";
        }
      }
      $i = $close_idx;
      next;
    }

    push @output, $line;
  }

  $fh = FileHandle->new("> $filename") or die "Can't open $filename: $!";
  print $fh @output;
  $fh->close;
}
