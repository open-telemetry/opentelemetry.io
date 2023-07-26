{{ $data := $.Site.Data.instrumentation }}

Language | Traces | Metrics | Logs |
| --- | --- | --- | --- |
| [C++](cpp/) | {{ $data.cpp.status.traces | humanize }} | {{ $data.cpp.status.metrics | humanize }} | {{ $data.cpp.status.logs | humanize }} |
| [C#/.NET](net/) | {{ $data.dotnet.status.traces | humanize }} | {{ $data.dotnet.status.metrics | humanize }} | {{ $data.dotnet.status.logs | humanize }} |
| [Erlang/Elixir](erlang/) | {{ $data.erlang.status.traces | humanize }} | {{ $data.erlang.status.metrics | humanize }} | {{ $data.erlang.status.logs | humanize }} |
| [Go](go/) | {{ $data.go.status.traces | humanize }} | {{ $data.go.status.metrics | humanize }} | {{ $data.go.status.logs | humanize }} |
| [Java](java/) | {{ $data.java.status.traces | humanize }} | {{ $data.java.status.metrics | humanize }} | {{ $data.java.status.logs | humanize }} |
| [JavaScript](js/) | {{ $data.js.status.traces | humanize }} | {{ $data.js.status.metrics | humanize }} | {{ $data.js.status.logs | humanize }} |
| [PHP](php/) | {{ $data.php.status.traces | humanize }} | {{ $data.php.status.metrics | humanize }} | {{ $data.php.status.logs | humanize }} |
| [Python](python/) | {{$data.python.status.traces | humanize }} | {{ $data.python.status.metrics | humanize }} | {{ $data.python.status.logs | humanize }} |
| [Ruby](ruby/) | {{ $data.ruby.status.traces | humanize }} | {{ $data.ruby.status.metrics | humanize }} | {{ $data.ruby.status.logs | humanize }} |
| [Rust](rust/) | {{ $data.rust.status.traces | humanize }} | {{ $data.rust.status.metrics | humanize }} | {{ $data.rust.status.logs | humanize }} |
| [Swift](swift/) | {{ $data.swift.status.traces | humanize }} | {{ $data.swift.status.metrics | humanize }} | {{ $data.swift.status.logs | humanize }} |

\* For more information, see the language-specific instrumentation page.
