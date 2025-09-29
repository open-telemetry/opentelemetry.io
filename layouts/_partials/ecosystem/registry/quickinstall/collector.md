{{/* cSpell:ignore gomod */ -}}

When [building a custom collector](/docs/collector/custom-collector/) you can add this {{ .type }} to the manifest file like the following:

```yaml
{{ .type | pluralize }}:
    - gomod:
        {{ .name }} {{ .version }}
```
