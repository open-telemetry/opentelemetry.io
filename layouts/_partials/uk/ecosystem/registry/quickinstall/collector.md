{{/* cSpell:ignore gomod */ -}}

Під час [створення власного колектора](/docs/collector/custom-collector/) ви можете додати цей {{ .type }} до файлу маніфесту, як показано нижче:

```yaml
{{ .type | pluralize }}:
    - gomod:
        {{ .name }} {{ .version }}
```
