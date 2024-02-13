---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 30
---

Automatic instrumentation in Go is possible by automatically modifying source code.

## Setup

```sh
go install github.com/nikolaydubina/go-instrument
```

## Invocation

Modify selected source files before compiling.

```sh
find . -name "*.go" | xargs -I{} go-instrument -app my-service -w -filename {}
```

Every function that contains context,

```go
func (s Cat) Name(ctx context.Context) (name string, err error) {
  ...
```

will be instrumented with spans.

```go
func (s Cat) Name(ctx context.Context) (name string, err error) {
	ctx, span := otel.Trace("my-service").Start(ctx, "Cat.Name")
	defer span.End()
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, "error")
			span.RecordError(err)
		}
	}()
  ...
```

## Customization

It is possible to exclude or include specific function names with compiler directives anywhere in the file.
For example,

```go
//instrument:exclude SomeFunc|SomeOtherfunc|privateFunc
...

func (s Cat) Name(ctx context.Context) (name string, err error) {
  //instrument:exclude Name
```

## Errors

If function has named error return, it will be used to set span as an error.
Otherwise, no error spans will be set.
