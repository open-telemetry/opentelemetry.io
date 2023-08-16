{{ $data := $.Site.Data.instrumentation }}

Language | Logs |
| --- | --- |
| [C++](/docs/instrumentation/cpp/) | {{ $data.cpp.status.logs | humanize }} |
| [C#/.NET](/docs/instrumentation/net/) | {{ $data.dotnet.status.logs | humanize }} |
| [Erlang/Elixir](/docs/instrumentation/erlang/) | {{ $data.erlang.status.logs | humanize }} |
| [Go](/docs/instrumentation/go/) | {{ $data.go.status.logs | humanize }} |
| [Java](/docs/instrumentation/java/) | {{ $data.java.status.logs | humanize }} |
| [JavaScript](/docs/instrumentation/js/) | {{ $data.js.status.logs | humanize }} |
| [PHP](/docs/instrumentation/php/) | {{ $data.php.status.logs | humanize }} |
| [Python](/docs/instrumentation/python/) | {{$data.python.status.logs | humanize }} |
| [Ruby](/docs/instrumentation/ruby/) | {{ $data.ruby.status.logs | humanize }} |
| [Rust](/docs/instrumentation/rust/) | {{ $data.rust.status.logs | humanize }} |
| [Swift](/docs/instrumentation/swift/) | {{ $data.swift.status.logs | humanize }} |
