{{ $aResource := "" -}}
{{ $path := "resources-intro.md" -}}
{{ $includePage := partial "func/find-include.html"  (dict "path" $path "page" .Page) -}}
{{ if $includePage }}
  {{ $aResource = .Get 0 | default $includePage.Params.aResource -}}
{{ else -}}
  {{ errorf "%s: include file '%s' not found" .Position $path -}}
{{ end -}}

{{ if not $aResource -}}
  {{ errorf "%s: shortcode %q param 'resource_intro_default_rsrc' isn't defined" .Position .Name -}}
{{ end -}}

{{ $resourceConceptsPagePath := "/docs/concepts/resources/" -}}
{{ $resourceHRef := $resourceConceptsPagePath -}}
{{ if eq .Page.RelPermalink $resourceConceptsPagePath -}}
  {{ $resourceHRef = "/docs/specs/otel/resource/sdk/" -}}
{{ end -}}

{{ $args := dict
  "_dot" .
  "_path" "resources-intro.md"
  "_page" $includePage
  "aResource" $aResource
  "resourceHRef" $resourceHRef
-}}
{{ partial "include" $args -}}
