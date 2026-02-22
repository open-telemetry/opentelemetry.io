{{/*
cSpell:ignore: cial cond
*/ -}}
{{ $data := sort (sort (sort $.Site.Data.ecosystem.vendors "name") "oss" "desc") "commercial" -}}

| Організація[^org] | OSS | Ком&shy;мер&shy;цій&shy;на | Native OTLP | Дізнатись більше  |
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
  {{- cond .nativeOTLP "Yes" "No" }} |
  {{- /* */}} [{{ $shortUrl }}]({{ .url }}) |
{{- end }}

[^org]: Організації згруповані наступним чином на основі їхньої підтримки OTel:
    - Чистий OSS
    - Змішаний OSS/комерційний
    - Комерційні
    - За алфавітом всередині кожної групи
