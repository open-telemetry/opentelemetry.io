{{/*

IMPORTANT NOTE TO LOCALIZATION TEAMS. ALL LOCALIZATIONS SHOULD USE THIS
SHORTCODE. DO NOT WRITE YOUR OWN VERSION. INSTEAD, LOCALIZE THE INCLUDE FILE
named by the "_path" field below.

This comment can be deleted once all l10n teams have updated to use this version
of the intro.md shortcode.

*/ -}}
{{/*

Usage: [langID]

Argument is an optional language ID (like go or cpp). When omitted, and this
shortcode is called from a docs/language page, $lang will be set to the language
ID of that page's section. For example $lang will be "cpp" for
"docs/languages/cpp/...".

Note: until https://github.com/open-telemetry/opentelemetry.io/issues/6582 is
fixed, $lang will be `net` for .Net. After that issue is fixed, we'll be able to
eliminate $langIdAsPath and just use $lang.

We may also be able to avoid having the `name` in the data file, instead picking
it up from the language section index file.

*/ -}}

{{ $lang := .Get 0 -}}
{{ $langIdAsPath := "" -}}
{{ with findRESubmatch `^docs/languages/(.*?)(?:$|/)` .Page.File.Path 1 -}}
  {{ $langIdAsPath = index (index . 0) 1 -}}
  {{ if not $lang -}}
    {{ $lang = cond (eq $langIdAsPath "net") "dotnet" $langIdAsPath -}}
  {{ end -}}
{{ end -}}

{{ $name := "" -}}
{{ if $lang -}}
  {{ $name = (index $.Site.Data.instrumentation $lang).name -}}
  {{ if not $name -}}
    {{ warnf "No name for language '%s' in `instrumentation` data file." $lang -}}
  {{ end -}}
{{ end -}}


{{/*

  NOTE: the language list used by supportsOTLP will grow until all languages
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

{{ partial "include" $args -}}
