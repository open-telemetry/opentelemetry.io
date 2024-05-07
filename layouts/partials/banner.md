{{/* cSpell:ignore contribfest */ -}}
{{ if .Params.show_banner -}}
  {{ $currentDate := time.Now | time.Format "2006-01-02" }}
  {{ $sortedAndFiltered := slice }}

  {{/* Sort entries by endDate and filter out past ones */}}
  {{ $sorted := sort .Site.Data.banners "endDate" }}
  {{ range $sorted }}
    {{ if ge .endDate $currentDate }}
      {{ $sortedAndFiltered = $sortedAndFiltered | append . }}
    {{ end }}
  {{ end }}

  {{/* Limit to the two entries with the closest end dates */}}
  {{ $entriesToShow := first 2 $sortedAndFiltered }}

<div class="o-banner">

  {{ range $entriesToShow }}

<i class="{{ .icon | default 'fas fa-bullhorn' }}"></i> 
{{ .message }}

  {{ end }}
{.pt-0}

</div>
{{ end -}}
