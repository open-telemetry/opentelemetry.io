---
title: 属性値でメトリクスとトレースをフィルタリングする
linkTitle: データのフィルタリング
description: 属性値でメトリクスとトレースをフィルタリングするように OBI を設定する
weight: 40
default_lang_commit: f7dab5cfc4d44a8c788b7e02d07ec1e1d84e3845
---

属性の値に基づいて、レポートするメトリクスやトレースを非常に具体的なイベントタイプに限定したい場合があります(たとえば、TCP トラフィックのみをレポートするようにネットワークメトリクスをフィルタリングする、など)。

`filter` YAML セクションでは、アプリケーションとネットワークの両方のメトリクスを属性値でフィルタリングできます。
以下の構造になっています。

```yaml
filter:
  application:
    # アプリケーションメトリクスを制限する属性マッチのマップ
  network:
    # ネットワークメトリクスを制限する属性マッチのマップ
```

アプリケーションとネットワークファミリーに属するメトリクスとその属性の一覧については、[OBI のエクスポートメトリクス](../../metrics/)ドキュメントを参照してください。

`application` と `network` の各フィルターセクションはマップで、各キーは属性名(Prometheus または OpenTelemetry 形式)で、値として文字列または数値マッチャー(後述)を持ちます。
文字列マッチングには `match` または `not_match` プロパティを使用できます。
どちらのプロパティも [glob 風](https://github.com/gobwas/glob) の文字列を受け付けます(完全な値またはワイルドカードを含む文字列)。
`match` プロパティを設定すると、OBI はその属性について指定した値に一致するメトリクスとトレースのみをレポートします。
`not_match` プロパティは `match` の否定です。

以下の例では、UDP プロトコルを除き、宛先ポート 53 を対象とする接続についてネットワークメトリクスをレポートします。

```yaml
filter:
  network:
    transport:
      not_match: UDP
    dst_port:
      match: '53'
```

## 数値フィルター {#numeric-filters}

OBI v0.6.0 以降では、数値フィルターも使用できます。
たとえば、以下の例ではサーバーポートが 8000 以上のすべてのスパンが含まれます。

```yaml
filter:
  application:
    server.port:
      greater_equals: 8000
```

以下のマッチャーが使用できます。

- greater_than
- greater_equals
- equals
- not_equals
- less_equals
- less_than

数値フィルターと文字列マッチャーは組み合わせて使用できます。

```yaml
filter:
  network:
    transport:
      not_match: UDP
    dst_port:
      less_than: 1024
```
