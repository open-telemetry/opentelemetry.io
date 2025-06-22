---
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

## Zipkin {#zipkin}

### バックエンドのセットアップ {#zipkin-setup}

{{% alert title=注意 %}}

すでにZipkinまたはZipkin互換のバックエンドをセットアップしている場合は、このセクションをスキップして、アプリケーション用の[Zipkinエクスポーターの依存関係](#zipkin-dependencies)をセットアップしてください。

{{% /alert %}}

以下のコマンドを実行して、[Zipkin](https://zipkin.io/)をDockerコンテナで実行できます。

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
