#!/usr/bin/perl -w

use Getopt::Long;

my $quiet = 0;
GetOptions('q' => \$quiet);

BEGIN {
    my $num_days_in_past = 2;
    my $seconds_in_a_day = 86400; # Number of seconds in a day
    my $year_offset = 1900;       # Offset for year in gmtime
    my $month_offset = 1;         # Offset for month in gmtime

    my @gmtime = gmtime(time - $num_days_in_past * $seconds_in_a_day);
    our $cut_off_date = sprintf "%04d-%02d-%02d", $gmtime[5] + $year_offset, $gmtime[4] + $month_offset, $gmtime[3];
}

while (<>) {
    if (/^expiryDate:\s*([^#\s]+)((?i)\s*#\s*keep)?/ && $1 le $cut_off_date) {
        my $expiryDate = $1;
        my $keep = ($2 || '') =~ /keep/i;
        next if $keep && $quiet;

        print "$ARGV";
        if (!$quiet) {
          printf "\tEXPIRED ON %s", $expiryDate;
          printf " (KEEP)" if $keep;
        }
        print "\n";
    }
}
