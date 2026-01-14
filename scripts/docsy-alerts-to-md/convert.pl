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

# Check if alert body (from start index to end index) contains tabpane
sub has_html_shortcode_call_in_body {
  my ($lines_ref, $start, $end) = @_;
  for (my $j = $start; $j <= $end; $j++) {
    return 1 if $lines_ref->[$j] =~ /\{\{<\s*[^>]*>\}/;
  }
  return 0;
}

# Find closing tag index starting from given position
# Returns line index, or -1 if not found
sub find_closing_tag {
  my ($lines_ref, $start) = @_;
  for (my $j = $start; $j < @$lines_ref; $j++) {
    return $j if $lines_ref->[$j] =~ /\{\{%\s*\/alert\s*%\}\}/;
  }
  return -1;
}

# Strip closing tag from line and return content before it
sub strip_closing_tag {
  my ($line) = @_;
  $line =~ s/\s*\{\{%\s*\/alert\s*%\}\}\s*$//;
  return $line;
}

for my $filename (@ARGV) {
  my $fh = FileHandle->new("< $filename") or die "Can't open $filename: $!";
  my @lines = <$fh>;
  $fh->close;

  my @output;

  for (my $i = 0; $i < @lines; $i++) {
    my $line = $lines[$i];

    # Single-line alert: {{% alert title="Note" %}} content {{% /alert %}}
    if ($line =~ /^\s*\{\{%\s*alert\s+title="Notes?"\s*%\}\}\s*(.*?)\s*\{\{%\s*\/alert\s*%\}\}\s*$/) {
      my $content = $1;
      # Skip if content contains HTML shortcode call
      if ($content =~ /\{\{<\s*[^>]*>\}/) {
        push @output, $line;
        next;
      }
      if ($content eq '') {
        push @output, "> [!NOTE]\n";
      } else {
        push @output, "> [!NOTE]\n>\n> $content\n";
      }
      next;
    }

    # Opening tag with inline content, closing on different line:
    # {{% alert title="Note" %}} Content here
    if ($line =~ /^\s*\{\{%\s*alert\s+title="Notes?"\s*%\}\}\s*(.+)$/) {
      my $first_content = $1;
      my $close_idx = find_closing_tag(\@lines, $i + 1);

      # No closing tag found - pass through unchanged
      if ($close_idx < 0) {
        push @output, $line;
        next;
      }

      # Skip conversion if contains HTML shortcode call
      if (has_html_shortcode_call_in_body(\@lines, $i, $close_idx - 1)) {
        for (my $j = $i; $j <= $close_idx; $j++) {
          push @output, $lines[$j];
        }
        $i = $close_idx;
        next;
      }

      # Convert to blockquote
      push @output, "> [!NOTE]\n>\n";
      chomp $first_content;
      push @output, "> $first_content\n";
      for (my $j = $i + 1; $j <= $close_idx; $j++) {
        my $content_line = $lines[$j];
        # Strip closing tag if on this line
        $content_line = strip_closing_tag($content_line);
        chomp $content_line;
        # Skip if line is now empty (was just the closing tag)
        next if $content_line =~ /^\s*$/ && $j == $close_idx;
        if ($content_line =~ /^\s*$/) {
          push @output, ">\n";
        } else {
          push @output, "> $content_line\n";
        }
      }
      # Remove trailing blank blockquote line if present
      if (@output && $output[-1] eq ">\n") {
        pop @output;
      }
      $i = $close_idx;
      next;
    }

    # Opening tag alone: {{% alert title="Note" %}}
    if ($line =~ /^\s*\{\{%\s*alert\s+title="Notes?"\s*%\}\}\s*$/) {
      my $close_idx = find_closing_tag(\@lines, $i + 1);

      # No closing tag found - pass through unchanged
      if ($close_idx < 0) {
        push @output, $line;
        next;
      }

      # Skip conversion if contains HTML shortcode call
      if (has_html_shortcode_call_in_body(\@lines, $i + 1, $close_idx - 1)) {
        # Pass through unchanged until closing tag
        for (my $j = $i; $j <= $close_idx; $j++) {
          push @output, $lines[$j];
        }
        $i = $close_idx;
        next;
      }

      # Convert to blockquote
      push @output, "> [!NOTE]\n";
      for (my $j = $i + 1; $j <= $close_idx; $j++) {
        my $content_line = $lines[$j];
        # Strip closing tag if on this line
        $content_line = strip_closing_tag($content_line);
        chomp $content_line;
        # Skip if line is now empty (was just the closing tag)
        next if $content_line =~ /^\s*$/ && $j == $close_idx;
        if ($content_line =~ /^\s*$/) {
          push @output, ">\n";
        } else {
          push @output, "> $content_line\n";
        }
      }
      # Remove trailing blank blockquote line if present
      if (@output && $output[-1] eq ">\n") {
        pop @output;
      }
      $i = $close_idx;
      next;
    }

    # Pass through unchanged
    push @output, $line;
  }

  $fh = FileHandle->new("> $filename") or die "Can't open $filename: $!";
  print $fh @output;
  $fh->close;
}
