---
title: 計装の設定
linkTitle: 計装の設定
weight: 100
default_lang_commit: d18938b8ff4dfb2ed696f976815225f7ad8ed2a3
cSpell:ignore: enduser hset serverlessapis
---

このページでは、複数の計装に同時に適用される共通設定について説明します。

## ピアサービス名 {#peer-service-name}

[ピアサービス名](/docs/specs/semconv/general/attributes/#general-remote-service-attributes)は、接続先のリモートサービスの名前です。
ローカルサービスの[リソース](/docs/specs/semconv/resource/#service)における `service.name` に対応します。

{{% config_option name="otel.instrumentation.common.peer-service-mapping" %}}

ホスト名または IP アドレスからピアサービスへのマッピングを、`<host_or_ip>=<user_assigned_name>` のペアをカンマ区切りのリストとして指定するために使用します。
ホストまたは IP アドレスがマッピングに一致するスパンに、ピアサービスが属性として追加されます。

たとえば、以下のように設定した場合：

```text
1.2.3.4=cats-service,dogs-abcdef123.serverlessapis.com=dogs-api
```

`1.2.3.4` へのリクエストには `peer.service` 属性として `cats-service` が設定され、`dogs-abcdef123.serverlessapis.com` へのリクエストには `dogs-api` という属性が設定されます。

Java エージェントバージョン `1.31.0` 以降では、`peer.service` を定義するためにポートとパスを指定することも可能です。

たとえば、以下のように設定した場合：

```text
1.2.3.4:443=cats-service,dogs-abcdef123.serverlessapis.com:80/api=dogs-api
```

`1.2.3.4` へのリクエストには `peer.service` 属性の上書きはありませんが、`1.2.3.4:443` には `peer.service` として `cats-service` が設定され、`dogs-abcdef123.serverlessapis.com:80/api/v1` へのリクエストには `dogs-api` という属性が設定されます。

{{% /config_option %}}

## DB ステートメントのサニタイズ {#db-statement-sanitization}

エージェントは、`db.statement` セマンティック属性を設定する前に、すべてのデータベースクエリ/ステートメントをサニタイズします。
クエリ文字列内のすべての値（文字列、数値）は疑問符（`?`）に置き換えられます。

注意：JDBC バインドパラメーターは `db.statement` にキャプチャされません。
バインドパラメーターのキャプチャについては、[対応するイシュー](https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/7413)を参照してください。

例：

- SQL クエリ `SELECT a from b where password="secret"` は、エクスポートされたスパンでは `SELECT a from b where password=?` として表示されます。
- Redis コマンド `HSET map password "secret"` は、エクスポートされたスパンでは `HSET map password ?` として表示されます。

この動作はすべてのデータベース計装でデフォルトで有効になっています。
無効にするには、以下のプロパティを使用してください：

{{% config_option
name="otel.instrumentation.common.db-statement-sanitizer.enabled"
default=true
%}} DB ステートメントのサニタイズを有効にします。
{{% /config_option %}}

## メッセージング計装におけるコンシューマーメッセージ受信テレメトリーのキャプチャ {#capturing-consumer-message-receive-telemetry-in-messaging-instrumentations}

メッセージング計装でコンシューマーメッセージ受信テレメトリーをキャプチャするようにエージェントを設定できます。
有効にするには、以下のプロパティを使用してください：

{{% config_option
name="otel.instrumentation.messaging.experimental.receive-telemetry.enabled"
default=false
%}} コンシューマーメッセージ受信テレメトリーを有効にします。
{{% /config_option %}}

これにより、コンシューマー側で新しいトレースが開始され、プロデューサーのトレースとはスパンリンクのみで接続されることに注意してください。

> **Note**: テーブルに記載されているプロパティ/環境変数名はまだ実験的なものであり、変更される可能性があります。

## エンドユーザー属性のキャプチャ {#capturing-enduser-attributes}

[JavaEE/JakartaEE Servlet](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/servlet) や [Spring Security](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring/spring-security-config-6.0) などの計装ライブラリから、[一般的な ID 属性](/docs/specs/semconv/registry/attributes/enduser/)（`enduser.id`、`enduser.role`、`enduser.scope`）をキャプチャするようにエージェントを設定できます。

> **Note**: 関係するデータの機密性を考慮して、この機能はデフォルトで無効になっていますが、特定の属性に対して選択的に有効化できます。
> データの収集を有効にする前に、各属性のプライバシーへの影響を慎重に評価する必要があります。

{{% config_option
name="otel.instrumentation.common.enduser.id.enabled"
default=false
%}} `enduser.id` セマンティック属性をキャプチャするかどうかを決定します。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.role.enabled"
default=false
%}} `enduser.role` セマンティック属性をキャプチャするかどうかを決定します。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.common.enduser.scope.enabled"
default=false
%}} `enduser.scope` セマンティック属性をキャプチャするかどうかを決定します。
{{% /config_option %}}

### Spring Security {#spring-security}

カスタムの[付与された権限の接頭辞](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#authz-authorities)を使用する Spring Security ユーザーは、以下のプロパティを使用して `enduser.*` 属性値からそれらの接頭辞を除去し、実際のロール名とスコープ名をより適切に表現できます：

{{% config_option
name="otel.instrumentation.spring-security.enduser.role.granted-authority-prefix"
default=ROLE_
%}} `enduser.role` セマンティック属性にキャプチャするロールを識別する、付与された権限の接頭辞。
{{% /config_option %}}

{{% config_option
name="otel.instrumentation.spring-security.enduser.scope.granted-authority-prefix"
default=SCOPE_
%}} `enduser.scopes` セマンティック属性にキャプチャするスコープを識別する、付与された権限の接頭辞。
{{% /config_option %}}
