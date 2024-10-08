{{ $pages := slice }}
{{ range $key,$value := $.Site.Data.instrumentation -}}
    {{ if eq $key "dotnet" -}}
    {{ with $.Site.GetPage "/docs/languages/net/traces-api" -}}
        {{ $pages = $pages | append (dict "lang" $value "page" .) }}
    {{ end }}
    {{ with $.Site.GetPage "/docs/languages/net/metrics-api" -}}
        {{ $pages = $pages | append (dict "lang" $value "page" .) }}
    {{ end }}
    {{ else -}}
    {{ with $.Site.GetPage (printf "/docs/languages/%s/api" $key) -}}
        {{ $pages = $pages | append (dict "lang" $value "page" .) }}
    {{ end }}
    {{ end -}}
{{ end -}}

{{ range $pages }}
{{ $title := replaceRE `API reference` "" .page.Title -}}

- [
    {{- .lang.name -}}
    {{ with $title }} &mdash; {{ . }} {{- end -}}
  ](
    {{- .page.Permalink -}}
  )

{{- end -}}
