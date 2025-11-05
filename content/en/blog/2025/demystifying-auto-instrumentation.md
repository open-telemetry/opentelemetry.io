---
title: 'Demystifying Automatic Instrumentation: How the Magic Actually Works'
linkTitle: Demystifying Auto-Instrumentation
date: 2025-10-08
author: >-
  [Severin Neumann](https://github.com/svrnm) (Causely)
canonical_url: https://www.causely.ai/blog/demystifying-automatic-instrumentation
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7810
sig: Comms
cspell:ignore: Beyla bpftrace Causely libbpf
---

Despite the rise of OpenTelemetry and [eBPF](https://ebpf.io/), most developers
don't know what automatic instrumentation actually does under the hood. This
post breaks it down—not to suggest you build your own, but to help you
understand what's going on when your tools magically "just work."

We'll explore five key techniques that power automatic instrumentation: monkey
patching, bytecode instrumentation, compile-time instrumentation, eBPF, and
language runtime APIs. Each technique leverages the unique characteristics of
different programming languages and runtime environments to add observability
without code changes.

## What is automatic instrumentation?

According to [the glossary](/docs/concepts/glossary), automatic instrumentation
refers to “_telemetry collection methods that do not require the end-user to
modify application’s source code. Methods vary by programming language, and
examples include bytecode injection or monkey patching._”

It’s worth noting that “automatic instrumentation” is often used to describe two
related but distinct concepts. In the definition above and in this blog post, it
refers to the specific techniques (like bytecode injection or monkey patching)
that can be used to enable observability without code changes. However, when
people use "automatic instrumentation" in conversations, they often mean
complete zero-code solutions like the
[OpenTelemetry Java agent](/docs/zero-code/java/agent/).

The distinction is important: there's actually a three-layer hierarchy here. At
the bottom are the **automatic instrumentation techniques** (bytecode injection,
monkey patching, etc.) that we explore in this blog post. These techniques are
used by
[instrumentation libraries](/docs/concepts/glossary/#instrumentation-library)
that target specific frameworks, for example, libraries that instrument
[Spring and Spring Boot](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring),
[Express.js](https://www.npmjs.com/package/@opentelemetry/instrumentation-express),
[Laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel),
or other popular frameworks. Finally, complete solutions like the OpenTelemetry
Java agent bundle these instrumentation libraries together and add all the
boilerplate configuration for exporters, samplers, and other building blocks.

There are ongoing debates in the observability community about the right
terminology, and this blog post won’t attempt to resolve those discussions.

Also note that what appears "automatic" to one person might be "manual" to
another: if a library developer integrates the OpenTelemetry API into their
code, the users of that library will get traces, logs, and metrics from that
library “automatically” when they add the OpenTelemetry SDK to their
application.

## Want to try the techniques yourself?

This blog post contains small code snippets to illustrate the concepts. You can
try out full working examples in the
[lab repository](https://github.com/causely-oss/automatic-instrumentation-lab).

Before we explore these techniques, it’s important to note that you should not
build your own automatic instrumentation from scratch, especially not using this
blog post as a blueprint. The examples here are simplified for educational
purposes and skip many complex details that you would encounter in real-world
implementations. There are established tools and mechanisms available that
handle much of the complexity and edge cases you would face when building
instrumentation from the ground up. If you’re interested in diving deeper into
this field, the best approach is to
[contribute to existing projects like OpenTelemetry](/community/#develop-and-contribute),
where you can learn from experienced maintainers and work with production-ready
code.

## Automatic instrumentation techniques

Now let’s explore how these techniques work under the hood.

### Monkey patching: Runtime function replacement

Monkey patching is perhaps the most straightforward automatic instrumentation
technique, commonly used in dynamic languages like JavaScript, Python, and Ruby.
The concept is simple: at runtime, we replace existing functions with
instrumented versions that inject telemetry before and after calling the
original function.

Here's how this works in Node.js:

```javascript
const originalFunction = exports.functionName;

function instrumentedFunction(...args) {
  const startTime = process.hrtime.bigint();
  const result = originalFunction.apply(this, args);
  const duration = process.hrtime.bigint() - startTime;
  console.log(`functionName(${args[0]}) took ${duration} nanoseconds`);
  return result;
}

exports.functionName = instrumentedFunction;
```

The require-in-the-middle library allows us to perform this replacement at
module load time, intercepting the module loading process to modify the exported
functions before they’re used by the application:

```javascript
const hook = require("require-in-the-middle");
hook(["moduleName"], (exports, name, basedir) => {
  const functionName = exports.fibonacci;
  ...
  exports.functionName = instrumentedFunction;
  return exports;
});
```

However, monkey patching has limitations. It can't instrument code that's
already been compiled to machine code, and it may not work with functions that
are called before the instrumentation is loaded. Additionally, the overhead of
function wrapping can be significant for performance-critical applications.
Monkey patching is also brittle when the implementation of the instrumented code
changes significantly, as the instrumentation code needs to be updated to match
the new interface.

To try this out yourself, take a look at the
[Node.js example](https://github.com/causely-oss/automatic-instrumentation-lab#monkey-patching-nodejs)
from the lab.

If you’d like to see actively used implementations of monkey patching, you can
take a look into the instrumentation libraries provided by OpenTelemetry for
[JavaScript](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages)
or
[Python](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation).

### Bytecode instrumentation: Modifying the virtual machine

For languages that run on virtual machines, bytecode instrumentation offers a
powerful approach. This technique works by modifying the compiled bytecode as
it’s loaded by the virtual machine, allowing us to inject code at the
instruction level.

Java’s Instrumentation API provides the foundation for this approach. When a
Java agent is specified with the `-javaagent` flag, the JVM calls the agent’s
premain method before the main application starts. This gives us the opportunity
to register a class transformer that can modify any class as it’s loaded.

```java
public static void premain(String args, Instrumentation inst) {
    new AgentBuilder.Default()
        .type(ElementMatchers.nameStartsWith("com.example.TargetApp"))
        .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
            builder.method(ElementMatchers.named("targetMethod"))
                   .intercept(MethodDelegation.to(MethodInterceptor.class))
        ).installOn(inst);
}
```

The interceptor then wraps the original method call with timing logic:

```java
@RuntimeType
public static Object intercept(@Origin String methodName,
                            @AllArguments Object[] args,
                            @SuperCall Callable<?> callable) throws Exception {
    long startTime = System.nanoTime();
    Object result = callable.call();
    long duration = System.nanoTime() - startTime;

    System.out.printf("targetMethod(%s) took %d ns%n", args[0], duration);
    return result;
}
```

Bytecode instrumentation is particularly powerful because it works at the JVM
level, making it language-agnostic within the JVM ecosystem. It can instrument
Java, Kotlin, Scala, and other JVM languages without modification.

The main advantage of bytecode instrumentation is its comprehensive coverage—it
can instrument any code that runs on the JVM, including code loaded dynamically
or from external sources. However, it comes with some overhead due to the
bytecode transformation process.

In real implementations, [ByteBuddy](https://bytebuddy.net/#/) is the go-to
library for bytecode instrumentation in Java, providing a powerful and flexible
API for creating Java agents. It abstracts away much of the complexity of
bytecode manipulation and provides a clean, type-safe way to define
instrumentation rules.

To try this out yourself, take a look at the
[Java example](https://github.com/causely-oss/automatic-instrumentation-lab#byte-code-instrumentation-java)
from the lab.

If you’d like to see actively used implementations of bytecode instrumentation,
you can take a look into the instrumentation libraries provided by OpenTelemetry
for
[Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation)
or
[.NET](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src).

### Compile-time instrumentation: Baking observability into the binary

For statically compiled languages like Go, compile-time instrumentation offers a
different approach. Instead of modifying code at runtime, we transform the
source code during the build process using
[Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST)
manipulation.

The process involves parsing the source code into an AST, modifying the tree to
add instrumentation code, and then generating the modified source code before
compilation. This approach ensures that the instrumentation is baked into the
final binary, providing zero runtime overhead for the instrumentation mechanism
itself.

```go
func instrumentFunction() {
    fset := token.NewFileSet()
    file, err := parser.ParseFile(fset, "app/target.go", nil, parser.ParseComments)

    // Find the target function and add timing logic
    ast.Inspect(file, func(n ast.Node) bool {
        if fn, ok := n.(*ast.FuncDecl); ok && fn.Name.Name == "targetFunction" {
            // Add defer statement for timing
            deferStmt := &ast.DeferStmt{
                Call: &ast.CallExpr{
                    Fun: &ast.CallExpr{
                        Fun: &ast.Ident{Name: "trace_targetFunction"},
                    },
                },
            }
            fn.Body.List = append([]ast.Stmt{deferStmt}, fn.Body.List...)
        }
        return true
    })

    // Write the modified file back
    printer.Fprint(f, fset, file)
}
```

Compile-time instrumentation has several advantages. It provides zero runtime
overhead for the instrumentation mechanism, and the resulting binary contains
all the code it needs. This approach works well with compiled languages and can
be integrated into existing build processes.

That said, it does come with trade-offs. It requires access to the source code
and build system, which makes it impractical for instrumenting third-party
applications or libraries. It also demands more sophisticated tooling to
manipulate the abstract syntax tree (AST) correctly and consistently, adding
complexity to the build pipeline and potentially requiring changes to your CI/CD
workflows.

To try this out yourself, take a look at the
[Go compile-time example](https://github.com/causely-oss/automatic-instrumentation-lab#compile-time-instrumentation-go)
from the lab.

If you’d like to see actively used implementations of compile-time
instrumentation, you can take a look into the
[OpenTelemetry Go Compile Instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation)
project.

### eBPF instrumentation: Kernel-level observability

[eBPF](https://ebpf.io/) (Extended Berkeley Packet Filter) represents a
fundamentally different approach to automatic instrumentation. Instead of
modifying application code or bytecode, eBPF works at the kernel level,
attaching probes to function entry and exit points in the running application.

eBPF programs are small, safe programs that run in the kernel and can observe
system calls, function calls, and other events. For automatic instrumentation,
we use uprobes (user-space probes) to attach to specific functions in our
application.

```bash
#!/usr/bin/env bpftrace

uprobe:/app/fibonacci:main.fibonacci
{
    @start[tid] = nsecs;
}

uretprobe:/app/fibonacci:main.fibonacci /@start[tid]/
{
    $delta = nsecs - @start[tid];
    printf("fibonacci() duration: %d ns\n", $delta);
    delete(@start[tid]);
}
```

This [bpftrace](https://github.com/bpftrace/bpftrace) script attaches a probe to
the function in our application. When the function is called, it records the
start time. When the function returns, it calculates the duration and prints the
result.

eBPF instrumentation is language-agnostic and works with any language running on
Linux. It provides deep system-level observability without requiring any
modifications to the application code or build process. The overhead is minimal
since the instrumentation runs in the kernel.

However, eBPF instrumentation has some limitations. It requires Linux and root
privileges to run, making it less suitable for containerized environments or
applications that can’t run with elevated permissions.

For real-world use cases, bpftrace is just one of many eBPF tools available.
While it’s excellent for learning and prototyping, production environments
typically use more sophisticated frameworks like
[BCC](https://github.com/iovisor/bcc) (BPF Compiler Collection) or
[libbpf](https://github.com/libbpf/libbpf), which provide better performance,
more features, and stronger safety guarantees.

To try this out yourself, take a look at the
[Go eBPF example](https://github.com/causely-oss/automatic-instrumentation-lab#ebpf-based-instrumentation-go)
from the lab.

If you’d like to see actively used implementations of eBPF instrumentation, you
can take a look into the
[OpenTelemetry eBPF Instrumentation](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation)
project (“OBI”), which is the outcome of
[the donation of Beyla by Grafana Labs](https://github.com/open-telemetry/community/issues/2406).

### Language runtime APIs: Native instrumentation support

Some languages provide built-in APIs for instrumentation, offering a more
integrated approach.
[PHP’s Observer API](https://github.com/php/php-src/blob/PHP-8.0/Zend/zend_observer.h),
introduced in PHP 8.0, is a prime example of this approach.

The Observer API allows C extensions to hook into the PHP engine’s execution
flow at the Zend engine level. This provides deep visibility into PHP
application behavior without requiring code modifications.

```cpp
static void observer_begin(zend_execute_data *execute_data) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            start_time = clock();
        }
    }
}

static void observer_end(zend_execute_data *execute_data, zval *retval) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            clock_t end_time = clock();
            double duration = (double)(end_time - start_time) / CLOCKS_PER_SEC * 1000;
            php_printf("Function %s() took %.2f ms\n", function_name, duration);
        }
    }
}
```

The Observer API provides a clean, supported way to add instrumentation to PHP
applications. It operates at the language runtime level, similar to how other
languages implement their instrumentation APIs. This approach is efficient and
well-integrated with the language ecosystem.

However, it requires writing C extensions, which adds complexity and makes it
less accessible to developers who aren’t familiar with C or PHP’s internal APIs.
It’s also specific to PHP, so the knowledge doesn’t transfer to other languages.

To try this out yourself, take a look at the
[PHP Observer API example](https://github.com/causely-oss/automatic-instrumentation-lab#php-observer-api-php)
from the lab.

If you’d like to see actively used implementations of API instrumentation, you
can take a look into the instrumentation libraries provided by OpenTelemetry for
[PHP](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation).

## A note on context propagation

While we've covered the core techniques of automatic instrumentation, there's an
important aspect we haven't discussed:
[context propagation](/docs/concepts/context-propagation/). This involves
injecting trace context information (trace IDs, span IDs) into HTTP headers,
message metadata, and other communication channels to enable distributed tracing
across service boundaries.

Unlike the purely observational techniques we've explored, context propagation
actively modifies your application's behavior by altering data transmitted
across service boundaries. This introduces additional complexity that deserves
its own dedicated blog post.

## Conclusion

We've explored the core techniques behind automatic instrumentation, from monkey
patching to bytecode instrumentation to eBPF probes. Each approach leverages the
unique characteristics of different programming languages and runtime
environments.

These techniques power production observability tools like OpenTelemetry,
enabling developers to quickly add telemetry without modifying source code. The
most successful observability strategies combine automatic and manual
instrumentation: automatic instrumentation provides broad coverage for common
patterns, while manual instrumentation captures business-specific metrics.

If you'd like to try out these techniques yourself, you can use the
[Automatic Instrumentation Lab](https://github.com/causely-oss/automatic-instrumentation-lab).

If you're interested in contributing to these technologies, consider getting
involved with
[OpenTelemetry's various Special Interest Groups](https://github.com/open-telemetry/community/#special-interest-groups)
(SIGs).
