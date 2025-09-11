{{ $langIndex := partial "docs/get-lang.html" (dict
    "page" .Page
    "lang" (.Get 0)
    "componentName" "native-libraries.md")
-}}
{{ $howMany := .Get 1 | default 10 -}}

{{ $langData := index $.Site.Data.instrumentation $langIndex -}}
{{ $integrations := slice -}}

{{ range $entry := $.Site.Data.registry -}}
  {{ if and (and (eq $entry.language $langIndex) (eq $entry.isNative true)) (eq $entry.registryType "instrumentation") -}}
    {{ $integrations = $integrations | append $entry -}}
  {{ end -}}
{{ end -}}

{{ range first $howMany (sort $integrations "name") }}
- [{{ .title }}]({{ .urls.docs }})
{{- end }}

{{ $langName := $langData.name | default "ERROR-LANG-MISSING" -}}
{{ $noIntegrations := eq (len $integrations) 0 -}}

{{ $args := dict
    "_dot" .
    "_path" "native-lib-alert.md"
    "name" $langName
    "noIntegrations" $noIntegrations
-}}

{{ partial "include" $args -}}
