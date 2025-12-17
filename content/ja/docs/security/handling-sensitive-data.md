---
title: 機微データの取り扱い
description: OpenTelemetryにおける機微データの取り扱いに関するベストプラクティスとガイダンス
weight: 100
default_lang_commit: 5b82e8f9c057d4d4961d41091a4bc75fc9b5b37c
---

OpenTelemetryを計装する際には、機密データの取り扱いに注意することが重要です。
テレメトリーデータの収集には、さまざまなプライバシー規制やコンプライアンス要件の対象となる可能性のある機密情報や個人情報を、知らず知らずのうちにキャプチャしてしまうリスクが常に伴います。

## あなたの責任 {#your-responsibility}

OpenTelemetryはテレメトリーデータを収集しますが、あなたの特定のコンテキストでどのデータが機密であるかを独自に判断することはできません。
計装する人には以下の責任があります。

- 適用されるプライバシー法および規制の遵守を確保する。
- テレメトリーデータ内の機密情報を保護する。
- データ収集に必要な同意を得る。
- 適切なデータ処理および保存方法を実装する。

さらに、どの計装ライブラリも機密情報を収集および公開する可能性があるため、使用する計装ライブラリによって発行されるテレメトリーデータを理解し、レビューする責任があります。

## 機密データに関する考慮事項 {#sensitive-data-considerations}

シチュエーションによって機微データの定義は異なります。
たとえば以下が含まれます。

- 個人を特定できる情報(PII)
- 認証情報
- セッショントークン
- 財務情報
- 健康関連データ
- ユーザー行動データ

## データの最小化 {#data-minimization}

テレメトリーを通じて潜在的に機密性の高いデータを収集する場合は、[データの最小化](https://en.wikipedia.org/wiki/Data_minimization)の原則に従ってください。
これは以下のことを意味します。

- オブザーバビリティの目的に役立つデータのみを収集する。
- 絶対に必要でない限り、個人情報の収集を避ける。
- 集計されたデータや匿名化されたデータが同じ目的に役立つかどうかを検討する。
- 収集したデータが引き続き必要であることを定期的に確認する。

## 機密データの保護 {#protecting-sensitive-data}

前のセクションで概説したように、機密データの収集を防ぐ最善の方法は、機密である可能性のあるデータを収集しないことです。
しかし、特定の状況下では機密データを収集した場合や、収集されるデータを完全に制御できない場合があり、後処理でデータをスクレイピングする方法が必要になることがあります。
以下の提案は、そのような場合に役立ちます。

[OpenTelemetryコレクター](/docs/collector)には、機密データの管理に役立ついくつかのプロセッサーがあります。

- [`attribute` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/attributesprocessor):
  特定の属性を削除または変更します。
- [`filter` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/filterprocessor):
  機密データを含むスパンやメトリクス全体をフィルタリングします。
- [`redaction` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/redactionprocessor):
  許可された属性のリストと一致しないスパン、ログ、およびメトリクスデータポイント属性を削除します。
- [`transform` プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor):
  正規表現を使用してデータを変換します。

### ユーザー情報の削除とハッシュ化 {#deleting-and-hashing-user-information}

`attribute` プロセッサーの次の構成は、機密な[`user`](/docs/specs/semconv/registry/attributes/user/#user-hash)情報から`user.email`をハッシュ化し、`user.full_name`を削除しています。

```yaml
processors:
  attributes/example:
    actions:
      - key: user.email
        action: hash
      - key: user.full_name
        action: delete
```

### `user.id` を `user.hash` に置き換える {#replacing-userid-with-userhash}

`transform` プロセッサーの次の構成は、`user.id`を削除し、`user.hash`に置き換えるために使用できます。

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - set(attributes["user.hash"], SHA256(attributes["user.id"]))
        - delete_key(attributes, "user.id")
```

{{% alert title="匿名化のためのハッシュ化のリスクと限界" color="warning" %}}

入力スペースが小さく予測可能(たとえば数値のユーザーID)である場合、ハッシュは実際には逆変換可能であるため、ユーザーのIDや名前をハッシュ化しても必要なレベルの匿名化にはならない可能性があります。

{{% /alert %}}

### IPアドレスの切り捨て {#truncating-ip-addresses}

ハッシュ化のかわりに、データを切り捨てたり、共通の接頭辞や接尾辞でグループ化したりすることもできます。
たとえば以下が当てはまります。

- 年のみ、または年月のみを保持して日を削除した日付。
- ローカル部分を削除してドメインのみを保持するメールアドレス。
- IPv4の最後のオクテット、またはIPv6の最後の80ビットを削除したIPアドレス。

`transform` プロセッサーの次の構成は、`client.address` 属性の最後のオクテットを削除します。

```yaml
transform:
  trace_statements:
    - context: span
      statements:
        - replace_pattern(attributes["client.address"], "\\.\\d+$", ".0")
```

### redactionプロセッサーで属性を削除する {#delete-attributes-with-redaction-processor}

最後に、`redaction` プロセッサーで特定の属性を削除する例は、コレクター構成のセキュリティベストプラクティスページの[「機密データの削除」](/docs/security/config-best-practices/#scrub-sensitive-data)セクションに記載されています。
