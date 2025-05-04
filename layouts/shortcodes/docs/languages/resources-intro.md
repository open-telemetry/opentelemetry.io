{{/* TODO: Cleanup: drop the prettier-ignore directive. */ -}}
<!-- prettier-ignore -->
{{ $aResource := .Get 0 |
  default .Page.Params.resource_intro_default_rsrc |
  default (site.Sites.Default.GetPage "docs").Params.resource_intro_default_rsrc
-}}
{{ if not $aResource -}}
  {{ errorf "%s: shortcode %q param 'resource_intro_default_rsrc' isn't defined" .Position .Name -}}
{{ end -}}
{{ $resourceHRef := "/docs/concepts/resources/" -}}
{{ if eq .Page.RelPermalink $resourceHRef -}}
  {{ $resourceHRef = "/docs/specs/otel/resource/sdk/" -}}
{{ end -}}

{{ $args := dict
  "_dot" .
  "_path" "resources-intro.md"
  "aResource" $aResource
  "resourceHRef" $resourceHRef
-}}
{{ partial "include" $args -}}
