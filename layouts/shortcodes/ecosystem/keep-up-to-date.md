{{ $what := .Get 0 | default "organization" -}}

## Keeping {{ $what }} information current

Ensure that you keep your {{ $what }} information up-to-date, otherwise we might
update or remove it from the registry or [ecosystem list]. For details, see
[Keeping registry information current](../registry/updating/).

[ecosystem list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem
