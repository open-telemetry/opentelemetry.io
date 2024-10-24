{{/*

Like Hugo's `param` shortcode
(https://gohugo.io/content-management/shortcodes/#param) but better, because it
can be used to render markdown simply by invoking it as {{% _param name %}}.

An enhanced version of:
https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/shortcodes/param.html

*/ -}}

{{ $name := (.Get 0) -}}
{{ with $name -}}
  {{ with ($.Page.Param .) -}}
    {{ . }}
  {{- else -}}
    {{ errorf "Page or site param %q not found: %s" $name $.Position -}}
  {{ end -}}
{{- else -}}
  {{ errorf "Missing param key: %s" $.Position -}}
{{ end -}}
