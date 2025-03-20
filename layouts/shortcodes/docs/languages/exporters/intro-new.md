{{ $prettier_ignore := `

<!-- prettier-ignore-start -->
` -}}

{{ $lang := .Get 0 | default "" -}}
{{ $langIdAsPath := "" -}}
{{ $name := "" -}}

{{ if $lang -}}
  {{ $langIdAsPath = cond (eq $lang "dotnet") "net" $lang }}
  {{ $name = (index $.Site.Data.instrumentation $lang).name -}}
  {{ if not $name -}}
    {{ warnf "No name for language '%s' in `instrumentation` data file." $lang -}}
  {{ end -}}
{{ end -}}


{{/*

  NOTE: the language list used by supportsOTLP will grow until all all languages
  are updated to a consistent structure.

  FIXME: move the knowledge of OTLP support into the language's section landing page front matter params

*/ -}}

{{ $args := dict
    "_dot" .
    "_path" "exporters/intro.md"
    "lang" $lang
    "name" $name
    "langIdAsPath" $langIdAsPath
    "extra" .Page.Params.abc
    "supportsOTLP" (in (slice "python" "js" "java" "cpp" "dotnet") $lang)
    "zeroConfigPageExists" (.Page.GetPage (print "/docs/zero-code/" $langIdAsPath "/configuration" ))
-}}

{{ partial "include.md" $args -}}
