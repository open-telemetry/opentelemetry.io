{{ $file := .Get "file" -}}
{{ $lang := .Get "lang" | default "" -}}
{{ $from := .Get "from" | default 0 -}}
{{ $to := .Get "to" | default 99999 -}}
{{ $showFileName := .Get "show-file" | default true -}}
{{ $commentStart := "//" -}}

{{ if not $lang -}}
  {{ if strings.HasSuffix $file ".py" -}}
    {{ $lang = "python" -}}
    {{ $commentStart = "#" -}}
  {{ else if strings.HasSuffix $file ".cs" -}}
    {{ $lang = "csharp" -}}
  {{ end -}}
{{ end -}}

{{ $pathBase := .Page.Param "code_block_from__path_base" | default "" -}}

{{ $path := $file -}}
{{ if $pathBase -}}
  {{ $path = printf "%s/%s" $pathBase $path -}}
{{ end -}}
{{ $fileContent := readFile $path -}}
{{ $fileLines := split $fileContent "\n" -}}
{{ $n := sub (int $to) (int $from) -}}
{{ if le $n 0 }}
  {{ errorf "Invalid line range (from=%s, to=%s) for file %s" $from $to $file -}}
{{ end -}}
{{ $excerpt := first $n (after $from $fileLines) -}}

```{{ $lang }}
{{ if $showFileName -}}
  {{ $commentStart }} {{ $file }}
{{ end -}}
{{ delimit $excerpt "\n" "" }}
```
