{{/*
cSpell:ignore: bution cial cond distri
*/ -}}
{{ $data := sort (sort (sort $.Site.Data.ecosystem.vendors "name") "oss" "desc") "commercial" -}}

| Organization[^org] | OSS | Com&shy;mer&shy;cial | Distri&shy;bution | Native OTLP | Learn more  |
| ----------- | ----------- | ---------- | ----------------- | ----------- | ----------- |
{{- range $data }}
  {{- $shortUrl := .shortUrl -}}
  {{- if not $shortUrl  }}
      {{- $tmp := split (replace .url "https://" "") "/"  }}
      {{- $shortUrl = (index $tmp 0) }}
      {{- if gt (len $tmp) 1  }}
          {{- $shortUrl = printf "%s/…" $shortUrl  }}
      {{- end }}
  {{- end }}
  {{/* Each line below is a column: */ -}}
  {{ .name }} |
  {{- cond .oss "Yes" "No" }} |
  {{- cond .commercial "Yes" "No" }} |
  {{- cond .distribution "Yes" "No" }} |
  {{- cond .nativeOTLP "Yes" "No" }} |
  {{- /* */}} [{{ $shortUrl }}]({{ .url }}) |
{{- end }}

[^org]: Organizations are grouped as follows based on their OTel support:
    - Pure OSS
    - Mixed OSS/commercial
    - Commercial
    - Alphabetical within each group
