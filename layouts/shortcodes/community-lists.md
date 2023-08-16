{{ $links := .Site.Params.links -}}

<p>{{ T "community_introduce" . }}</p>

## {{ T "community_learn" }}

{{ T "community_using" . }}

{{ with index $links "user"}}
  {{ template "community-links-list" . }}
{{ end }}

## {{ T "community_develop" }}

{{ T "community_contribute" . }}

{{ with index $links "developer"}}
  {{ template "community-links-list" . }}
{{ end }}

{{ T "community_how_to" . }} <a href="/docs/contribution-guidelines/">{{ T "community_guideline" }}</a>.

{{ define "community-links-list" -}}
{{ range . }}
- [<i class="{{ .icon }}"></i> {{ .name }}]({{ .url }}): {{ .desc -}}
{{ end -}}
{{ end }}
