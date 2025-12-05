---
title: アナウンス
description: 特別なイベントのためのアナウンスやバナーを作成します。
weight: 50
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

アナウンスは、ロケールの `announcements` セクション内に含まれる _通常の Hugo ページ_ です。
これにより、Hugo の組み込み機能を活用して、ページの日付 (未来または期限切れ) の処理、国際化の管理などを行い、ビルドの日付によってバナーの表示や非表示を自動で切り替えたり、バナーの並び順を決定したり、英語バナーへのフォールバックを処理したりできます。

> 現在、アナウンスはバナーとしてのみ使用されています。
> 将来的には、もう少し一般的なアナウンス機能をサポートする _可能性が_ あります。

## アナウンスを作成する {#creating-an-announcement}

新しいアナウンスを追加するには、以下のコマンドを使用して、ローカリゼーションフォルダー内の `announcements` フォルダーに Markdown ファイルを作成します。

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

希望するロケールとファイル名に応じて調整してください。
アナウンスの本文をページの内容として追加します。

> バナーの場合、アナウンスの本文は短いフレーズにしてください。

{{% alert title="ローカリゼーションについて" %}}

**ローカル固有のアナウンスを上書きする場合** は、英語版のアナウンスと **同じファイル名** を使用してください。

{{% /alert %}}

## アナウンス一覧 {#announcement-list}

各アナウンスは、ビルドの日付が `date` フィールドと `expiryDate` フィールドの間にある場合にサイトのビルドに含まれます。
これらのフィールドが省略された場合、それぞれ「現在」と「無期限」と見なされます。

アナウンスは、Hugo の [Regular pages](https://gohugo.io/methods/site/regularpages/) 機能を使用して決定される標準のページ順序で表示されます。
つまり、`weight` が最も低いアナウンスが最初に表示されます。
`weight` が同じまたは指定されていない場合は、`date` が最新のアナウンスが最初に表示されます。

したがって、アナウンスを最上位に固定したい場合は、
フロントマターで `weight` に負の値を設定してください。

このリポジトリの内容にバグや問題を発見した場合、または改善をリクエストしたい場合は、[ドキュメントのイシューを作成][new-issue] してください。

セキュリティ上の問題を発見した場合は、イシューを作成する前に[セキュリティポリシー](https://github.com/open-telemetry/opentelemetry.io/security/policy) を確認してください。

新しいイシューを報告する前に、[イシューのリスト](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)を検索することで、既に報告されているか修正されていないかを確認してください。

新しいイシューを作成する際は、簡潔で意味のあるタイトルと明確な説明を記載してください。
可能な限り関連情報を提供し、可能であればテストケースも含めてください。

[new-issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
