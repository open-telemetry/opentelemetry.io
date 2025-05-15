{{ $lang := .Get 0 -}}
{{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := $data.name -}}

{{ $tracesStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "traces") -}}
{{ $metricsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "metrics") -}}
{{ $logsStatus := partial "docs/get-signal-status.html" (dict "lang" $lang "signal" "logs") -}}

{{ $args := dict
    "_dot" .
    "_path" "index-intro.md"
    "name" $name
    "lang" $lang
    "tracesStatus" $tracesStatus
    "metricsStatus" $metricsStatus
    "logsStatus" $logsStatus
    ".Inner" .Inner
-}}

{{ partial "include" $args -}}
