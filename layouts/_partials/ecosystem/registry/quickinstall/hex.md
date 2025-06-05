The package can be installed by adding `{{ .name }}` to your list of dependencies in `mix.exs`:

```exs
def deps do
  [
    {:{{ .name }}, "~> {{ .version }}"}
  ]
```
