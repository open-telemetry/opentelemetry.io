{{ if .Params.show_banner }}
  {{ $currentDate := now.Format "2006-01-02" }}
  {{ $sortedAndFiltered := slice }}

  {{/* Sort entries by endDate and filter out past ones */}}
  {{ range $.Site.Data.banners }}
    {{ if ge .endDate $currentDate }}
      {{ $sortedAndFiltered = $sortedAndFiltered | append . }}
    {{ end }}
  {{ end }}
  {{ $sortedAndFiltered = $sortedAndFiltered | sort "endDate" }}

  {{/* Limit to the two entries with the closest end dates */}}
  {{ $entriesToShow := first 2 $sortedAndFiltered }}

  {{ range $entriesToShow }}
    <div class="o-banner">
      <i class="fas fa-bullhorn"></i> <a href="{{ .url }}">{{ .message }}</a>
    </div>
  {{ end }}
{{ end }}