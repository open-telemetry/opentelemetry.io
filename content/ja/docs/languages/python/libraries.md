---
title: 計装ライブラリの使用
linkTitle: ライブラリ
weight: 40
default_lang_commit: 748555c22f43476291ae0c7974ca4a2577da0472
cSpell:ignore: httpx instrumentor uninstrument
---

{{% docs/languages/libraries-intro "python" %}}

## 計装ライブラリを使用する {#use-instrumentation-libraries}

ライブラリにネイティブのOpenTelemetryサポートが含まれていない場合は、[計装ライブラリ](/docs/specs/otel/glossary/#instrumentation-library)を使用して、ライブラリまたはフレームワークのテレメトリーデータを生成できます。

たとえば、[HTTPX用の計装ライブラリ](https://pypi.org/project/opentelemetry-instrumentation-httpx/)は、HTTPリクエストに基づいて[スパン](/docs/concepts/signals/traces/#spans)を自動的に作成します。

## セットアップ {#setup}

各計装ライブラリは、pipを使用して個別にインストールできます。
たとえば、次のとおりです。

```sh
pip install opentelemetry-instrumentation-{instrumented-library}
```

前述の例では、`{instrumented-library}`は計装の名前です。

開発版をインストールするには、`opentelemetry-python-contrib`リポジトリをクローンまたはフォークし、次のコマンドを実行して編集可能なインストールを行います。

```sh
pip install -e ./instrumentation/opentelemetry-instrumentation-{integration}
```

インストール後は、計装ライブラリを初期化する必要があります。
各ライブラリには通常、独自の初期化方法があります。

## HTTPX計装の例 {#example-with-httpx-instrumentation}

`httpx`ライブラリを使用して行われるHTTPリクエストを計装する方法を紹介します。

まず、pipを使用して計装ライブラリをインストールします。

```sh
pip install opentelemetry-instrumentation-httpx
```

次に、計装を有効にして、すべてのクライアントからのリクエストを自動的にトレースします。

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

url = "https://some.url/get"
HTTPXClientInstrumentor().instrument()

with httpx.Client() as client:
     response = client.get(url)

async with httpx.AsyncClient() as client:
     response = await client.get(url)
```

### 計装を無効にする {#turn-off-instrumentations}

必要に応じて、`uninstrument_client`メソッドを使用して特定のクライアントまたはすべてのクライアントの計装を解除できます。
たとえば、次のとおりです。

```python
import httpx
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

HTTPXClientInstrumentor().instrument()
client = httpx.Client()

# 特定のクライアントの計装を解除
HTTPXClientInstrumentor.uninstrument_client(client)

# すべてのクライアントの計装を解除
HTTPXClientInstrumentor().uninstrument()
```

## 利用可能な計装ライブラリ {#available-instrumentation-libraries}

OpenTelemetryが提供する計装ライブラリの完全な一覧は、[opentelemetry-python-contrib][]リポジトリで確認できます。

利用可能なさらに多くの計装は、[レジストリ](/ecosystem/registry/?language=python&component=instrumentation)でも確認できます。

## 次のステップ {#next-steps}

計装ライブラリをセットアップした後は、カスタムのテレメトリーデータを収集するために、コードに独自の[計装](/docs/languages/python/instrumentation)を追加したいと思うかもしれません。

また、適切なエクスポーターを設定して、1つ以上のテレメトリーバックエンドに[テレメトリーデータをエクスポート](/docs/languages/python/exporters)することもできます。

さらに、[Pythonのゼロコード計装](/docs/zero-code/python/)も確認できます。

[opentelemetry-python-contrib]: https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation#readme
