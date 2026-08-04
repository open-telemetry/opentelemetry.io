---
title: OpenTelemetry
description: استاندارد باز برای تله متری
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
default_lang_commit: 3aa0f7a25cd2f7878cad1665e67937c5e9c70694
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
    بیشتر بدانید
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    دموی OpenTelemetry را امتحان کنید
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="جست و جو در مستندات OpenTelemetry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="نمای کلی OpenTelemetry" %}}

**OpenTelemetry** یک چارچوب مشاهده پذیری متن باز برای نرم افزارهای بومی ابری
است. این چارچوب مجموعه ای یکپارچه از APIها، کتابخانه ها، عامل ها و سرویس های
جمع آوری کننده را برای ثبت ردگیری های توزیع شده و متریک های برنامه شما فراهم
می کند.

OpenTelemetry بر پایه سال ها تجربه پروژه های OpenTracing و OpenCensus و با
ترکیب بهترین ایده ها و شیوه های جامعه شکل گرفته است.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="ابزارگذاری مستقل از ارائه دهنده"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

کد خود را فقط یک بار با استفاده از APIها و SDKهای OpenTelemetry ابزارگذاری کنید.
داده های تله متری را به هر بک اند مشاهده پذیری، از جمله Jaeger، Prometheus،
راهکارهای تجاری یا راهکار اختصاصی خودتان صادر کنید. بدون دست زدن به کد برنامه،
بک اند را تغییر دهید.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="سیگنال های یکپارچه مشاهده پذیری"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

ردگیری ها، متریک ها و لاگ ها را با زمینه مشترکی که در سراسر مسیر درخواست جریان
دارد، به یکدیگر مرتبط کنید. تصویری کامل از رفتار برنامه خود در تمام اجزا و
سرویس ها به دست آورید.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="قابل اجرا در هر محیط"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry کاملاً متن باز و مستقل از ارائه دهنده است. آن را با انعطاف پذیری
کامل و بدون وابستگی به ارائه دهنده، در زیرساخت داخلی، محیط های ترکیبی یا چندین
فضای ابری مستقر کنید. بارهای کاری را به هر جایی که برایتان مناسب تر است منتقل
کنید.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="سیگنال های مشاهده پذیری" >}}
{{< homepage/signal name="ردگیری ها" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
ردگیری های توزیع شده {{< /homepage/signal >}}
{{< homepage/signal name="متریک ها" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
اندازه گیری ها در طول زمان {{< /homepage/signal >}}
{{< homepage/signal name="لاگ ها" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
رکوردهای دارای برچسب زمانی {{< /homepage/signal >}}
{{< homepage/signal name="بار همراه" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
فراداده زمینه ای {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="ویژگی های OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="ابزارگذاری خودکار" url="/docs/concepts/instrumentation/zero-code/" >}}
با ابزارگذاری بدون کد برای چارچوب ها و کتابخانه های پرکاربرد، تنها در چند دقیقه
شروع کنید. عامل های ابزارگذاری خودکار، ردگیری ها، متریک ها و لاگ ها را بدون
تغییر کد منبع شما ثبت می کنند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="خط لوله جمع آوری" url="/docs/collector/" >}}
داده های تله متری را با OpenTelemetry Collector پردازش، فیلتر و مسیریابی کنید.
آن را به صورت عامل یا دروازه مستقر کنید تا داده های تله متری را در مقیاس بالا و
با بیش از ۲۰۰ مؤلفه دریافت، پردازش و صادر کند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="انتشار زمینه" url="/docs/concepts/context-propagation/" >}}
ردگیری ها را به طور خودکار در مرز سرویس ها به یکدیگر مرتبط کنید. زمینه
توزیع شده در سراسر مسیر درخواست جریان می یابد و لاگ ها، متریک ها و ردگیری ها را
در نمایی یکپارچه به هم متصل می کند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="پشتیبانی از چند زبان" url="/docs/languages/" >}}
SDKهای بومی برای بیش از ۱۲ زبان، از جمله Java، Kotlin، Python، Go، JavaScript،
.NET، Ruby، PHP، Rust، C++، Swift و Erlang. با زبان دلخواه خود و با پشتیبانی
درجه یک OpenTelemetry توسعه دهید. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="پایدار و آماده برای محیط عملیاتی" url="/status/" >}}
APIهای ردگیری و متریک در تمام زبان های اصلی پایدار هستند. هزاران سازمان
OpenTelemetry را در محیط عملیاتی اجرا می کنند. CNCF و ارائه دهندگان بزرگ خدمات
ابری از آن پشتیبانی می کنند. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="مشخصات باز" url="/docs/specs/status/" >}}
این پروژه بر مشخصات باز و مستقل از ارائه دهنده برای APIها، SDKها و پروتکل انتقال
داده (OTLP) بنا شده است. حاکمیت شفاف زیر نظر CNCF، پایداری بلندمدت و تکامل
جامعه محور پروژه را تضمین می کند. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="اکوسیستم OpenTelemetry" >}}
{{< homepage/stat type="languages" label="زبان ها" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="مؤلفه های Collector" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="یکپارچه سازی ها" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="ارائه دهندگان" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="مورد اعتماد پیشروان صنعت"
    limit="10"
    ctaText="مشاهده همه پذیرندگان"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry یک پروژه [فارغ التحصیل شده][graduated] در [CNCF][] است**.<br>
این پروژه از ادغام پروژه های OpenTracing و OpenCensus شکل گرفته است.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[graduated]: https://www.cncf.io/projects/

{{% /blocks/section %}}
