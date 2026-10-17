{{/* Markdown-output variant of the benchmarks shortcode: the charts are drawn
  in the browser and the page prose links the data, so the Markdown version
  carries nothing here rather than the empty chart markup Hugo would emit from
  the HTML template. */ -}}
{{ $data := .Page.Params.benchmark_data_url -}}
{{ if not $data -}}
  {{ errorf "%s: the benchmarks shortcode reads the page's `benchmark_data_url` param, the URL of a github-action-benchmark data.js; set it in the front matter." .Position -}}
{{ end -}}
