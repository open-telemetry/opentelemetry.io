{{- /*
  Strip __hugo_ctx markers that leak through in isPlainText templates.
  See <https://github.com/gohugoio/hugo/issues/12854>.
*/ -}}

{{- $content := .RenderShortcodes -}}
{{- $content = replaceRE `\{\{__hugo_ctx[^}]*\}\}\n?` "" $content -}}
{{- return $content -}}
