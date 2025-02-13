{{/* Use to include Markdown snippets. Note that the included content can have
calls to shortcodes. */ -}}

{{ $path := .Get 0 -}}
{{ if not (or
  (strings.HasPrefix $path "/" )
  (strings.HasPrefix $path "."))
-}}
  {{ $path = printf "_includes/%s" $path -}}
{{ end -}}

{{ template "getPage" (dict "ctx" . "path" $path "page" .Page) -}}

{{ define "getPage" -}}
  {{ $page_to_include := .page.GetPage .path -}}
  {{ with $page_to_include -}}
    {{ .Content -}}
  {{ else -}}
    {{ $parent := .page.Parent -}}
    {{ if $parent -}}
      {{ template "getPage" (dict "ctx" .ctx "path" .path "page" $parent) -}}
    {{ else -}}
      {{ warnf "File not found: %s in page: %s" .path .ctx.Page.Path -}}
      **ERROR**: File not found: {{ .path }}.
    {{end -}}
  {{ end -}}
{{ end -}}
