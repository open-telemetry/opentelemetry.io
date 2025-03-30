<!-- cSpell:ignore: cond isset -->
{{ $integrations := slice -}}
{{ range $entry := $.Site.Data.registry -}}
  {{ if or (and (eq ($.Get 0) "native libraries") (eq $entry.isNative true) (eq $entry.registryType "instrumentation")) (and (eq ($.Get 0) "application integrations") (eq $entry.registryType "application integration")) -}}
    {{ $entry = merge $entry (dict "oss" (ne .license "Commercial")) -}}
    {{ $integrations = $integrations | append $entry -}}
  {{ end -}}
{{ end -}}

{{ $languages := merge $.Site.Data.instrumentation (dict "collector" (dict "name" "collector") "lua" (dict "name" "Lua")) -}}

Name[^1]     | OSS | Component |  Learn more
------------ | --- | ---------- |  ----------
{{- range sort (sort $integrations ".title") ".oss" "desc" }}
{{ $lang := cond
    (eq .language "collector")
    (dict "name" "Collector")
    (index $.Site.Data.instrumentation .language)
-}}
{{ $cncfTag := cond
    (isset . "cncfProjectLevel")
    (printf "<img alt=\"CNCF %s Project\" title=\"CNCF %s Project\" style=\"display: inline-block; padding-left: 8px; border: none; width: 16; height: 16px;\" src=\"/img/cncf-icon-color.svg\">"
      (humanize .cncfProjectLevel)
      (humanize .cncfProjectLevel))
    "" -}}

{{ if not .urls.website -}}
  {{ errorf "Website URL is missing for integrations registry entry '%s'" .title -}}
{{ end -}}
{{ if not .urls.docs -}}
  {{ errorf "Docs URL is missing for integrations registry entry '%s'" .title -}}
{{ end -}}

{{/* Each line below is a table column */ -}}

[{{ .title }}]({{ .urls.website }})
  {{- $cncfTag }} |
  {{- cond (eq .license "Commercial") "No" "Yes" }} |
  {{- $lang.name -}}
  | [{{ replace .urls.docs "https://" "" }}]({{ .urls.docs }})
{{- end }}

[^1]: Listed alphabetically
