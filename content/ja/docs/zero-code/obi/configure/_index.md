---
title: OBI の構成
linkTitle: 構成
description: OBI の構成方法を学びます。
weight: 4
default_lang_commit: 0fee5e1c7ff48dc9fb39c919c9882a9a8d8da4aa
---

OBI は、[エクスポートモード](export-modes/)、グローバルプロパティ、コンポーネントオプションを設定することで構成できます。

OBI がエクスポートするメトリクスの情報については、[エクスポートされるメトリクス](../metrics/)のドキュメントを参照してください。

低カーディナリティのルートデコレーターを構成するには、[ルートデコレーター](routes-decorator/)のドキュメントを参照してください。
最適な結果を得るために非常に重要です。

## 構成バージョン {#configuration-versions}

OBI v0.11.0 以降では Config v2 を使用してください。
Config v2 はスタンドアロン OBI と OBI Collector レシーバーの両方で動作し、共通設定には OpenTelemetry の宣言的構成構造を使用し、OBI 固有の設定は `extensions.obi` 配下に配置します。

- 新しい構成を作成するには、[Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。
- 既存の Config v1 ファイルを変換するには、[Config v1 から v2 への移行ガイド](/docs/zero-code/obi/configure/migrate-to-config-v2/)に従ってください。

特に記載がない限り、このセクションの他のページは Config v1 について説明しています。
各ページから対応する Config v2 のガイダンスへのリンクがあります。
