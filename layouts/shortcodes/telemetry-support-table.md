{{ $data := $.Site.Data.instrumentation }}

Language | Traces | Metrics | Logs |
| --- | --- | --- | --- |
| [C++](/docs/languages/cpp/) | {{ $data.cpp.status.traces | humanize }} | {{ $data.cpp.status.metrics | humanize }} | {{ $data.cpp.status.logs | humanize }} |
| [C#/.NET](/docs/languages/dotnet/) | {{ $data.dotnet.status.traces | humanize }} | {{ $data.dotnet.status.metrics | humanize }} | {{ $data.dotnet.status.logs | humanize }} |
| [Erlang/Elixir](/docs/languages/erlang/) | {{ $data.erlang.status.traces | humanize }} | {{ $data.erlang.status.metrics | humanize }} | {{ $data.erlang.status.logs | humanize }} |
| [Go](/docs/languages/go/) | {{ $data.go.status.traces | humanize }} | {{ $data.go.status.metrics | humanize }} | {{ $data.go.status.logs | humanize }} |
| [Java](/docs/languages/java/) | {{ $data.java.status.traces | humanize }} | {{ $data.java.status.metrics | humanize }} | {{ $data.java.status.logs | humanize }} |
| [JavaScript](/docs/languages/js/) | {{ $data.js.status.traces | humanize }} | {{ $data.js.status.metrics | humanize }} | {{ $data.js.status.logs | humanize }} |
| [PHP](/docs/languages/php/) | {{ $data.php.status.traces | humanize }} | {{ $data.php.status.metrics | humanize }} | {{ $data.php.status.logs | humanize }} |
| [Python](/docs/languages/python/) | {{$data.python.status.traces | humanize }} | {{ $data.python.status.metrics | humanize }} | {{ $data.python.status.logs | humanize }} |
| [Ruby](/docs/languages/ruby/) | {{ $data.ruby.status.traces | humanize }} | {{ $data.ruby.status.metrics | humanize }} | {{ $data.ruby.status.logs | humanize }} |
| [Rust](/docs/languages/rust/) | {{ $data.rust.status.traces | humanize }} | {{ $data.rust.status.metrics | humanize }} | {{ $data.rust.status.logs | humanize }} |
| [Swift](/docs/languages/swift/) | {{ $data.swift.status.traces | humanize }} | {{ $data.swift.status.metrics | humanize }} | {{ $data.swift.status.logs | humanize }} |
