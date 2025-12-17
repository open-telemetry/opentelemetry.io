{{ $typesNames := newScratch -}}
{{ $typesNames.Set "instrumentation" "instrumentation library" -}}

To install this {{ $typesNames.Get .type | default .type }} run:

```shell
{{ printf .installLine .name }}
```