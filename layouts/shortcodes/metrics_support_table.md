{{ $data := $.Site.Data.instrumentation.languages }}

Language | Metrics |
| --- | --- |
| [C++](/docs/instrumentation/cpp/) | {{ $data.cpp.status.metrics | humanize }} |
| [C#/.NET](/docs/instrumentation/net/) | {{ $data.dotnet.status.metrics | humanize }} |
| [Erlang/Elixir](/docs/instrumentation/erlang/) | {{ $data.erlang.status.metrics | humanize }} |
| [Go](/docs/instrumentation/go/) | {{ $data.go.status.metrics | humanize }} |
| [Java](/docs/instrumentation/java/) | {{ $data.java.status.metrics | humanize }} |
| [JavaScript](/docs/instrumentation/js/) | {{ $data.js.status.metrics | humanize }} |
| [PHP](/docs/instrumentation/php/) | {{ $data.php.status.metrics | humanize }} |
| [Python](/docs/instrumentation/python/) | {{$data.python.status.metrics | humanize }} |
| [Ruby](/docs/instrumentation/ruby/) | {{ $data.ruby.status.metrics | humanize }} |
| [Rust](/docs/instrumentation/rust/) | {{ $data.rust.status.metrics | humanize }} |
| [Swift](/docs/instrumentation/swift/) | {{ $data.swift.status.metrics | humanize }} |
