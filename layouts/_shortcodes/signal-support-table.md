{{ $data := $.Site.Data.instrumentation }}
{{ $signal := .Get 0 -}}

Language | {{ humanize $signal }} |
| --- | --- |
| [C++](/docs/languages/cpp/) | {{ index $data.cpp.status $signal | humanize }} |
| [C#/.NET](/docs/languages/dotnet/) | {{ index $data.dotnet.status $signal | humanize }} |
| [Erlang/Elixir](/docs/languages/erlang/) | {{ index $data.erlang.status $signal | humanize }} |
| [Go](/docs/languages/go/) | {{ index $data.go.status $signal | humanize }} |
| [Java](/docs/languages/java/) | {{ index $data.java.status $signal | humanize }} |
| [JavaScript](/docs/languages/js/) | {{ index $data.js.status $signal | humanize }} |
| [PHP](/docs/languages/php/) | {{ index $data.php.status $signal | humanize }} |
| [Python](/docs/languages/python/) | {{index $data.python.status $signal | humanize }} |
| [Ruby](/docs/languages/ruby/) | {{ index $data.ruby.status $signal | humanize }} |
| [Rust](/docs/languages/rust/) | {{ index $data.rust.status $signal | humanize }} |
| [Swift](/docs/languages/swift/) | {{ index $data.swift.status $signal | humanize }} |
