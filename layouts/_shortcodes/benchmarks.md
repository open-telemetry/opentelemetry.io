{{/* Markdown-output variant of the benchmarks shortcode: the charts are drawn
  in the browser and the page prose links the data, so the Markdown version
  carries nothing here rather than the empty chart markup Hugo would emit from
  the HTML template. */ -}}
{{ $data := .Get "data" -}}
{{ if not $data -}}
  {{ errorf "%s: the benchmarks shortcode needs a `data` argument, the URL of a github-action-benchmark data.js." .Position -}}
{{ end -}}
