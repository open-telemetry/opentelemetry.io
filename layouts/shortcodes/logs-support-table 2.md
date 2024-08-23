{{ $data := $.Site.Data.instrumentation }}

Language | Logs |
| --- | --- |
| [C++](/docs/languages/cpp/) | {{ $data.cpp.status.logs | humanize }} |
| [C#/.NET](/docs/languages/net/) | {{ $data.dotnet.status.logs | humanize }} |
| [Erlang/Elixir](/docs/languages/erlang/) | {{ $data.erlang.status.logs | humanize }} |
| [Go](/docs/languages/go/) | {{ $data.go.status.logs | humanize }} |
| [Java](/docs/languages/java/) | {{ $data.java.status.logs | humanize }} |
| [JavaScript](/docs/languages/js/) | {{ $data.js.status.logs | humanize }} |
| [PHP](/docs/languages/php/) | {{ $data.php.status.logs | humanize }} |
| [Python](/docs/languages/python/) | {{$data.python.status.logs | humanize }} |
| [Ruby](/docs/languages/ruby/) | {{ $data.ruby.status.logs | humanize }} |
| [Rust](/docs/languages/rust/) | {{ $data.rust.status.logs | humanize }} |
| [Swift](/docs/languages/swift/) | {{ $data.swift.status.logs | humanize }} |
