#!/usr/bin/perl -w
#
# Generate repository statistics report
#
# Usage: repo.pl [options]
#
# This script generates a Markdown report with repository-wide statistics
# including contributor counts, commit activity, and code changes. By default,
# it saves the report to tmp/repo-stats-YYYY-MM-DD-to-YYYY-MM-DD.md. For usage
# information, run with --help.
#
# Examples:
#   # Generate year-to-date (YTD) statistics
#   ./scripts/stats/repo.pl
#
#   # Generate statistics for a specific period
#   ./scripts/stats/repo.pl --since 2024-01-01 --until 2024-12-31

use strict;
use warnings;
use diagnostics;
use Getopt::Long;
use POSIX qw(strftime);

# Command-line options
my $since_date = "";
my $until_date = "";
my $output_file = "";
my $help = 0;

sub usage {
  my $exit_code = shift || 0;
  print STDERR <<EOS;
Usage: repo.pl [options]

  Generate a Markdown report with repository-wide statistics.

Options:

  --since DATE    Start date for statistics (format: YYYY-MM-DD)
                  Default: January 1 of current year

  --until DATE    End date for statistics (format: YYYY-MM-DD)
                  Default: today

  -o, --output FILE   Output destination
                      Default: tmp/repo-stats-YYYY-MM-DD-to-YYYY-MM-DD.md
                      Use '-' to output to stdout

  -h, --help      Show this help message

Examples:

  # Generate YTD (year-to-date) statistics (saves to tmp/)
  repo.pl

  # Generate statistics for 2024
  repo.pl --since 2024-01-01 --until 2024-12-31

  # Output to stdout
  repo.pl --output -

  # Save to custom file
  repo.pl --output my-report.md

EOS
  exit $exit_code;
}

sub process_args {
  GetOptions(
    'since=s' => \$since_date,
    'until=s' => \$until_date,
    'o|output=s' => \$output_file,
    'h|help' => \$help,
  ) or usage(1);

  usage(0) if $help;

  # Set defaults
  if (!$since_date) {
    my $year = strftime("%Y", localtime);
    $since_date = "$year-01-01";
  }

  if (!$until_date) {
    $until_date = strftime("%Y-%m-%d", localtime);
  }

  # Validate date formats
  if ($since_date !~ /^\d{4}-\d{2}-\d{2}$/) {
    die "ERROR: Invalid --since date format: $since_date (expected YYYY-MM-DD)\n";
  }

  if ($until_date !~ /^\d{4}-\d{2}-\d{2}$/) {
    die "ERROR: Invalid --until date format: $until_date (expected YYYY-MM-DD)\n";
  }
}

sub get_author_consolidation {
  my ($since, $until) = @_;

  my %email_to_name;
  my %email_to_date;

  # Get all commits with email, name, and date
  my @commits = `git log --since='$since' --until='$until' --format='%aE|%aN|%ai'`;
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

sub get_consolidated_contributors {
  my ($since, $until, $limit) = @_;

  my $email_to_name = get_author_consolidation($since, $until);
  my %email_to_count;

  # Count commits per email
  my @emails = `git log --since='$since' --until='$until' --format='%aE'`;
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

sub get_line_stats {
  my ($since, $until) = @_;

  my @lines = `git log --since='$since' --until='$until' --numstat --format=''`;

  my ($added, $removed) = (0, 0);
  foreach my $line (@lines) {
    if ($line =~ /^(\d+)\s+(\d+)/) {
      $added += $1;
      $removed += $2;
    }
  }

  return ($added, $removed, $added - $removed);
}

sub count_commits {
  my ($since, $until) = @_;

  my @commits = `git log --since='$since' --until='$until' --oneline`;
  return scalar @commits;
}

sub count_files {
  my ($since, $until, $filter) = @_;

  my $cmd = "git log --since='$since' --until='$until' --name-only --format=''";
  $cmd .= " --diff-filter=$filter" if $filter;

  my @files = `$cmd`;
  chomp @files;
  @files = grep { $_ ne '' } @files;

  if ($filter) {
    return scalar @files;
  } else {
    # Count unique files
    my %unique;
    foreach my $file (@files) {
      $unique{$file} = 1;
    }
    return scalar keys %unique;
  }
}

sub count_unique_contributors {
  my ($since, $until) = @_;

  my @emails = `git log --since='$since' --until='$until' --format='%aE'`;
  chomp @emails;

  my %unique;
  foreach my $email (@emails) {
    $unique{$email} = 1 if $email;
  }

  return scalar keys %unique;
}

sub get_top_directories {
  my ($since, $until, $limit) = @_;

  my @files = `git log --since='$since' --until='$until' --name-only --format=''`;
  chomp @files;

  my %dir_counts;
  foreach my $file (@files) {
    next if $file eq '';
    my ($dir) = split /\//, $file;
    $dir_counts{$dir}++ if $dir;
  }

  my @sorted = sort { $dir_counts{$b} <=> $dir_counts{$a} } keys %dir_counts;
  @sorted = splice(@sorted, 0, $limit) if $limit;

  my @results;
  foreach my $dir (@sorted) {
    push @results, { dir => $dir, count => $dir_counts{$dir} };
  }

  return @results;
}

sub get_file_type_stats {
  my ($since, $until, $limit) = @_;

  my @files = `git log --since='$since' --until='$until' --name-only --format=''`;
  chomp @files;

  my %ext_counts;
  foreach my $file (@files) {
    next if $file eq '';
    my ($ext) = $file =~ /\.([^.\/]+)$/;
    $ext = $ext || '(no extension)';
    $ext_counts{$ext}++;
  }

  my @sorted = sort { $ext_counts{$b} <=> $ext_counts{$a} } keys %ext_counts;
  @sorted = splice(@sorted, 0, $limit) if $limit;

  my @results;
  foreach my $ext (@sorted) {
    push @results, { ext => $ext, count => $ext_counts{$ext} };
  }

  return @results;
}

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

sub get_average {
  my @values = @_;
  return 0 unless @values;

  my $sum = 0;
  $sum += $_ for @values;
  return $sum / scalar(@values);
}

sub days_between {
  my ($since, $until) = @_;

  # Parse dates
  my ($y1, $m1, $d1) = $since =~ /^(\d{4})-(\d{2})-(\d{2})$/;
  my ($y2, $m2, $d2) = $until =~ /^(\d{4})-(\d{2})-(\d{2})$/;

  # Convert to epoch time (approximate)
  use Time::Local;
  my $time1 = timelocal(0, 0, 0, $d1, $m1-1, $y1);
  my $time2 = timelocal(0, 0, 0, $d2, $m2-1, $y2);

  return int(($time2 - $time1) / 86400);
}

sub main {
  process_args();

  # Check if we're in a git repository
  system("git rev-parse --git-dir >/dev/null 2>&1");
  die "ERROR: Not in a git repository\n" if $? != 0;

  # Determine output destination
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
    $final_output_file = "tmp/repo-stats-$since_date-to-$until_date.md";
  }

  # Redirect output if writing to file
  if (!$use_stdout) {
    open(STDOUT, '>', $final_output_file) or die "ERROR: Cannot write to $final_output_file: $!\n";
  }

  # Generate report
  print "# Repository Statistics Report\n\n";
  print "**Period:** $since_date to $until_date\n\n";

  # =================================================================
  # Section 1: Volume Metrics (Quantitative Impact)
  # =================================================================
  print "## 1. Volume Metrics (Quantitative Impact)\n\n";

  my $total_commits = count_commits($since_date, $until_date);
  print "- **Total commits**: $total_commits commits\n";

  my ($lines_added, $lines_removed, $net_change) = get_line_stats($since_date, $until_date);
  print "- **Lines added**: $lines_added\n";
  print "- **Lines removed**: $lines_removed\n";
  print "- **Net change**: $net_change lines\n";

  my $files_changed = count_files($since_date, $until_date);
  print "- **Files changed**: $files_changed unique files modified\n";

  my $new_files = count_files($since_date, $until_date, 'A');
  print "- **New files**: $new_files files created\n";

  my $deleted_files = count_files($since_date, $until_date, 'D');
  print "- **Deleted files**: $deleted_files files removed\n\n";

  # =================================================================
  # Section 2: Community Growth Metrics (Participation)
  # =================================================================
  print "## 2. Community Growth Metrics (Participation)\n\n";

  my $unique_contributors = count_unique_contributors($since_date, $until_date);
  print "- **Unique contributors**: $unique_contributors individuals\n";

  # Contribution distribution
  my @contributors = get_consolidated_contributors($since_date, $until_date);
  if (@contributors) {
    my @counts = map { $_->{count} } @contributors;
    my $median = get_median(@counts);
    my $avg = sprintf("%.1f", get_average(@counts));
    print "- **Contribution distribution**: Median $median commits per contributor, Average $avg commits\n";
  }

  # Commit frequency
  if ($total_commits > 0) {
    my $days = days_between($since_date, $until_date);
    if ($days > 0) {
      my $commits_per_day = sprintf("%.1f", $total_commits / $days);
      print "- **Commit frequency**: $commits_per_day commits per day on average\n";
    }
  }
  print "\n";

  # =================================================================
  # Section 3: Repository Activity by Area
  # =================================================================
  print "## 3. Repository Activity by Area\n\n";
  print "**Top 10 directories by commit activity:**\n\n";

  my @top_dirs = get_top_directories($since_date, $until_date, 10);
  foreach my $stat (@top_dirs) {
    print "- **$stat->{dir}/**: $stat->{count} commits\n";
  }
  print "\n";

  # =================================================================
  # Section 4: Activity by File Type
  # =================================================================
  print "## 4. Activity by File Type\n\n";
  print "**Changes by file type:**\n\n";

  my @file_types = get_file_type_stats($since_date, $until_date, 15);
  foreach my $stat (@file_types) {
    my $ext_display = $stat->{ext} eq '(no extension)' ? $stat->{ext} : ".$stat->{ext}";
    print "- **$ext_display**: $stat->{count} file changes\n";
  }
  print "\n";

  # =================================================================
  # Section 5: Top Contributors (Recognition)
  # =================================================================
  print "## 5. Top Contributors (Recognition)\n\n";
  print "**Top contributors across the repository:**\n\n";

  my @top_contributors = get_consolidated_contributors($since_date, $until_date, 20);
  foreach my $contrib (@top_contributors) {
    print "- **$contrib->{name}**: $contrib->{count} commits\n";
  }
  print "\n";

  print "---\n\n";
  my $timestamp = strftime("%Y-%m-%d %H:%M:%S", localtime);
  print "*Report generated on $timestamp*\n";

  # Close file and print success message
  if (!$use_stdout) {
    close(STDOUT);
    print STDERR "Report saved to $final_output_file\n";
  }
}

main();

