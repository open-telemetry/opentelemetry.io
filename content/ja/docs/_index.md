---
title: ドキュメント
menu: { main: { weight: 10 } }
htmltest:
  IgnoreDirs:
    # TODO drop next lines after https://github.com/open-telemetry/opentelemetry.io/issues/5555 is fixed for these pages:
    - ^ja/docs/concepts/components/
    - ^ja/docs/concepts/glossary/
    - ^ja/docs/concepts/signals/baggage/
    - ^ja/docs/languages/erlang/sampling/
    - ^ja/docs/languages/js/sampling/
    - ^ja/docs/languages/ruby/sampling/
    - ^ja/docs/zero-code/php/
default_lang_commit: c2cd5b14
---

OTelの略称でも知られるOpenTelemetryは、[トレース](concepts/signals/traces/)、[メトリクス](concepts/signals/metrics/)、[ログ](concepts/signals/logs/)のようなテレメトリーデータを計装、生成、収集、エクスポートするためのベンダー非依存なオープンソースの[オブザーバビリティ](concepts/observability-primer/#what-is-observability)フレームワークです。

業界標準として、OpenTelemetryは[40以上のオブザーバビリティベンダーによってサポートされ](/ecosystem/vendors/)、多くの[ライブラリ、サービス、アプリ](/ecosystem/integrations/)によって統合され、[多くのエンドユーザー](/ecosystem/adopters/)によって採用されています。

![OpenTelemetry Reference Architecture](/img/otel-diagram.svg)
