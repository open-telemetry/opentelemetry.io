---
title: ブログ
description: ブログ投稿する方法を学びます。
weight: 30
default_lang_commit: edfda068e00cd45e50a77967e193baad2beeccb5
---

[OpenTelemetry ブログ](/blog/)は、リリース、マイルストーン、Special Interest Group（SIG）ニュースなどのプロジェクトおよび組織に関するお知らせを、エンドユーザーと開発者を含む OpenTelemetry コミュニティに発信します。
ブログ記事は [OpenTelemetry GitHub organization のメンバー][membership]が提出する必要があります。
要件の詳細については下記を読んでください。

[membership]: https://github.com/open-telemetry/community/blob/main/community-membership.md

## ドキュメンテーションまたはブログ投稿？ {#documentation-or-blog-post}

ブログ記事を書くには、ドキュメントに書いた方が良いのではないかと自問自答してください。
もし答えが「はい」であれば、そのコンテンツをドキュメントに追加するために、新しいイシューまたはプルリクエスト（PR）を作成してください。

OpenTelemetry ウェブサイトのメンテナーと承認者はプロジェクトのドキュメントの改善に焦点を当てているため、ブログ記事はレビューの優先度が低くなることに注意してください。

## ソーシャルメディアコンテンツのリクエスト {#social-media-content-request}

ブログではなく OpenTelemetry のソーシャルメディアチャンネルでの公開をリクエストするには、[ソーシャルメディアリクエストを提出][submit a social media request]してください。

[submit a social media request]: https://github.com/open-telemetry/community/issues/new?template=social-media-request.yml

## ブログ記事の告知 {#announcing}

ブログ記事が公開されると、メンテナーが OpenTelemetry のソーシャルメディアチャンネルやメーリングリストで告知できるように、[opentelemetry-announcements][] にプルリクエストが自動的に作成されます。
告知は「New on the OpenTelemetry blog: _title_」という形式で、短いテキストと記事へのリンクが含まれます。

デフォルトでは、短いテキストは記事のタイトルになります。
よりよいテキストを書くには、フロントマターに `announcement` キーを追加してください。

```yaml
announcement:
  Cardinality limits keep your metrics pipeline healthy. Learn how to set them
  up.
```

Bluesky の文字数制限が300文字でリンクがおよそ34文字を消費するため、約260文字以内に収めてください。
告知をスキップするには `announcement: false` を使用してください。
テキストは告知のプルリクエストがマージされる前であれば編集できます。

[opentelemetry-announcements]: https://github.com/open-telemetry/opentelemetry-announcements

## ブログ記事を提出する前に {#before-submitting-a-blog-post}

ブログ記事は商業的な内容であってはならず、OpenTelemetry コミュニティに全体に適用される独自の内容で作成する必要があります。
ブログ記事は [Social Media Guide][] に記載されている方針に従ってください。

[Social Media Guide]: https://github.com/open-telemetry/community/blob/main/social-media-guide.md

### GitHub リポジトリへのリンク {#linking-to-github-repositories}

ブログ記事は、不安定な GitHub `blob`/`tree` リンクを防止するために [markdownlint によってチェック][checked by markdownlint]されます（`gh-url-hash`）。

チェックにより問題が報告された場合、次のように修正してください。

- デフォルトブランチのリファレンス（例：`main`/`master`）をタグ/リリース ID またはコミットハッシュに置き換える
- 40文字の完全なコミットハッシュを使用する（短いハッシュは警告されます）
- `npm run fix:markdown` を実行して、修正できるものを自動的に修正し、残りのリンクを手動で修正する

### 投稿できる人 {#who-can-submit}

投稿する著者は [OpenTelemetry GitHub organization のメンバー][membership]で**なければなりません**。
共著者はメンバーである必要はありません。

### 公開される内容 {#what-we-publish}

ブログでは、以下のようなプロジェクトおよび組織に関するお知らせの投稿を強く推奨します。

- リリースおよびその他のプロジェクトのマイルストーン
- 新しい OpenTelemetry の機能
- SIG の設立、進捗、その他の最新情報
- [コントリビューター募集](#call-for-contributors)

チュートリアル、ウォークスルー、ハウツーコンテンツは通常、ユーザーや利用ツールが最も見つけやすい[ドキュメント](#documentation-or-blog-post)に掲載するのが適切です。
OpenTelemetry コミュニティに広く該当するその他の投稿も受け入れられる場合がありますが、優先度は低くなります。

不適切な内容には、以下が含まれます。

- ベンダー製品の宣伝

これらの要件を満たす場合、**必ず**最初に次の詳細と一緒に[イシューを起票](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=BLOG_POST.yml)してください。

- ブログ投稿のタイトル
- 簡潔な説明とブログ投稿の概要
- 該当する場合、ブログ記事で使用する技術のリスト。すべてオープンソースであることを確認し、CNCF プロジェクトでないものより CNCF プロジェクトが好まれます（例：トレースの可視化には Jaeger、メトリクスの可視化には Prometheus を使用）
- ブログ記事のスポンサーを引き受けてくれる [SIG](https://github.com/open-telemetry/community/) の名前。
  **SIG スポンサーは必須です。**
- Comms SIG が記事をレビューする前に、最初のレビューを担当する、SIG のスポンサー（メンテナーまたは承認者）の名前。
  スポンサーは記事の執筆者とは異なる企業であることが**必須です**。

**プルリクエストを提出する前にイシューを起票することは必須です。**
受理されたイシューなしに提出されたブログ記事のプルリクエストは、レビューなしにクローズされることがあります。

SIG Communication のメンテナーがブログ記事が受け入れられるのに必要な要件を満たしていることを確認します。
SIG スポンサーは、Comms SIG が記事を確認する前にレビューを完了しなければなりません。
記事の執筆者は、ブログポストのスポンサーを見つける責任があります。

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
   npm exec --no -- hugo new content/en/blog/$(date +%Y)/short-name-for-post.md
   ```

   投稿に画像やその他のアセットが含まれている場合、次のコマンドを実行してください。

   ```sh
   npm exec --no -- hugo new content/en/blog/$(date +%Y)/short-name-for-post/index.md
   ```

2. 前のコマンドで提供したパスのマークダウンファイルを編集してください。このファイルは、[archetypes](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/)配下のブログ記事スターターから初期化されます。

3. 作成したフォルダの中に、画像や他のファイルのアセットを配置してください

4. 記事の準備ができたら、プルリクエストを通して提出してください

### GitHub UI を使用する {#use-the-github-ui}

ローカルのフォークを作成することを好まないのであれば、新しい記事を作成するのに GitHub UI を利用できます。
UI を利用して記事を追加するのに次のステップに従ってください。

1. [ブログ記事のテンプレート](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)に行って、メニューの右上にある **Copy raw content** をクリックしてください

1. [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main)を選択してください

1. 最初のステップでコピーしたテンプレートを貼り付けます

1. ファイルに名前をつけてください。たとえば、`content/en/blog/YYYY/short-name-for-your-blog-post/index.md` (YYYY は現在の年) です

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

## 古いブログは更新されません {#old-blogs-are-not-updated}

ブログ記事は歴史的なものとみなされ、1年程度経過すると更新されません（サイトのビルドを維持するために必要な変更を除く）。
古いブログ記事には、コンテンツが古くなっている可能性があり一部のリンクが無効になっている可能性があることを読者に警告するバナーが上部に表示されます。

また、古い記事は [lint もリンクチェックも行われない][pr-checks]ことに注意してください。

[pr-checks]: ../pr-checks/#checks
[checked by markdownlint]: ../pr-checks/#markdown-linter
