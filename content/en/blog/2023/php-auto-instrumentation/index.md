---
title: Opentelemetry PHP Auto-Instrumentation
linkTitle: PHP Auto-Instrumentation
date: 2023-03-15
author: '[Przemek Delewski](https://github.com/pdelewski/) (Sumo Logic)'
---

## Introduction

Automatic Instrumentation is a process of adding tracing capabilities into user
application without modyfing it's source code. There are several techniques to
do that, but all of them more or less work in the same way by injecting
additional code into original one during compile time, link time, run-time or by
extending the operating system in case of [ebpf](https://ebpf.io/). This
blogpost presents method used by Opentelemetry PHP auto-instrumentation.

## Preconditions

Due to the technique chosen by the opentelemetry-php community for
auto-instrumentation purposes, there are a few preconditions that must be
fulfilled before user can use it in their application. PHP auto-instrumentation
is based on observability API that was introduced in PHP 8.0. This means that
user has to have at least PHP 8 installed. Another important component is the
[composer](https://getcomposer.org/download/) package manager in most recent
version. Third, is availability of c compiler in order to build
[c extension](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
which is core component used for injecting tracing code.

## Background

[Observability API](https://www.datadoghq.com/blog/engineering/php-8-observability-baked-right-in/)
allows register and execute additional code (function) before and after original
one without introducing additional performance penalties in other areas, so in
other words, we pay only for what we use and only for altered function. Before
PHP 8, the most common technique for adding tracing capabilities was altering
`zend_execute_ex` function (a monkey patching kind technique), however this
could lead to stack overflow and performance problems as whole application paid
for that. There were also considered other approaches like compile time AST
modifications which seems feasible, howerer there are no known production ready
tracers that works in this way up to date.

## Observability API from auto-instrumentation perspective

At the moment of this writing,
[observability API](https://github.com/php/php-src/blob/PHP-8.0/Zend/zend_observer.h)
is used by
[c extension](https://github.com/open-telemetry/opentelemetry-php-instrumentation)
and exposes one function with following interface:

```php
function hook(
    ?string $class,
    string $function,
    ?\Closure $pre = null,
    ?\Closure $post = null,
): bool {}
```

This function can be used from user application in order to add additional
functionality executed before and after. Below code snippet shows how to
instrument dummy `helloworld` function:

```php
function helloWorld() {
  echo 'helloWorld';
}

\OpenTelemetry\Instrumentation\hook(null, 'helloWorld',
    static function (?string $class, array $params, ?string $classname, string $functionname, ?string $filename, ?int $lineno)
    {
      echo 'before';
    },
    static function (mixed $object, array $params, mixed $return, ?Throwable $exception)
    {
      echo 'after';
    }
);
```

In the same way, we implemented tracing support for the most important
`interfaces/libraries/frameworks` that are parts of
[Contrib](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation)
repo. Each `auto-instrumentation` package uses above `hook` function in order to
register and provide tracing functionality. One missing thing, not mentioned yet
is an `API and SDK` used to create traces and other necessary components. This
is content and responisibility of
[main](https://github.com/open-telemetry/opentelemetry-php) repo which is
foundation for everything.

![php-rel](php-rel.png)

## How to use it

All components necessary for auto-instrumentation can be installed manually,
however we invested time to lower the barier and created an installer that can
do that for you. This section will show how auto-instrument simple php `laravel`
application created from scratch.

First step is to create a demo application. Here we use the popular
[laravel](https://laravel.com/docs/10.x/installation). framework:

```sh
composer create-project laravel/laravel example-app
```

Next, we have to install
[opentelemetry-instrumentation-installer](https://packagist.org/packages/open-telemetry/opentelemetry-instrumentation-installer).

```
cd example-app
composer require open-telemetry/opentelemetry-instrumentation-installer
```

Opentelemetry instrumentation installer works in two modes:

- basic (installs everything with most recent version)
- advanced (gives control to the user)

After installation we have to run `install-otel-instrumentation` with either
`basic` or `advanced` switch as below.

```
./vendor/bin/install-otel-instrumentation basic
```

and last step is to run your application by another tool
`run-with-otel-instrumentation` that ask you for few settings and finally
executes the provided command,
`php -S localhost:8080 -t public public/index.php` in this case.

**NOTE** Everything that `run-with-otel-instrumentation` is doing can be done by
hand by setting needed environment variables and running application as usual.
It was created for convenience for rapidly testing out open-telemetry against an
application and providing working default configuration.

```
./vendor/bin/run-with-otel-instrumentation php -S localhost:8080 -t public public/index.php
```

Now, as a result of triggering request to `http://localhost:8080` you should see
following result in
[jaeger](https://www.jaegertracing.io/docs/1.42/getting-started/)

![laravel-auto](laravel-auto.png)

## Current status and next steps

We have all necessary components in place:

- APIs and SDK as a foundation and implementation of opentelemetry
  specification.
- C extension as a foundation for auto-instrumentation.
- Auto Instrumentation support (WIP) for most important and popular libraries
  and frameworks.
- Development tools that can help lower barrier for users and developers
  interested in instrumenting arbitrary code.
- [Documentation](https://opentelemetry.io/docs/instrumentation/php/automatic/)

One of our goals is to increase awareness of this work and involve more people
that will help us improve it, extend coverage and fix bugs.

Please try it out and give us feedback. If you encounter any problems, you can
open an
[issue](https://github.com/open-telemetry/opentelemetry-php/issues/new/choose).
Questions? Feel free to reach out to us in the CNCF
[#otel-php](https://cloud-native.slack.com/archives/C01NFPCV44V) Slack channel,
or come to our SIG meeting, which you can find on the
[OTel public calendar](https://calendar.google.com/calendar/embed?src=google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com).
