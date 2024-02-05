{{ $name := (.Get 0) -}}

{{ with $name -}}
    {{ $registryEntry := (index $.Site.Data.registry .) -}}
    {{ with $registryEntry -}}
        {{ $version := .package.version -}}
        {{ with $version }}
            {{- . -}}
        {{- else -}}
            {{ errorf "No 'package.version' in registry entry %q: %s" $name $.Position -}}
        {{- end -}}
    {{- else -}}
        {{ errorf "Registry entry %q not found: %s" $name $.Position -}}
    {{- end -}}
{{- else -}}
  {{ errorf "Missing registry entry name: %s" $.Position -}}
{{- end -}}
