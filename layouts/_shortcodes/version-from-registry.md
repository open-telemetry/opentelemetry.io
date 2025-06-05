{{ $name := (.Get 0) -}}
{{ $noPrefix := default false (.Get 1) -}}

{{ with $name -}}
  {{ with index $.Site.Data.registry . -}}
    {{ with .package.version -}}
      {{ if $noPrefix -}}
        {{ strings.TrimLeft "v" . -}}
      {{ else -}}
        {{ . -}}
      {{ end -}}
    {{ else -}}
      {{ errorf "No 'package.version' in registry entry %q: %s" $name $.Position -}}
    {{ end -}}
  {{ else -}}
    {{ errorf "Registry entry %q not found: %s" $name $.Position -}}
  {{ end -}}
{{ else -}}
  {{ errorf "Shortcode parameter 'name' is missing %s: " $.Position -}}
{{ end -}}
