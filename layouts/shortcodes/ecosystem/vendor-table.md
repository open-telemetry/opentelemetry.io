{{/* cSpell:ignore distri bution cond */}}
{{ $data := sort (sort (sort $.Site.Data.ecosystem.vendors "name") "oss" "desc") "commercial" }}
| Organization[^1] | Open Source | Commercial | Distri&shy;bution | Native OTLP | Learn more  |
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
{{ .name }} | {{ cond (.oss) "Yes" "No" }} | {{ cond (.commercial) "Yes" "No" }} | {{ cond (.distribution) "Yes" "No" }} | {{ cond (.nativeOTLP) "Yes" "No" }} | [{{ $shortUrl }}]({{ .url }}) |
{{- end }}

[^1]: Organizations are listed as follows:
    - pure OSS offerings
    - mixed offerings
    - commercial offerings
    - alphabetical within those groups
