package StatsCommon;

use strict;
use warnings;
use POSIX qw(strftime);

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT = qw(
  get_author_consolidation
  get_consolidated_contributors
  get_line_stats
  count_commits
  count_unique_contributors
  get_median
  get_average
  validate_date
  get_default_dates
  setup_output
  finish_output
);

# Get author consolidation (email -> most recent name)
sub get_author_consolidation {
  my ($since, $until, $path_spec) = @_;

  my %email_to_name;
  my %email_to_date;

  # Get all commits with email, name, and date
  my $cmd = "git log --since='$since' --until='$until' --format='%aE|%aN|%ai'";
  $cmd .= " -- $path_spec" if $path_spec;

  my @commits = `$cmd`;
  chomp @commits;

  foreach my $line (@commits) {
    my ($email, $name, $date) = split /\|/, $line, 3;
    next unless $email;

    # Keep the most recent name for each email
    if (!exists $email_to_date{$email} || $date gt $email_to_date{$email}) {
      $email_to_name{$email} = $name;
      $email_to_date{$email} = $date;
    }
  }

  return \%email_to_name;
}

# Get consolidated contributors list
sub get_consolidated_contributors {
  my ($since, $until, $path_spec, $limit) = @_;

  my $email_to_name = get_author_consolidation($since, $until, $path_spec);
  my %email_to_count;

  # Count commits per email
  my $cmd = "git log --since='$since' --until='$until' --format='%aE'";
  $cmd .= " -- $path_spec" if $path_spec;

  my @emails = `$cmd`;
  chomp @emails;

  foreach my $email (@emails) {
    next unless $email;
    $email_to_count{$email}++;
  }

  # Sort by count descending and return
  my @sorted = sort { $email_to_count{$b} <=> $email_to_count{$a} } keys %email_to_count;

  if ($limit && $limit > 0) {
    @sorted = splice(@sorted, 0, $limit);
  }

  my @results;
  foreach my $email (@sorted) {
    my $name = $email_to_name->{$email} || $email;
    push @results, { name => $name, count => $email_to_count{$email} };
  }

  return @results;
}

# Get line statistics (added, removed, net change)
sub get_line_stats {
  my ($since, $until, $path_spec) = @_;

  my $cmd = "git log --since='$since' --until='$until' --numstat --format=''";
  $cmd .= " -- $path_spec" if $path_spec;

  my @lines = `$cmd`;

  my ($added, $removed) = (0, 0);
  foreach my $line (@lines) {
    if ($line =~ /^(\d+)\s+(\d+)/) {
      $added += $1;
      $removed += $2;
    }
  }

  return ($added, $removed, $added - $removed);
}

# Count commits
sub count_commits {
  my ($since, $until, $path_spec) = @_;

  my $cmd = "git log --since='$since' --until='$until' --oneline";
  $cmd .= " -- $path_spec" if $path_spec;

  my @commits = `$cmd`;
  return scalar @commits;
}

# Count unique contributors
sub count_unique_contributors {
  my ($since, $until, $path_spec) = @_;

  my $cmd = "git log --since='$since' --until='$until' --format='%aE'";
  $cmd .= " -- $path_spec" if $path_spec;

  my @emails = `$cmd`;
  chomp @emails;

  my %unique;
  foreach my $email (@emails) {
    $unique{$email} = 1 if $email;
  }

  return scalar keys %unique;
}

# Calculate median
sub get_median {
  my @values = sort { $a <=> $b } @_;
  return 0 unless @values;

  my $mid = int(@values / 2);
  if (@values % 2) {
    return $values[$mid];
  } else {
    return ($values[$mid-1] + $values[$mid]) / 2;
  }
}

# Calculate average
sub get_average {
  my @values = @_;
  return 0 unless @values;

  my $sum = 0;
  $sum += $_ for @values;
  return $sum / scalar(@values);
}

# Validate date format
sub validate_date {
  my $date = shift;
  return $date =~ /^\d{4}-\d{2}-\d{2}$/;
}

# Get default dates (YTD)
sub get_default_dates {
  my $year = strftime("%Y", localtime);
  my $since = "$year-01-01";
  my $until = strftime("%Y-%m-%d", localtime);
  return ($since, $until);
}

# Setup output (returns use_stdout flag and final filename)
sub setup_output {
  my ($output_file, $since, $until, $prefix) = @_;

  my $final_output_file;
  my $use_stdout = 0;

  if ($output_file eq '-') {
    # Use stdout
    $use_stdout = 1;
    $final_output_file = undef;
  } elsif ($output_file) {
    # User specified a file
    $final_output_file = $output_file;
  } else {
    # Default: save to tmp/ with date-based filename
    mkdir 'tmp' unless -d 'tmp';
    $final_output_file = "tmp/$prefix-$since-to-$until.md";
  }

  # Redirect output if writing to file
  if (!$use_stdout) {
    open(STDOUT, '>', $final_output_file) or die "ERROR: Cannot write to $final_output_file: $!\n";
  }

  return ($use_stdout, $final_output_file);
}

# Finish output (close file and print success message)
sub finish_output {
  my ($use_stdout, $final_output_file) = @_;

  if (!$use_stdout) {
    close(STDOUT);
    print STDERR "Report saved to $final_output_file\n";
  }
}

1;

