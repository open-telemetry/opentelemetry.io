{{/* Markdown-output variant of the benchmarks shortcode: the HTML variant's
  charts are rendered in the browser from a remote data file, so the page's
  Markdown version says what the charts show and where the data is, instead of
  carrying the empty chart markup. */ -}}
{{ $data := .Get "data" -}}
{{ if not $data -}}
  {{ errorf "%s: the benchmarks shortcode needs a `data` argument, the URL of a github-action-benchmark data.js." .Position -}}
{{ end -}}
{{ i18n "benchmarks_md_summary" (dict "Data" $data) }}
