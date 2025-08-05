{{ $pages := slice -}}
{{ range $key,$value := $.Site.Data.instrumentation -}}
    {{ if eq $key "dotnet" -}}
      {{ with $.Site.GetPage "/docs/languages/dotnet/traces-api" -}}
          {{ $pages = $pages | append (dict "lang" $value "page" .) -}}
      {{ end }}
      {{ with $.Site.GetPage "/docs/languages/dotnet/metrics-api" -}}
          {{ $pages = $pages | append (dict "lang" $value "page" .) -}}
      {{ end }}
    {{ else -}}
      {{ with $.Site.GetPage (printf "/docs/languages/%s/api" $key) -}}
          {{ $pages = $pages | append (dict "lang" $value "page" .) -}}
      {{ end }}
    {{ end -}}
{{ end -}}

{{ range $pages }}
{{ $title := replaceRE `API reference` "" .page.Title -}}

- {{/* Encode the link directly as an <a> anchor to avoid unnecessary render-link hook checks */ -}}
  <a href="{{ .page.RelPermalink }}"
      {{- if and .page.Params.redirect (hasPrefix .page.Params.redirect "http") }} {{/* */ -}}
        target="_blank" rel="noopener" class="external-link"
      {{- end -}}
  >
    {{- .lang.name -}}
    {{ with $title }} &mdash; {{ . }} {{- end -}}
  </a>

{{- end -}}
