{{/*

This partial implements the core functionality of the 'include.html' shortcode,
allowing reuse across other shortcodes and partials.

This partial expects the following arguments -- beyond those used for the
include functionality:

- `_dot`: the '.' context of the page or shortcode invoking this partial
- `_path`: the path to the file to be included

*/ -}}

{{ $path := ._path -}}
{{ $args := . -}}
{{ $page := partial "func/find-include.html"  (dict "path" $path "page" ._dot.Page) -}}
{{ with $page -}}
  {{ $content := .RenderShortcodes -}}
  {{ range $_k, $v := $args -}}
    {{ $k := string $_k -}}
    {{ if not (hasPrefix $k "_") -}}
      {{ $regex := printf "\\{\\{\\s*\\$%s\\s*\\}\\}" $k -}}
      {{ $content = replaceRE $regex $v $content -}}
    {{ end -}}
  {{ end -}}
  {{ $content -}}
{{ else -}}
  {{ $msg := printf
      "Can't include '%s': file not found in page or ancestor contexts of page %s."
      $path .Page.Path -}}
  {{ warnf $msg -}}

  <div class="alert alert-warning">
  <div class="h4 alert-heading">INTERNAL SITE ERROR</div>
  {{ $msg }}
  </div>
{{ end -}}
