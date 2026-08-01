#!/usr/bin/perl -w
#
# Benchmark render-link hook performance across multiple Hugo builds.
#
# Usage:
#   perl scripts/stats/bench-render-link.pl [RUNS] [LABEL]
#   perl scripts/stats/bench-render-link.pl compare LABEL_A LABEL_B
#
# Hugo --templateMetrics output format:
#   TOTAL_TIME  AVG_TIME  MAX_TIME  COUNT  TEMPLATE_NAME
#
# cSpell:ignore outdir binmode

use strict;
use warnings;
use utf8;
use File::Path qw(make_path);
use POSIX qw(strftime);

binmode STDOUT, ':utf8';

my $OUTDIR = 'tmp/bench-results';
make_path($OUTDIR);

# Template patterns used to identify metrics lines
my %PATTERNS = (
    global  => qr{_markup/render-link\.html},
    spec    => qr{docs/specs/_markup/render-link\.html},
    partial => qr{_partials/hooks/render-link\.html},
);

sub normalize_to_ms {
    my ($val) = @_;
    return 0 unless defined $val && $val ne '';
    if    ($val =~ /^([\d.]+)µs$/) { return $1 / 1000 }
    elsif ($val =~ /^([\d.]+)ms$/) { return $1 }
    elsif ($val =~ /^([\d.]+)s$/)  { return $1 * 1000 }
    return $val;
}

sub tee {
    my ($fh, $msg) = @_;
    print $msg;
    print $fh $msg;
}

sub avg {
    my @vals = @_;
    return 0 unless @vals;
    my $sum = 0;
    $sum += $_ for @vals;
    return $sum / scalar @vals;
}

# --- Compare mode ------------------------------------------------------------

if (defined $ARGV[0] && $ARGV[0] eq 'compare') {
    die "Usage: $0 compare LABEL_A LABEL_B\n" unless @ARGV == 3;
    my ($label_a, $label_b) = @ARGV[1, 2];

    my $file_a = "$OUTDIR/$label_a.txt";
    my $file_b = "$OUTDIR/$label_b.txt";
    for ($file_a, $file_b) {
        die "Error: $_ not found\n" unless -f $_;
    }

    sub parse_averages {
        my ($file) = @_;
        my %d = map { $_ => 0 } qw(g_total g_calls g_pc s_total s_calls s_pc
                                     p_total p_calls p_pc build);
        open my $fh, '<:utf8', $file or die "Cannot open $file: $!\n";
        while (<$fh>) {
            if (/global render-link:\s+([\d.]+)ms total,\s+(\d+) calls,\s+([\d.]+)µs/) {
                @d{qw(g_total g_calls g_pc)} = ($1, $2, $3);
            } elsif (/spec render-link:\s+([\d.]+)ms total,\s+(\d+) calls,\s+([\d.]+)µs/) {
                @d{qw(s_total s_calls s_pc)} = ($1, $2, $3);
            } elsif (/partial render-link:\s+([\d.]+)ms total,\s+(\d+) calls,\s+([\d.]+)µs/) {
                @d{qw(p_total p_calls p_pc)} = ($1, $2, $3);
            } elsif (/build total:\s+([\d.]+)ms/) {
                $d{build} = $1;
            }
        }
        close $fh;
        return \%d;
    }

    my $a = parse_averages($file_a);
    my $b = parse_averages($file_b);

    sub fmt_delta {
        my ($va, $vb, $unit) = @_;
        my $d = $vb - $va;
        my $pct = $va != 0 ? $d / $va * 100 : 0;
        return sprintf("%.1f%s (%.1f%%)", $d, $unit, $pct);
    }

    sub fmt_val {
        my ($v, $unit) = @_;
        return (!defined $v || $v == 0) ? "—" : "$v$unit";
    }

    my $outfile = "$OUTDIR/compare-${label_a}-vs-${label_b}.md";

    my @lines;
    push @lines, "# Benchmark comparison: $label_a vs $label_b";
    push @lines, "";
    push @lines, "| Metric | $label_a | $label_b | Delta |";
    push @lines, "|--------|-------:|-------:|------:|";

    push @lines, sprintf("| **Global hook** calls | %s | %s | |",
        $a->{g_calls}, $b->{g_calls});
    push @lines, sprintf("| **Global hook** total | %sms | %sms | %s |",
        $a->{g_total}, $b->{g_total}, fmt_delta($a->{g_total}, $b->{g_total}, 'ms'));
    push @lines, sprintf("| **Global hook** per call | %sµs | %sµs | %s |",
        $a->{g_pc}, $b->{g_pc}, fmt_delta($a->{g_pc}, $b->{g_pc}, "µs"));

    push @lines, sprintf("| **Spec hook** calls | %s | %s | |",
        $a->{s_calls}, $b->{s_calls});
    push @lines, sprintf("| **Spec hook** total | %sms | %sms | %s |",
        $a->{s_total}, $b->{s_total}, fmt_delta($a->{s_total}, $b->{s_total}, 'ms'));
    push @lines, sprintf("| **Spec hook** per call | %sµs | %sµs | %s |",
        $a->{s_pc}, $b->{s_pc}, fmt_delta($a->{s_pc}, $b->{s_pc}, "µs"));

    if ($a->{p_calls} || $b->{p_calls}) {
        push @lines, sprintf("| **Partial** calls | %s | %s | |",
            fmt_val($a->{p_calls}, ''), fmt_val($b->{p_calls}, ''));
        push @lines, sprintf("| **Partial** total | %s | %s | — |",
            fmt_val($a->{p_total}, 'ms'), fmt_val($b->{p_total}, 'ms'));
        push @lines, sprintf("| **Partial** per call | %s | %s | — |",
            fmt_val($a->{p_pc}, "µs"), fmt_val($b->{p_pc}, "µs"));
    }

    push @lines, sprintf("| **Build total** | %sms | %sms | %s |",
        $a->{build}, $b->{build}, fmt_delta($a->{build}, $b->{build}, 'ms'));

    my $output = join("\n", @lines) . "\n";
    print $output;

    open my $fh, '>:utf8', $outfile or die "Cannot write $outfile: $!\n";
    print $fh $output;
    close $fh;

    print "\nSaved to $outfile\n";
    exit 0;
}

# --- Benchmark mode -----------------------------------------------------------

my $runs  = $ARGV[0] || 5;
my $label = $ARGV[1] || 'baseline';
my $outfile = "$OUTDIR/$label.txt";

open my $fh, '>:utf8', $outfile or die "Cannot write $outfile: $!\n";

my $date = strftime('%Y-%m-%dT%H:%M:%S%z', localtime);
tee($fh, "=== Benchmark: $label ($runs runs) ===\n");
tee($fh, "Date: $date\n\n");

print "Warmup run (npm run build)...\n";
system('npm run build > /dev/null 2>&1') == 0
    or die "Warmup build failed\n";

my (@g_totals, @s_totals, @p_totals, @g_counts, @s_counts, @p_counts, @builds);

for my $i (1 .. $runs) {
    print "Run $i/$runs...\n";
    my $output = `npx hugo --cleanDestinationDir --templateMetrics 2>&1`;

    my %metrics;
    for my $line (split /\n/, $output) {
        for my $key (qw(spec global partial)) {
            if ($line =~ $PATTERNS{$key}) {
                my @fields = split ' ', $line;
                $metrics{$key} = {
                    total => normalize_to_ms($fields[0]),
                    count => $fields[3],
                };
                last;
            }
        }
        if ($line =~ /Total in (\d+) ms/) {
            $metrics{build} = $1;
        }
    }

    my $g = $metrics{global} // { total => 0, count => 0 };
    my $s = $metrics{spec}   // { total => 0, count => 0 };
    my $p = $metrics{partial};
    my $build = $metrics{build} // 0;

    my $msg = sprintf("  Run %d: global=%.1fms (%s calls) spec=%.1fms (%s calls)",
        $i, $g->{total}, $g->{count}, $s->{total}, $s->{count});
    $msg .= sprintf(" partial=%.1fms (%s calls)", $p->{total}, $p->{count}) if $p;
    $msg .= sprintf(" build=%sms\n", $build);
    tee($fh, $msg);

    push @g_totals, $g->{total};
    push @g_counts, $g->{count};
    push @s_totals, $s->{total};
    push @s_counts, $s->{count};
    push @builds,   $build;
    if ($p) {
        push @p_totals, $p->{total};
        push @p_counts, $p->{count};
    }
}

tee($fh, "\n");

my $avg_g_total = avg(@g_totals);
my $avg_s_total = avg(@s_totals);
my $avg_build   = avg(@builds);
my $avg_g_count = avg(@g_counts);
my $avg_s_count = avg(@s_counts);
my $avg_g_pc    = $avg_g_count > 0 ? $avg_g_total * 1000 / $avg_g_count : 0;
my $avg_s_pc    = $avg_s_count > 0 ? $avg_s_total * 1000 / $avg_s_count : 0;

tee($fh, "Averages ($runs runs):\n");
tee($fh, sprintf("  global render-link: %.1fms total, %d calls, %.1fµs/call\n",
    $avg_g_total, $avg_g_count, $avg_g_pc));
tee($fh, sprintf("  spec render-link:   %.1fms total, %d calls, %.1fµs/call\n",
    $avg_s_total, $avg_s_count, $avg_s_pc));

if (@p_counts) {
    my $avg_p_total = avg(@p_totals);
    my $avg_p_count = avg(@p_counts);
    my $avg_p_pc    = $avg_p_count > 0 ? $avg_p_total * 1000 / $avg_p_count : 0;
    tee($fh, sprintf("  partial render-link: %.1fms total, %d calls, %.1fµs/call\n",
        $avg_p_total, $avg_p_count, $avg_p_pc));
}

tee($fh, sprintf("  build total:        %dms\n", $avg_build));

close $fh;
print "\nResults saved to $outfile\n";
