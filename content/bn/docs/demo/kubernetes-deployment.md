---
title: কুবারনেটিস ডেপ্লয়মেন্ট
linkTitle: কুবারনেটিস
aliases: [kubernetes_deployment]
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
cSpell:ignore: loadgen otlphttp spanmetrics
---

আমরা একটি
[OpenTelemetry ডেমো Helm চার্ট](/docs/platforms/kubernetes/helm/demo/) প্রদান করি,
যা বিদ্যমান কুবারনেটিস ক্লাস্টারে ডেমোটি ডিপ্লয় করতে সহায়তা করে।

চার্ট ব্যবহার করতে [Helm](https://helm.sh) ইনস্টল করা থাকতে হবে। শুরু করতে
অনুগ্রহ করে Helm-এর [ডকুমেন্টেশন](https://helm.sh/docs/) দেখুন।

## প্রয়োজনীয়তা {#prerequisites}

- Kubernetes 1.24+
- অ্যাপ্লিকেশনের জন্য ৬ জিবি ফ্রি RAM
- Helm 3.14+ (শুধুমাত্র Helm ইনস্টলেশন পদ্ধতির জন্য)

## Helm ব্যবহার করে ইনস্টল করুন (সুপারিশকৃত) {#install-using-helm-recommended}

OpenTelemetry Helm রিপোজিটরি যোগ করুন:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

my-otel-demo রিলিজ নামে চার্ট ইনস্টল করতে, নিচের
কমান্ডটি চালান:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

{{% alert title="নোট" %}}

OpenTelemetry ডেমো Helm চার্ট এক ভার্সন থেকে আরেকটিতে আপগ্রেড
সমর্থন করে না। আপগ্রেড করতে হলে, প্রথমে বিদ্যমান রিলিজ ডিলিট করে তারপর
নতুন ভার্সন ইনস্টল করতে হবে।

{{% /alert %}}

{{% alert title="নোট" %}}

নিচে উল্লেখিত সকল ইউসেজ মেথডস পারফর্ম করার জন্য OpenTelemetry ডেমো
Helm চার্টের সংস্করণ 0.11.0 বা তার বেশি ভার্সন প্রয়োজন।

{{% /alert %}}

## kubectl ব্যবহার করে ইনস্টল করুন {#install-using-kubectl}

নিম্নলিখিত কমান্ডটি আপনার কুবারনেটিস ক্লাস্টারে ডেমো অ্যাপ্লিকেশন
ইনস্টল করবে।

```shell
kubectl create --namespace otel-demo -f https://raw.githubusercontent.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml
```

{{% alert title="নোট" %}}

OpenTelemetry ডেমো কুবারনেটিস manifests এক ভার্সন থেকে আরেকটিতে আপগ্রেড সমর্থন করে না।
যদি আপনার ডেমো আপগ্রেড করার প্রয়োজন হয়, তাহলে আপনাকে প্রথমে বিদ্যমান রিসোর্স ডিলিট করে
ফেলতে হবে এবং তারপরে নতুন ভার্সনটি ইনস্টল করতে হবে।

{{% /alert %}}

{{% alert title="নোট" %}}

এই manifest-গুলো Helm চার্ট থেকে তৈরি এবং সুবিধার জন্য দেয়া হয়েছে।
ইনস্টলেশনের জন্য Helm চার্ট ব্যবহার করার পরামর্শ দেয়া হচ্ছে।

{{% /alert %}}

## ডেমো ব্যবহার করুন {#use-the-demo}

ডেমো অ্যাপ্লিকেশনের সার্ভিসগুলো ব্যবহার করতে হলে সেগুলোকে Kubernetes ক্লাস্টারের বাইরে
এক্সপোজ করতে হবে। আপনি `kubectl port-forward` কমান্ড কমান্ড ব্যবহার করে আপনার
লোকাল সিস্টেমে সার্ভিসগুলো এক্সপোজ করতে পারেন অথবা অপশনাল-ভাবে ডিপ্লয় করা ingress
রিসোর্স এর সাথে সার্ভিস টাইপ (যেমন: LoadBalancer) কনফিগার করে।

### kubectl port-forward ব্যবহার করে সার্ভিস এক্সপোজ করুন {#expose-services-using-kubectl-port-forward}

frontend-proxy সার্ভিস এক্সপোজ করতে নিচের কমান্ডটি ব্যবহার করুন (আপনার
Helm চার্ট রিলিজ namespace অনুযায়ী `default` পরিবর্তন করুন):

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

{{% alert title="নোট" %}}

`kubectl port-forward` প্রক্রিয়া শেষ না হওয়া পর্যন্ত পোর্ট প্রক্সি করে।
প্রতিটি `kubectl port-forward` ব্যবহারের জন্য আলাদা টার্মিনাল সেশন
লাগতে পারে এবং কাজ শেষে <kbd>Ctrl-C</kbd> দিয়ে প্রক্রিয়া বন্ধ
করতে হবে।

{{% /alert %}}

`frontend-proxy` port-forward সেটআপ করার পর, আপনি নিচের ঠিকানাগুলো-তে যেতে পারবেন:

- ওয়েব স্টোর: <http://localhost:8080/>
- Grafana: <http://localhost:8080/grafana/>
- লোড জেনারেটর UI: <http://localhost:8080/loadgen/>
- Jaeger UI: <http://localhost:8080/jaeger/ui/>
- Flagd configurator UI: <http://localhost:8080/feature>

### সার্ভিস বা ইনগ্রেস কনফিগারেশন ব্যবহার করে ডেমো কম্পোনেন্ট এক্সপোজ করুন {#expose-demo-components-using-service-or-ingress-configurations}

{{% alert title="নোট" %}} অতিরিক্ত কনফিগারেশন নির্ধারণ করতে Helm ইনস্টলেশনের
সময় values ফাইল ব্যবহারের পরামর্শ দেয়া হচ্ছে।
{{% /alert %}}

#### ইনগ্রেস রিসোর্স কনফিগার করুন {#configure-ingress-resources}

{{% alert title="নোট" %}}

সব Kubernetes ক্লাস্টারে LoadBalancer সার্ভিস টাইপ বা ইনগ্রেস রিসোর্স
চালু করার জন্য প্রয়োজনীয় অবকাঠামো নাও থাকতে পারে। ব্যবহার করার
আগে আপনার ক্লাস্টারে সাপোর্ট আছে কিনা যাচাই করুন।

{{% /alert %}}

প্রতিটি ডেমো কম্পোনেন্ট (যেমন: frontend-proxy) তার Kubernetes সার্ভিস টাইপ কনফিগার
করার একটি উপায় প্রদান করে। ডিফল্টভাবে এগুলো তৈরি হয় না, তবে আপনি প্রতিটি
কম্পোনেন্টের `ingress` প্রপার্টি ব্যবহার করে এগুলো চালু এবং কনফিগার করতে পারেন।

একটি ইনগ্রেস রিসোর্স ব্যবহার করার জন্য frontend-proxy কম্পোনেন্ট কনফিগার করতে
আপনাকে আপনার values ফাইলে নিচের মতো নির্দিষ্ট করতে হবে:

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

কিছু ইনগ্রেস কন্ট্রোলারের জন্য বিশেষ annotation বা সার্ভিস টাইপ প্রয়োজন। আরও তথ্যের
জন্য আপনার ইনগ্রেস কন্ট্রোলারের ডকুমেন্টেশন দেখুন।

#### সার্ভিস টাইপ কনফিগার করুন {#configure-service-types}

প্রতিটি ডেমো কম্পোনেন্ট (যেমন: frontend-proxy) তার Kubernetes সার্ভিস টাইপ কনফিগার
করার একটি উপায় প্রদান করে। ডিফল্টভাবে, এগুলি `ClusterIP` হবে তবে আপনি প্রতিটি
কম্পোনেন্টের `service.type` প্রপার্টি ব্যবহার করে প্রতিটি পরিবর্তন করতে পারেন।

LoadBalancer সার্ভিস টাইপ ব্যবহার করার জন্য frontend-proxy কম্পোনেন্ট কনফিগার করতে
আপনাকে আপনার values ফাইলে নিচের মতো উল্লেখ করতে হবে:

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

#### ব্রাউজার টেলিমেট্রি কনফিগার করুন {#configure-browser-telemetry}

ব্রাউজার থেকে স্প্যান-গুলি সঠিকভাবে সংগ্রহ করার জন্য, আপনাকে OpenTelemetry
Collector কোথায় এক্সপোজ হবে তাও নির্দিষ্ট করতে হবে। frontend-proxy collector-এর
জন্য `/otlp-http` এর পাথ prefix সহ একটি রুট নির্ধারণ করে। আপনি ফ্রন্টএন্ড
কম্পোনেন্টে নিম্নলিখিত environment variable সেট করে collector এন্ডপয়েন্ট কনফিগার
করতে পারেন:

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## নিজের ব্যাকএন্ড ব্যবহার করুন {#bring-your-own-backend}

সম্ভবত আপনি ওয়েব স্টোরটিকে আপনার ইতিমধ্যেই থাকা একটি অবজারভেবিলিটি ব্যাকএন্ডের
জন্য একটি ডেমো অ্যাপ্লিকেশন হিসাবে ব্যবহার করতে চান (যেমন, Jaeger, Zipkin - এর
একটি), অথবা [আপনার পছন্দের ভেন্ডর](/ecosystem/vendors/) এর কোনোটি।

OpenTelemetry Collector-এর কনফিগারেশন Helm চার্টে প্রদর্শিত হয়। আপনার করা যেকোনো
সংযোজন ডিফল্ট কনফিগারেশনে মার্জ করা হবে। আপনি এটি ব্যবহার করে আপনার নিজস্ব
এক্সপোর্টার যোগ করতে পারেন এবং তাদের পছন্দসই পাইপলাইনে যুক্ত করতে পারেন।

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>

    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

{{% alert title="নোট" %}} YAML মান-গুলিকে Helm-এর সাথে মার্জ করার সময়, অবজেক্ট-গুলিকে
মার্জ করা হয় এবং অ্যারে-গুলি রিপ্লেস করা হয়। ওভাররাইড করা হলে `traces` পাইপলাইনের জন্য
`spanmetrics` এক্সপোর্টার-কে অবশ্যই এক্সপোর্টার-দের অ্যারে-তে অন্তর্ভুক্ত করতে হবে।
এই এক্সপোর্টার-কে অন্তর্ভুক্ত না করলে একটি ত্রুটি দেখা দেবে। {{% /alert %}}

ভেন্ডর ব্যাকএন্ডের ক্ষেত্রে আপনাকে অথেন্টিকেশনের জন্য অতিরিক্ত প্যারামিটার যোগ করতে হতে পারে,
অনুগ্রহ করে তাদের ডকুমেন্টেশন দেখুন। কিছু ব্যাকএন্ডের জন্য আলাদা এক্সপোর্টার প্রয়োজন হয়, আপনি
সেগুলি এবং তাদের ডকুমেন্টেশন
[opentelemetry-collector-contrib/exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) এ পেতে পারেন।

একটি কাস্টম `my-values-file.yaml` values ফাইল সহ Helm চার্ট ইনস্টল করতে ব্যবহার করুন:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```
