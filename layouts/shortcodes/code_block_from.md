{{ $file := .Get "file" -}}
{{ $lang := .Get "lang" | default "" -}}
{{ $from := .Get "from" | default 0 -}}
{{ $to := .Get "to" -}}

{{ if not $lang -}}
  {{ if strings.HasSuffix $file ".py" -}}
    {{ $lang = "python" -}}
  {{ end -}}
{{ end -}}

{{ $pathBase := .Page.Param "code_block_from__path_base" | default "" -}}

{{ $path := $file -}}
{{ if $pathBase -}}
{{ $path = printf "%s/%s" $pathBase $path -}}
{{ end -}}
{{ $fileContent := readFile $path -}}
{{ $fileLines := split $fileContent "\n" -}}
{{ $excerpt := after $from $fileLines -}}

```{{ $lang }}
# {{ $file }}
{{ delimit $excerpt "\n" "" }}
```
