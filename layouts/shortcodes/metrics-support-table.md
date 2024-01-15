{{ $data := $.Site.Data.instrumentation }}

Language | Metrics |
| --- | --- |
| [C++](/docs/languages/cpp/) | {{ $data.cpp.status.metrics | humanize }} |
| [C#/.NET](/docs/languages/net/) | {{ $data.dotnet.status.metrics | humanize }} |
| [Erlang/Elixir](/docs/languages/erlang/) | {{ $data.erlang.status.metrics | humanize }} |
| [Go](/docs/languages/go/) | {{ $data.go.status.metrics | humanize }} |
| [Java](/docs/languages/java/) | {{ $data.java.status.metrics | humanize }} |
| [JavaScript](/docs/languages/js/) | {{ $data.js.status.metrics | humanize }} |
| [PHP](/docs/languages/php/) | {{ $data.php.status.metrics | humanize }} |
| [Python](/docs/languages/python/) | {{$data.python.status.metrics | humanize }} |
| [Ruby](/docs/languages/ruby/) | {{ $data.ruby.status.metrics | humanize }} |
| [Rust](/docs/languages/rust/) | {{ $data.rust.status.metrics | humanize }} |
| [Swift](/docs/languages/swift/) | {{ $data.swift.status.metrics | humanize }} |
