---
title: OBIをセットアップする
linkTitle: セットアップ
description: OBIのセットアップと実行方法を学びます。
weight: 10
default_lang_commit: 22c9dea4ea7ec8287b90c810f6d6d7b0b6a35daa
---

OBIをセットアップして実行するには、さまざまなオプションがあります。

- [KubernetesでOBIをセットアップする](kubernetes/)
<!-- - [Helmを使用してKubernetesでOBIをセットアップする](kubernetes-helm/) -->
- [DockerでOBIをセットアップする](docker/)
- [スタンドアロンプロセスとしてOBIをセットアップする](standalone/)

構成オプションとデータエクスポートモードの詳細については、[OBIの構成](../configure/)ドキュメントを参照してください。

{{% alert title="Note" %}}

OBIを使用してトレースを生成する場合は、[ルートデコレーター](../configure/routes-decorator/)の構成に関するドキュメントセクションを必ずお読みください。
OBIはコードを変更することなくアプリケーションに自動計装を行うため、自動的に割り当てられるサービス名とURLが期待通りでない場合があります。

{{% /alert %}}
