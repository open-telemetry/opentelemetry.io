{{ $data := $.Site.Data.instrumentation.languages }}

{{ range $data }}
  {{ $path := printf "docs/instrumentation/%s/sampling.md" .urlName }}
  {{ $name := .name }}
  {{ with site.GetPage $path }}- [{{ $name }}]({{ .RelPermalink }}){{ end }}
{{ end }}
