{{ $links := .Site.Params.links -}}

<p>{{ T "community_introduce" . }}</p>

## {{ T "community_learn" }} {#learn-and-connect}

{{ T "community_using" . }}

{{ with index $links "user"}}
  {{ template "community-links-list" . }}
{{ end }}

## {{ T "community_develop" }} {#develop-and-contribute}

{{ T "community_contribute" . }}

{{ with index $links "developer"}}
  {{ template "community-links-list" . }}
{{ end }}

{{ T "community_how_to" . }} <a href="/docs/contributing/">{{ T "community_guideline" }}</a>.

{{ define "community-links-list" -}}
{{ range . }}
- [<i class="{{ .icon }}"></i> {{ .name }}]({{ .url }}): {{ .desc -}}
{{ end -}}
{{ end }}
