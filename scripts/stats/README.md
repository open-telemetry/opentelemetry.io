# Statistics scripts

Perl scripts for generating git statistics reports.

- `l10n.pl` - Localization statistics (commits, coverage, contributors per
  locale)
- `repo.pl` - Repository-wide statistics (commits, activity by area,
  contributors)
- `StatsCommon.pm` - Shared module used by both scripts

Run with `--help` for usage. By default, saves reports to `tmp/` with date-based
filenames.
