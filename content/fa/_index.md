---
title: OpenTelemetry
description: استاندارد باز برای تلمنتری
developer_note:
  کد کوچک blocks/cover (که در پایین تر هم استفاده شده) از تصویری که دارای کلمه "background" هست به عنوان بکگراند استفاده میکند.
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    آشنایی بیشتر
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    تست نمونه
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="جستوجو در مستندات OpenTelementry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="OpenTelemetry بررسی" %}}

**OpenTelemetry** یک فریم ورک متن باز برای سیستم های ابری (Cloud Native) است. این فریم ورک مجموعه ای یکپارچه از APIها، کتابخانه ها، عامل ها (Agents) و سرویس های جمع آوری (Collectors) ارائه می دهد که امکان دریافت ردگیری های توزیع شده (Distributed Traces) و متریک ها (Metrics) را فراهم می کند.

OpenTelemetry بر پایهٔ سال ها تجربهٔ پروژه های OpenTracing و OpenCensus شکل گرفته و بهترین ایده ها،  و شیوه های جامعهٔ متن باز خود را جمع کرده است.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="ابزار مستقل از ارایه دهندگان خدمات"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

فقط یک بار با استفاده از APIها و SDKهای OpenTelemetry کد خود را ابزارگذاری کنید. سپس داده های تله متری را به هر ساختار مشاهده پذیری، از جمله Jaeger، Prometheus، ارایه دهنده راهکار های تجاری یا حتی زیرساخت اختصاصی خودتان ارسال کنید. بدون نیاز به تغییر در کد برنامه، می توانید از ساختار های مختلف استفاده کنید.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="سیگنال های مشاهده پذیری یکپارچه"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

با متصل کردن ردگیری ها (Traces)، معیارها (Metrics) و لاگ ها (Logs) از طریق یک زمینه مشترک (Shared Context) که در مسیر کامل درخواست جریان دارد، یک تصویر کامل از رفتار سیستم در همهٔ اجزا و سرویس ها به دست آورید.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="قابل اجرا در هر محیط"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry به صورت ۱۰۰٪ متن باز و مستقل از  ارایه دهندگان خدمات است. می توانید آن را در محیط های داخلی، محیط های ترکیبی یا در چندین فضای ابری با حداکثر انعطاف پذیری و بدون وابستگی مستقر کنید. بارهای کاری  (Workloads) خود را هر جا که برایتان مهم تر است جابه جا کنید.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="سیگنالهای مشاهده پذیری" >}}
{{< homepage/signal name="ردگیری ها" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Distributed traces {{< /homepage/signal >}}
{{< homepage/signal name="معیارها" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
سنجش در بازه زمانی {{< /homepage/signal >}}
{{< homepage/signal name="Logs" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
داده های ثبت شده زمانی {{< /homepage/signal >}}
{{< homepage/signal name="داده های همراه" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
داده های تکمیلی وابسته به زمینه {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="امکانات OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="ابزار گذاری خودکار" url="/docs/concepts/instrumentation/zero-code/" >}}
تنها در چند دقیقه شروع کنید؛ با ابزارگذاری بدون نیاز به نوشتن کد (Zero-code instrumentation) برای فریم ورک ها و کتابخانه های پرکاربرد. عامل های ابزارگذاری خودکار (Automatic instrumentation agents) داده های ردگیری (Traces)، متریک ها (Metrics) و لاگ ها (Logs) را بدون دست کاری در کد های تان ثبت می کنند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="پایپ لاین جمع آوری داده" url="/docs/collector/" >}}
با OpenTelemetry Collector، داده های تله متری (Telemetry data) را پردازش، فیلتر و مسیردهی کنید. آن را می توان به عنوان Agent (عامل) یا Gateway اجرا کرد تا داده های تله متری را در مقیاس بزرگ دریافت، پردازش و صادر کنید؛ با پشتیبانی از بیش از ۲۰۰ کامپوننت. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="انتشار Context" url="/docs/concepts/context-propagation/" >}}
ردگیری ها (Traces) را به صورت خودکار در مرز میان سرویس ها به یکدیگر متصل کنید. زمینه (Context) توزیع شده در سراسر مسیر درخواست جریان می یابد و لاگ ها، معیارها (Metrics) و ردگیری ها (Traces) را در یک نمای یکپارچه به هم متصل می کند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="پشتیبانی از زبان ها" url="/docs/languages/" >}}
OpenTelemetry برای بیش از ۱۲ زبان برنامه نویسی، از جمله Java، Kotlin، Python، Go، JavaScript، .NET، Ruby، PHP، Rust، C++، Swift و Erlang، دارای SDKهای بومی (Native SDKs) است. با زبان دلخواه خود و با پشتیبانی سطح اول از OpenTelemetry توسعه دهید. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="پایدار و آماده برای محیط عملیاتی" url="/status/" >}}
APIهای ردگیری (Tracing) و معیارها (Metrics) در تمام زبان های پرکاربرد به وضعیت عملیاتی رسیده اند. هزاران سازمان OpenTelemetry را در محیط عملیاتی (Production) اجرا می کنند. این پروژه از حمایت CNCF و بزرگ ترین ارائه دهندگان خدمات ابری برخوردار است. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="استاندارد های باز" url="/docs/specs/status/" >}}
این پروژه بر پایهٔ استاندارد های باز (Open Specifications) مستقل از ارایه دهندگان خدمات (Vendor-neutral) برای APIها، SDKها و پروتکل OTLP (Wire Protocol) بنا شده است. مدیریت شفاف (Transparent Governance) در CNCF تضمین می کند که پروژه در بلندمدت پایدار بماند و مسیر تکامل آن توسط جامعهٔ کاربران و مشارکت کنندگان شکل بگیرد. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="اکوسیستم OpenTelemetry" >}}
{{< homepage/stat type="languages" label="زبان ها" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="جمع آوری کننده اجزای" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="یکپارچه سازی" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="ارایه دهندگان" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="مورد اعتماد شرکت های پیشرو"
    limit="10"
    ctaText="مشاهده پذیرندگان"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry یک پروژه [CNCF][] [فارق التحصیل شده][]**.<br> شکل گرفته از پروژه های OpenTracing و OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduated]: https://www.cncf.io/projects/

{{% /blocks/section %}}