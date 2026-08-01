---
default_lang_commit: 1f686d5f7b6bbdfaa30dafdc6ca0214c6f2308db
---

## Zipkin {#zipkin}

### バックエンドのセットアップ {#zipkin-setup}

> [!NOTE]
>
> すでにZipkinまたはZipkin互換のバックエンドをセットアップしている場合は、このセクションをスキップして、アプリケーション用の[Zipkinエクスポーターの依存関係](#zipkin-dependencies)をセットアップしてください。

以下のコマンドを実行して、[Zipkin](https://zipkin.io/)をDockerコンテナで実行できます。

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
