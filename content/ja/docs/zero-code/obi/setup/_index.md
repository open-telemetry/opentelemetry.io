---
title: OBIをセットアップする
linkTitle: セットアップ
description: OBIのセットアップと実行方法を学びます。
weight: 10
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
---

OBIをセットアップして実行するには、さまざまなオプションがあります。

- [Helmを使用してKubernetesでOBIをセットアップする](kubernetes-helm/)
- [KubernetesでOBIをセットアップする](kubernetes/)
- [DockerでOBIをセットアップする](docker/)
- [スタンドアロンプロセスとしてOBIをセットアップする](standalone/)

構成オプションとデータエクスポートモードの詳細については、[OBIの構成](../configure/)ドキュメントを参照してください。

> [!NOTE]
>
> OBIを使用してトレースを生成する場合は、[ルートデコレーター](../configure/routes-decorator/)の構成に関するドキュメントセクションを必ずお読みください。
> OBIはコードを変更することなくアプリケーションに自動計装を行うため、自動的に割り当てられるサービス名とURLが期待通りでない場合があります。
