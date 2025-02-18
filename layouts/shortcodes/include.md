{{/* Use to include Markdown snippets. Note that the included content can have
calls to shortcodes. */ -}}

{{ $path := .Get 0 -}}
{{ $page := partial "func/find-include.html"  (dict "path" $path "page" .Page) -}}
{{ with $page -}}
  {{ .Content -}}
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
