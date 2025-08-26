---
title: ডকার ডেপ্লয়মেন্ট
linkTitle: ডকার
aliases: [docker_deployment]
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
cSpell:ignore: otlphttp spanmetrics tracetest tracetesting
---

<!-- markdownlint-disable code-block-style ol-prefix -->

## পূর্বশর্ত {#prerequisites}

- ডকার
- [ডকার কম্পোজ](https://docs.docker.com/compose/install/) v2.0.0+
- Make (optional)
- অ্যাপ্লিকেশনের জন্য ৬ জিবি RAM

## ডেমো সংগ্রহ ও চালানো {#get-and-run-the-demo}

1. ডেমো রিপোজিটরি ক্লোন করুন:

    ```shell
    git clone https://github.com/open-telemetry/opentelemetry-demo.git
    ```

2. ডেমো ফোল্ডারে যান:

    ```shell
    cd opentelemetry-demo/
    ```

3. ডেমো চালু করুন[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

4. (Optional) API observability-driven টেস্টিং সক্রিয় করুন[^1]:

    {{< tabpane text=true >}} {{% tab Make %}}

```shell
make run-tracetesting
```

    {{% /tab %}} {{% tab Docker %}}

```shell
docker compose -f docker-compose-tests.yml run traceBasedTests
```

    {{% /tab %}} {{< /tabpane >}}

## ওয়েব স্টোর ও টেলিমেট্রি যাচাই করুন {#verify-the-web-store-and-telemetry}

ইমেজগুলো বিল্ড হয়ে কন্টেইনারগুলো চালু হলে, আপনি অ্যাক্সেস করতে পারবেন:

- ওয়েব স্টোর: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- লোড জেনারেটর UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Tracetest UI: <http://localhost:11633/>, শুধুমাত্র
  `make run-tracetesting` ব্যবহার করলে
- Flagd configurator UI: <http://localhost:8080/feature>

## ডেমোর প্রাইমারি পোর্ট নম্বর পরিবর্তন {#changing-the-demos-primary-port-number}

ডিফল্টভাবে, ডেমো অ্যাপ্লিকেশনটি ব্রাউজার ট্রাফিকের জন্য 8080 পোর্টে একটি প্রক্সি চালু করে।
পোর্ট নম্বর পরিবর্তন করতে, ডেমো চালানোর আগে `ENVOY_PORT` এনভায়রনমেন্ট
ভ্যারিয়েবল সেট করুন।

- উদাহরণস্বরূপ, ৮০৮১ পোর্ট ব্যবহার করতে চাইলে[^1]:

  {{< tabpane text=true >}} {{% tab Make %}}

```shell
ENVOY_PORT=8081 make start
```

    {{% /tab %}} {{% tab Docker %}}

```shell
ENVOY_PORT=8081 docker compose up --force-recreate --remove-orphans --detach
```

    {{% /tab %}} {{< /tabpane >}}

## নিজের ব্যাকএন্ড ব্যবহার করুন {#bring-your-own-backend}

সম্ভবত আপনি ওয়েব স্টোরটি আগে থেকে বিদ্যমান একটি অবজার্ভেবিলিটি ব্যাকএন্ড
(যেমন, Jaeger, Zipkin, অথবা [আপনার পছন্দের ভেন্ডর](/ecosystem/vendors/))-এর
জন্য একটি ডেমো অ্যাপ্লিকেশন হিসেবে ব্যবহার করতে চাইছেন।

OpenTelemetry Collector ব্যবহার করে একাধিক ব্যাকএন্ডে টেলিমেট্রি ডেটা
এক্সপোর্ট করা যায়। ডেমো অ্যাপ্লিকেশনের কালেক্টর ডিফল্টভাবে দুটি ফাইল থেকে
কনফিগারেশন মার্জ করে:

- `otelcol-config.yml`
- `otelcol-config-extras.yml`

আপনার ব্যাকএন্ড যোগ করতে, ফাইলটি
[src/otel-collector/otelcol-config-extras.yml](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/otel-collector/otelcol-config-extras.yml)
এডিটরে খুলুন।

- প্রথমে একটি নতুন এক্সপোর্টার যোগ করুন। উদাহরণস্বরূপ, যদি আপনার ব্যাকএন্ড HTTP
  এর বদলে OTLP সমর্থন করে, তাহলে নিচের মতো যোগ করুন:

  ```yaml
  exporters:
    otlphttp/example:
      endpoint: <your-endpoint-url>
  ```

- এরপর, আপনার ব্যাকএন্ডের জন্য যেসব টেলিমেট্রি পাইপলাইনে `এক্সপোর্টার` ব্যবহার করতে চান,
  সেগুলো ওভাররাইড করুন।

  ```yaml
  service:
    pipelines:
      traces:
        exporters: [spanmetrics, otlphttp/example]
  ```

{{% alert title="নোট" %}} Collector-এ YAML ভ্যালুগুলো মার্জ করার সময় অবজেক্টগুলো
মার্জ হয় এবং array-গুলো রিপ্লেস হয়। `traces` পাইপলাইনের এক্সপোর্টার ওভাররাইড
করলে `spanmetrics` এক্সপোর্টার অবশ্যই array-তে থাকতে হবে, না হলে ত্রুটি হবে।
{{% /alert %}}

ভেন্ডর ব্যাকএন্ডে অথেন্টিকেশনের প্রয়োজনে আপনাকে অতিরিক্ত প্যারামিটার যোগ করতে হতে
পারে, তাদের ডকুমেন্টেশন দেখুন। কিছু ব্যাকএন্ডের প্রয়োজনে আলাদা এক্সপোর্টার লাগতে পারে,
আপনি সেগুলোর ডকুমেন্টেশন
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) এ পেতে পারেন।।

`otelcol-config-extras.yml` আপডেট করার পর `make start` চালিয়ে ডেমোটি চালু করুন।
পাশাপাশি কিছুক্ষণ পরে, আপনি আপনার ব্যাকএন্ডে ট্রেসগুলি প্রবাহিত হতে
দেখতে পাবেন।

[^1]: {{% param notes.docker-compose-v2 %}}
