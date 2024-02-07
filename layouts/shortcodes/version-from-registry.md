{{ $name := (.Get 0) -}}

{{ with $name -}}
  {{ with index $.Site.Data.registry . -}}
    {{ with .package.version -}}
      {{ . -}}
    {{ else -}}
      {{ errorf "No 'package.version' in registry entry %q: %s" $name $.Position -}}
    {{ end -}}
  {{ else -}}
    {{ errorf "Registry entry %q not found: %s" $name $.Position -}}
  {{ end -}}
{{ else -}}
  {{ errorf "Shortcode parameter 'name' is missing %s: " $.Position -}}
{{ end -}}
