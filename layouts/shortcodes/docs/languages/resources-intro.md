{{ $resourceConceptsPagePath := "/docs/concepts/resources/" -}}
{{ $aResource := .Get 0 -}}
{{ if not $aResource -}}
  {{ with .Page.GetPage $resourceConceptsPagePath -}}
    {{ $aResource = .Params.resource_intro_default_rsrc |
        default (index (where .Translations "Lang" "en") 0).Params.resource_intro_default_rsrc -}}
  {{ else -}}
    {{ errorf "%s: shortcode %q param 'resource_intro_default_rsrc' isn't defined" .Position .Name -}}
  {{ end -}}
{{ end -}}

{{ $args := dict
  "_dot" .
  "_path" "resources-intro.md"
  "aResource" $aResource
  "resourceHRef" (cond (eq .Page.RelPermalink $resourceConceptsPagePath)
      "/docs/specs/otel/resource/sdk/"
      $resourceConceptsPagePath)
-}}
{{ partial "include" $args -}}
