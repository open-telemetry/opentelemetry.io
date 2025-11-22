---
title: ブログ
description: ブログ投稿する方法を学びます。
weight: 30
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
---

[OpenTelemetry ブログ](/blog/)は OpenTelemetry に関連する可能性のある、新機能、コミュニティレポートそしてニュースを発信します。
これは、エンドユーザーと開発者を含みます。
誰でもブログを書くことができます。
要件について下記を読んでください。

## ドキュメントテーションまたはブログ投稿？ {#documentation-or-blog-post}

ブログ記事を書くには、ドキュメントに書いた方が良いのではないかと自問自答してください。
もし答えが「はい」であれば、そのコンテンツをドキュメントに追加するために、新しいイシューまたはプルリクエスト（PR）を作成してください。

OpenTelemetry ウェブサイトのメンテナーと承認者はプロジェクトのドキュメントの改善に焦点を当てているため、ブログ記事はレビューの優先度が低くなることに注意してください。

## ソーシャルメディアコンテンツのリクエスト {#social-media-content-request}

ブログ記事以外のコンテンツをOpenTelemetryプロジェクトのソーシャルメディアチャンネルで公開するようにリクエストしたい場合、[このフォームを使用してください](https://github.com/open-telemetry/community/issues/new?template=social-media-request.yml)。

## ブログ記事を提出する前に {#before-submitting-a-blog-post}

ブログ記事は商業的な内容であってはならず、OpenTelemetry コミュニティに全体に適用される独自の内容で作成する必要があります。
ブログ記事は [Social Media Guide](https://github.com/open-telemetry/community/blob/main/social-media-guide.md) に記載されている方針に従ってください。

投稿しようとしている内容が、OpenTelemetry コミュニティ全体に適用されることを確認してください。
適切な内容には、以下が含まれます。

- 新しい OpenTelemetry の機能
- OpenTelemetry プロジェクトの更新情報
- Special Interest Group（SIG）の最新情報
- チュートリアルやウォークスルー
- OpenTelemetry の統合
- [コントリビューター募集](#call-for-contributors)

不適切な内容には、以下が含まれます。

- ベンダー製品の宣伝

もし、ブログ投稿がこの適切な内容のリストに沿っているのであれば、次の詳細と一緒に[イシューを起票]してください。

- ブログ投稿のタイトル
- 簡潔な説明とブログ投稿の概要
- 該当する場合、ブログ記事で使用する技術のリスト。すべてオープンソースであることを確認し、CNCF プロジェクトでないものより CNCF プロジェクトが好まれます（例：トレースの可視化には Jaeger、メトリクスの可視化には Prometheus を使用）
- ブログ記事に関連する [SIG](https://github.com/open-telemetry/community/) の名前
- PR のレビューを手伝う、SIG のスポンサー（メンテナーまたは承認者）の名前。理想的にはスポンサーは異なる企業であることが望ましい

SIG Communication のメンテナーがブログ記事が受け入れられるのに必要な要件を満たしていることを確認します。
最初のイシューの詳細に、SIG やスポンサーの名前を書けない場合は、スポンサーを求めるために連絡できる適切な SIG を紹介します。
スポンサーを持つことは任意ですが、スポンサーを持つことでブログポストをより早くレビューや承認を得る可能性が高まります。

もしイシューが必要としているものをすべて揃っている場合は、メンテナーが確認し次の手順に進めてブログ記事を投稿できることを通知します。

### コントリビューター募集 {#call-for-contributors}

新しいプロジェクトやSIGの作成を提案する場合、またはOpenTelemetryプロジェクトへの寄付を申し出る場合には、その提案を成功させるために追加のコントリビューターが必要になります。
それを支援するために、「コントリビューター募集」（CfC）のブログ記事を提案できます。

これには、[新しいプロジェクト](https://github.com/open-telemetry/community/blob/main/project-management.md)と[寄付](https://github.com/open-telemetry/community/blob/main/guides/contributor/donations.md)のプロセスに従う必要があります。

## ブログ記事を提出する {#submit-a-blog-post}

リポジトリをフォークしてローカルで書くか、GitHub UI を利用することでブログ記事を投稿できます。
両方の場合において、[ブログ投稿テンプレート](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)で提供されている指示に従うように依頼します。

### フォークしてローカルで書く {#fork-and-write-locally}

ローカルのフォークをセットアップした後に、テンプレートを利用してブログポストを作成できます。
テンプレートから記事を作成するために、次の手順に従ってください。

1. リポジトリルートから以下のコマンドを実行してください

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post.md
   ```

   投稿に画像やその他のアセットが含まれている場合、次のコマンドを実行してください。

   ```sh
   npx hugo new content/en/blog/2024/short-name-for-post/index.md
   ```

1. 前のコマンドで提供したパスのマークダウンファイルを編集してください。このファイルは、[archetypes](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/)配下のブログ記事スターターから初期化されます。

1. 作成したフォルダの中に、画像や他のファイルのアセットを配置してください

1. 記事の準備ができたら、プルリクエストを通して提出してください

### GitHub UI を使用する {#use-the-github-ui}

ローカルのフォークを作成することを好まないのであれば、新しい記事を作成するのに GitHub UI を利用できます。
UI を利用して記事を追加するのに次のステップに従ってください。

1. [ブログ記事のテンプレート](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)に行って、メニューの右上にある **Copy raw content** をクリックしてください

1. [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main)を選択してください

1. 最初のステップでコピーしたテンプレートを貼り付けます

1. ファイルに名前をつけてください。たとえば、`content/en/blog/2022/short-name-for-your-blog-post/index.md` です

1. GitHub で Markdown を編集してください

1. 記事の準備ができたら、**Propose changes** を選択して指示に従ってください

## 公開スケジュール {#publication-timelines}

OpenTelemetryのブログは厳密な公開スケジュールに従いません。
これは、次のことを意味します。

- ブログ記事はすべての必要とする承認が揃ったときに公開されます
- 公開は必要に応じて延期されますが、メンテナーは特定の日付に公開されることを保証できません
- 一部のブログ記事（重要な発表など）は優先され、あなたの記事よりも先に公開されることがあります

## ブログコンテンツのクロスポスト {#cross-posting-blog-content}

OpenTelemetryのブログ記事を他のプラットフォームで共有したい場合は、自由に行ってください。
以下の点に留意してください。

- どのバージョンを正規の投稿とするかを決めてください（通常はOpenTelemetryブログの元の投稿）。
- 他のバージョンの投稿では以下を行う必要があります。
  - 元の投稿がOpenTelemetryブログに掲載されたことを明確に言及する。
  - ページの上部または下部に元の記事へのリンクを含める。
  - プラットフォームがサポートしている場合は、OpenTelemetryブログ記事を指す正規URLタグを設定する。

これにより、適切な帰属が確保され、SEOのベストプラクティスをサポートし、コンテンツの重複を回避できます。
