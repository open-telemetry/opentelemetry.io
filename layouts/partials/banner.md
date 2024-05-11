<!-- cSpell:ignore contribfest markdownify -->
{{ if .Params.show_banner }}
  {{ $limit := .Params.limit_banner | default 2 }}
  {{ $sorted := sort .Params.banners "to" }}
  {{ $currentDate := now.Format "2006-01-02" }}
  {{ $filtered := slice }}
  {{ range $sorted }}
    {{ if and (or (not .from) (ge $currentDate .from)) (or (not .to) (le $currentDate .to)) }}
      {{ if lt (len $filtered) $limit }}
        {{ $filtered = $filtered | append . }}
      {{ end }}
    {{ end }}
  {{ end }}
<div class="o-banner">
    {{ range $filtered }}
<!-- prettier-ignore -->
<i class="{{ .icon | default `fas fa-bullhorn` }}"></i> 
{{ .text | markdownify }}
    {{ end }}
</div>
{{ end }}