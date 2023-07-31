{{/* cSpell:ignore getenv substr */ -}}

{{ $branch := os.Getenv "BRANCH" -}}
{{ $buildID := os.Getenv "BUILD_ID" -}}
{{ $commitRef := os.Getenv "COMMIT_REF" -}}
{{ $deployID := os.Getenv "DEPLOY_ID" -}}
{{ $isNetlifyBuilt := os.Getenv "NETLIFY" | default false -}}
{{ $isPR := os.Getenv "PULL_REQUEST" -}}
{{ $reviewID := os.Getenv "REVIEW_ID" -}}

Netlify build information:

| Attribute | Value |
|---|---|
Netlify built | `{{ $isNetlifyBuilt }}`
{{/* */ -}}

{{/* Don't show timestamp for local builds to avoid affecting site diffs. */ -}}
{{ with $isNetlifyBuilt -}}
  Date/time[^date] | {{ now.Format "2006-01-02 15:04" }}
{{ end -}}
{{/* */ -}}

{{ with $buildID -}}
  ID | `{{.}}`
{{ end -}}
{{/* */ -}}

{{ with $deployID -}}
  Deploy log | [{{ . }}](https://app.netlify.com/teams/opentelemetry/builds/{{ . }})
{{ end -}}
{{/* */ -}}

{{ with $reviewID -}}
  Build context |
  {{- if $isPR -}}
    [PR #{{ . }}](https://github.com/open-telemetry/opentelemetry.io/pull/{{ . }})
  {{ else -}}
    merge `{{ . }}`
  {{ end -}}
{{ end -}}
{{/* */ -}}

Deploy context | {{ os.Getenv "CONTEXT" | default "local" }}
{{/* */ -}}

{{ with $commitRef -}}
  Commit | [@{{substr . 0 7  }}](https://github.com/open-telemetry/opentelemetry.io/commit//{{ . }})
{{ end -}}
{{/* */ -}}

{{ with $branch -}}
  Branch | `{{ . }}`
{{ end -}}
{{/* End of table */}}

[^date]: Approximate build timestamp.
