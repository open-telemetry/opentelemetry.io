#!/usr/bin/perl -w
#
# Generate localization statistics report
#
# Usage: l10n.pl [options]
#
# This script generates a Markdown report with localization statistics including
# contributor counts, commit activity, and translation coverage. By default, it
# saves the report to tmp/l10n-stats-YYYY-MM-DD-to-YYYY-MM-DD.md. For usage
# information, run with --help.
#
# Examples:
#   # Generate year-to-date (YTD) statistics
#   ./scripts/stats/l10n.pl
#
#   # Generate statistics for 2024
#   ./scripts/stats/l10n.pl --since 2024-01-01 --until 2024-12-31

use strict;
use warnings;
use diagnostics;
use Getopt::Long;
use POSIX qw(strftime);
use FindBin qw($RealBin);
use lib $RealBin;
use StatsCommon;

# Configuration
my $DEFAULT_LANG = "en";
my $CONTENT_DIR = "content";

# Command-line options
my $since_date = "";
my $until_date = "";
my $output_file = "";
my $help = 0;

sub usage {
  my $exit_code = shift || 0;
  print STDERR <<EOS;
Usage: l10n.pl [options]

  Generate a Markdown report with localization statistics.

Options:

  --since DATE    Start date for statistics (format: YYYY-MM-DD)
                  Default: January 1 of current year

  --until DATE    End date for statistics (format: YYYY-MM-DD)
                  Default: today

  -o, --output FILE   Output destination
                      Default: tmp/l10n-stats-YYYY-MM-DD-to-YYYY-MM-DD.md
                      Use '-' to output to stdout

  -h, --help      Show this help message

Examples:

  # Generate YTD (year-to-date) statistics (saves to tmp/)
  l10n.pl

  # Generate statistics for 2024
  l10n.pl --since 2024-01-01 --until 2024-12-31

  # Output to stdout
  l10n.pl --output -

  # Save to custom file
  l10n.pl --output my-report.md

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

sub get_locales {
  opendir(my $dh, $CONTENT_DIR) or die "Cannot open $CONTENT_DIR: $!\n";
  my @locales = sort grep {
    $_ ne '.' && $_ ne '..' && $_ ne $DEFAULT_LANG && -d "$CONTENT_DIR/$_"
  } readdir($dh);
  closedir($dh);
  return @locales;
}

sub count_files_added {
  my ($since, $until, $path_spec, $pattern) = @_;

  my $cmd = "git log --since='$since' --until='$until' --diff-filter=A --name-only --format=''";
  $cmd .= " -- $path_spec" if $path_spec;

  my @files = `$cmd`;

  if ($pattern) {
    @files = grep { /$pattern/ } @files;
  }

  return scalar @files;
}

sub count_current_files {
  my ($dir, $pattern) = @_;

  return 0 unless -d $dir;

  my @files = `find "$dir" -name "$pattern" 2>/dev/null`;
  return scalar @files;
}

sub check_locale_added {
  my ($locale, $since, $until) = @_;

  my $index_file = "$CONTENT_DIR/$locale/_index.md";
  my @log = `git log --since='$since' --until='$until' --diff-filter=A --name-only --format='' -- "$index_file" 2>/dev/null`;

  return scalar @log > 0;
}

sub main {
  process_args();

  # Check if we're in a git repository
  system("git rev-parse --git-dir >/dev/null 2>&1");
  die "ERROR: Not in a git repository\n" if $? != 0;

  # Check if content directory exists
  die "ERROR: Content directory not found: $CONTENT_DIR\n" unless -d $CONTENT_DIR;

  # Setup output
  my ($use_stdout, $final_output_file) = setup_output($output_file, $since_date, $until_date, 'l10n-stats');

  my @locales = get_locales();

  if (@locales == 0) {
    print "No localization directories found in $CONTENT_DIR/\n";
    finish_output($use_stdout, $final_output_file);
    return;
  }

  # Generate report
  print "# Localization Statistics Report\n\n";
  print "**Period:** $since_date to $until_date\n\n";

  # =================================================================
  # Section 1: Volume Metrics (Quantitative Impact)
  # =================================================================
  print "## 1. Volume Metrics (Quantitative Impact)\n\n";

  my $total_commits = count_commits($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'");
  print "- **Total commits**: $total_commits localization commits\n";

  my ($lines_added, $lines_removed, $net_change) = get_line_stats($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'");
  print "- **Lines added**: $lines_added\n";
  print "- **Lines removed**: $lines_removed\n";
  print "- **Net change**: $net_change lines\n";

  my $new_files = count_files_added($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'", '\\.md$');
  print "- **New markdown files**: $new_files translation files created\n\n";

  # =================================================================
  # Section 2: Community Growth Metrics (Participation)
  # =================================================================
  print "## 2. Community Growth Metrics (Participation)\n\n";

  my $unique_contributors = count_unique_contributors($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'");
  print "- **Unique contributors**: $unique_contributors individuals contributed to localization\n";

  # Check for new locales
  my @new_locales;
  foreach my $locale (@locales) {
    if (check_locale_added($locale, $since_date, $until_date)) {
      push @new_locales, $locale;
    }
  }

  if (@new_locales) {
    my $new_locales_str = join(", ", @new_locales);
    print "- **New locales launched**: " . scalar(@new_locales) . " ($new_locales_str)\n";
  } else {
    print "- **New locales launched**: 0\n";
  }

  # Contribution distribution
  my @contributors = get_consolidated_contributors($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'");
  if (@contributors) {
    my @counts = map { $_->{count} } @contributors;
    my $median = get_median(@counts);
    print "- **Contribution distribution**: Median $median commits per contributor\n";
  }
  print "\n";

  # =================================================================
  # Section 3: Translation Coverage (Completeness)
  # =================================================================
  print "## 3. Translation Coverage (Completeness)\n\n";

  my $en_count = count_current_files("$CONTENT_DIR/$DEFAULT_LANG", "*.md");
  print "**English baseline**: $en_count files\n\n";

  print "| Locale | Current Files | Coverage | Files Added (Period) |\n";
  print "|--------|--------------|----------|---------------------|\n";

  foreach my $locale (@locales) {
    my $current_count = count_current_files("$CONTENT_DIR/$locale", "*.md");
    my $coverage = $en_count > 0 ? int(($current_count / $en_count) * 100) : 0;
    my $files_added = count_files_added($since_date, $until_date, "content/$locale/", '\\.md$');

    print "| $locale | $current_count | ${coverage}% | $files_added |\n";
  }
  print "\n";

  # =================================================================
  # Section 4: Activity by Locale (Momentum)
  # =================================================================
  print "## 4. Activity by Locale (Momentum)\n\n";
  print "**Commits by locale (ranked):**\n\n";

  # Collect commit counts per locale
  my @locale_stats;
  foreach my $locale (@locales) {
    my $count = count_commits($since_date, $until_date, "content/$locale/");
    push @locale_stats, { locale => $locale, count => $count };
  }

  # Sort by count descending
  @locale_stats = sort { $b->{count} <=> $a->{count} } @locale_stats;

  foreach my $stat (@locale_stats) {
    my $locale = $stat->{locale};
    my $count = $stat->{count};

    print "- **$locale**: $count commits\n";

    # Top 3 contributors for this locale
    my @top_contributors = get_consolidated_contributors($since_date, $until_date, "content/$locale/", 3);
    foreach my $contrib (@top_contributors) {
      print "  - $contrib->{name}: $contrib->{count} commits\n";
    }
    print "\n";
  }

  # =================================================================
  # Section 5: Top Contributors (Recognition)
  # =================================================================
  print "## 5. Top Contributors (Recognition)\n\n";
  print "**Top contributors across all locales:**\n\n";

  my @top_overall = get_consolidated_contributors($since_date, $until_date, "'content/*/[!_]*' ':!content/en/'", 15);
  foreach my $contrib (@top_overall) {
    print "- **$contrib->{name}**: $contrib->{count} commits\n";
  }
  print "\n";

  print "---\n\n";
  my $timestamp = strftime("%Y-%m-%d %H:%M:%S", localtime);
  print "*Report generated on $timestamp*\n";

  # Finish output
  finish_output($use_stdout, $final_output_file);
}

main();

