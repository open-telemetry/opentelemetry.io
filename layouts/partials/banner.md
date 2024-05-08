<!-- cSpell:ignore contribfest markdownify -->
{{ if .Params.show_banner }}
{{ $sorted := sort .Params.banners "to" }}
{{ with $sorted }}
  {{ $currentDate := now.Format "2006-01-02" }}
<div class="o-banner">
    {{ range . }}
      {{ if and (or (not .from) (ge $currentDate .from)) (or (not .to) (le $currentDate .to)) }}
<!-- prettier-ignore -->
<i class="{{ .icon | default `fas fa-bullhorn` }}"></i> 
{{ .text | markdownify }}
      {{ end }}
    {{ end }}
{.pt-0}  
</div>
{{ end }}
{{ end }}