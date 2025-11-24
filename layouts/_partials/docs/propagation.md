{{ $langIndex := partial "docs/get-lang.html" (dict
    "page" .Page
    "lang" (.Get 0)
    "componentName" "propagation.md")
-}}

{{ $langName := (index $.Site.Data.instrumentation $langIndex).name | default "" -}}

{{ $args := dict
    "_dot" .
    "_path" "propagation.md"
    "lang" $langName
-}}

{{ partial "include" $args -}}
