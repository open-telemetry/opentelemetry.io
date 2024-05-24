{{/* cSpell:ignore markdownify */ -}}
{{ if and .Params.show_banner (gt (len (.Params.banners | default slice)) 0) }}
  {{ $limit := .Params.limit_banner | default 2 }}
  {{ $sorted := sort .Params.banners "to" }}
  {{ $currentDate := now.Format "2006-01-02" }}
  {{ $filtered := slice }}
  {{ range $sorted }}
    {{ if le $currentDate .to }}
      {{ if lt (len $filtered) $limit }}
        {{ $filtered = $filtered | append . }}
      {{ end }}
    {{ end }}
  {{ end }}
<div class="o-banner">
    {{ range $filtered }}
<!-- prettier-ignore -->
{{ .message | markdownify }}
    {{ end }}
</div>
{{ end -}}