#!/usr/bin/perl -w
#
# Convert Docsy alert shortcodes to GFM/Obsidian blockquote alert syntax.
# Currently handles: {{% alert title="Note" %}} or "Notes" or "Warning"
#
# Skips alerts containing `{{<...>}}`.
#
# Usage: perl convert.pl <file1> [file2] ...

use strict;
use warnings;
use FileHandle;

my $ALERT_OPEN = qr/\{\{%\s*alert\s+.*?%\}\}/;
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

sub extract_alert_info {
  my ($line) = @_;

  my $color = '';
  my $type = '';
  my $title = '';
  my $attrs = '';
  my $attrs_without_title = '';

  if ($line =~ /\{\{%\s*alert\b(.*?)%\}\}/) {
    $attrs = $1 // '';
    $attrs =~ s/^\s+//;
    $attrs =~ s/\s+$//;
    $attrs_without_title = $attrs;
    $attrs_without_title =~ s/\btitle=("[^"]*"|'[^']*'|[^\s%]+)//ig;
    $attrs_without_title =~ s/^\s+//;
    $attrs_without_title =~ s/\s+$//;
  }

  # Extract title if present
  if ($line =~ /title=["']([^"']+)["']/ || $line =~ /title=([^\s%]+)/) {
    $title = $1;
  }

  # Extract color if present
  if ($line =~ /color=["']?([^"'\s%]+)["']?/) {
    $color = $1;
  }

  # Determine type based on title or color
  if ($title =~ /^Caution$/i) {
    $type = 'CAUTION';
    $title = '';  # Don't preserve generic title
  } elsif ($title =~ /^Notes?$/i) {
    $type = 'NOTE';
    $title = '';  # Don't preserve generic title
  } elsif ($title =~ /^Tip$/i) {
    $type = 'TIP';
    $title = '';  # Don't preserve generic title
  } elsif ($title =~ /^Warning$/i) {
    $type = 'WARNING';
    $title = '';  # Don't preserve generic title
  } elsif ($title =~ /(^tip|tip$)/i) {
    $type = 'TIP';
  } elsif ($line =~ /color=["']?warning["']?/i) {
    $type = 'WARNING';
    $title = '' if $title =~ /^Important$/i;  # Don't preserve generic "Important" title
  } elsif ($line =~ /color=["']?success["']?/i) {
    $type = 'TIP';
  } elsif ($title =~ /^Important$/i) {
    $type = 'IMPORTANT';
    $title = '';  # Don't preserve generic "Important" title
  }

  if (!$type) {
    if ($attrs eq '' || $attrs_without_title eq '' || $color eq 'primary') {
      $type = 'NOTE';
    }
  }

  return ($type, $title);
}

for my $filename (@ARGV) {
  my $fh = FileHandle->new("< $filename") or die "Can't open $filename: $!";
  my @lines = <$fh>;
  $fh->close;

  my @output;

  for (my $i = 0; $i < @lines; $i++) {
    my $line = $lines[$i];

    # Check for alert opening tag
    if ($line =~ /^\s*($ALERT_OPEN)\s*(.*)$/) {
      my $alert_tag = $1;
      my $first_content = $2;
      my ($alert_type, $alert_title) = extract_alert_info($alert_tag);

      # Skip if we can't determine the alert type
      unless ($alert_type) {
        push @output, $line;
        next;
      }

      my $alert_header = $alert_title ? "> [!$alert_type] $alert_title" : "> [!$alert_type]";

      # Check for single-line alert (closing tag on same line)
      if ($first_content =~ /^(.*?)\s*$ALERT_CLOSE\s*$/) {
        my $content = $1;
        if ($content =~ /\{\{</) {
          push @output, $line;
        } elsif ($content eq '') {
          push @output, "$alert_header\n";
        } else {
          push @output, "$alert_header\n>\n> $content\n";
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
      push @output, "$alert_header\n";
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
