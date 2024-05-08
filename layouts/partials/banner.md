{{/* cSpell:ignore contribfest */ -}}
{{ with .Params.banners }}
  {{ $currentDate := now.Format "2006-01-02" }}
  <div class="o-banners">
    {{ range . }}
      {{ if and (or (not .from) (ge $currentDate .from)) (or (not .to) (le $currentDate .to)) }}
        <div class="o-banner">
          <!-- prettier-ignore -->
          <i class="{{ .icon | default `fas fa-bullhorn` }}"></i> 
          {{ .text | markdownify }}
        </div>
      {{ end }}
    {{ end }}
  {.pt-0}  
  </div>
{{ end }}