{{ $typesNames := newScratch -}}
{{ $typesNames.Set "instrumentation" "instrumentation library" -}}

Щоб встановити {{ $typesNames.Get .type | default .type }}, виконайте:

```shell
{{ printf .installLine .name }}
```
