---
title: プラグインとスクリプト
description: >-
  ベンチマークプラグインや body-end スクリプトを含む、サイト独自の JavaScript
  の読み込みとゲート処理の仕組み
aliases: [scripts]
default_lang_commit: 06bcb558c71da67124b77dfd7ddf1de659cb2da7
---

サイトは Docsy のスクリプトに加えて `assets/js/` 配下にいくつか独自のスクリプトを追加しており、3 つの方法で読み込まれます。

- [プラグイン](#plugins)、Docsy のローダー経由
- フックスクリプト、body-end フック（[一覧](#body-end-scripts)）および head-end フック（1 つのスクリプト、Kapa ウィジェットの事前初期化）経由
- ショートコードスクリプト、それを必要とする機能のショートコードによる読み込み（例: レジストリ検索フォーム、config-types アコーディオン）

フックとショートコードは `script.html` パーシャルを通じてスクリプトを読み込みます。
Hugo の `js.Build` が各ファイルをバンドルし、本番ビルドではさらにミニファイ、フィンガープリント付与、サブリソース整合性の追加も行います。

## プラグイン {#plugins}

サイトプラグインは `otel-` 接頭辞のもと、Docsy の [custom-script contract][Docsy plugins] に従います。
独自のマークアップをレンダリングするプラグインは、そのマークアップを所有し、ページにマークを付けるショートコードによってゲートされるため、ゲートはコンテンツとともにそれを配信するすべての言語に引き継がれます。
shim はそのマークを読み取ります。
インクルードされたコンテンツ内のショートコードは、インクルード元のページではなく、インクルードされたページにマークを付けます（[Page flags in included content][]）。

### ベンチマークプラグイン {#benchmarks}

`otel-benchmarks` プラグインは、[github-action-benchmark][] がリポジトリのベンチマーク履歴（GitHub Pages 上の `data.js`）とともに公開するレンダラーのフォークです。
このアクションはデータの形状をその [source types][] で定義し、その [stock renderer][] で読み取ります。
ショートコードの呼び出しではデータの名前とその読み取り方法を指定します。

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " */>}}
```

- `data_url`: アクションの `data.js`。`https://…` の形式か、`param:`_`NAME`_ の形式（それを保持するページパラメーター）で指定します。
  Collector ページでは、そのプローズからも `_param` を通じてリンクしているため、URL を `params.otel-benchmarks.data_url` に保持しています。
- `filter`: `extra` にカンマ区切りの文字列のいずれかを含むベンチマークを保持します。
- `group_separator`: `extra` をグループ（ベンチマーク名と結合されてチャートのタイトルになる）とシリーズ名に分割します。
  セパレーターを含まない `extra` はグループとシリーズの両方になります。
- `series_separator`: `group_separator` で分割されたシリーズ名を、最初の出現位置でトリミングします。

`group_separator` がない場合、各ベンチマーク名は 1 つのシリーズを持つ独立したチャートとなり、コミット内でベンチマーク名が一意であることを前提とします。
すべてのチャートはデータセットのコミット軸を共有します。
JavaScript と Python のページがまだインラインで保持している stock レンダラーは、各ベンチマークにそのベンチマーク自体のコミットのみを付与します。
プラグインの構成要素は以下のとおりです。

- **ショートコード**、`layouts/_shortcodes/benchmarks.html`: チャートコンテナを出力します。
  これは `data-otel-benchmarks` 属性に呼び出しのオプションを JSON としてレンダラー向けに保持する `div` であり、データ URL を `otelBenchmarks` としてページの [store][] に記録します。
  不正な `data_url`、未知の引数や位置引数、または別のデータを指定する 2 回目の呼び出しはビルドを失敗させます。
  リンクやテキストはページのプローズに属し、各言語が独自に記述します。
  各呼び出しはその場所にチャートセットをレンダリングします。
- **Markdown バリアント**、同じ場所にある `benchmarks.md`: 設計上空です。
  これにより、HTML テンプレートのマークアップがページの [Markdown output][] に含まれなくなります。
  サイトは [Agent support](../../design/agent-support/) に基づいてこれを配信します。
  プローズがリンクするデータファイルは、エージェントが数値にアクセスするためのパスです。
- **Shim**、`layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`（[Adjust a plugin per page][]）: レコードを持たないページでプラグインを無効にし、リモートデータスクリプトをそれ以外のすべてのページから排除します（[Security][]）。
- **コンパニオン**、`layouts/_partials/scripts/plugins/otel-benchmarks.html`（[Plugin files][]）: エントリの [`version`][Dependency versions] ピンで Chart.js をベンダリングし、レコードからデータファイルを読み込みます。
  データはライブのリモートスクリプトのまま残されるため、チャートはサイトビルド間でも更新されます。
  固定の整合性ハッシュではこれが禁止されます。
- **スクリプト**、`assets/js/plugins/otel-benchmarks/`（[Plugin files][]）: `index.js` がレンダラーです。
  その横に `legend.js`（凡例の形状とそれに合うチャートの高さ）、`commit.js`（ツールチップとポップオーバーに表示されるポイントの値行とコミット）、`point-popover.js`（クリックポップオーバー）があります。
  Docsy は `js/plugins/otel-benchmarks.js` のみを解決するため、そのファイルがフォルダーのエントリをインポートします。
- **スタイルシート**、`assets/scss/plugins/otel-benchmarks.scss`（[Plugin files][]）: チャートのレイアウトで、コンテナにスコープされています（狭いカラム向けのチャートごとの水平スクローラー、レンダラーが各チャートのサイズの基準とする最小幅、間隔）。
  Docsy はプラグインとともにこれを出力します。
  インラインコピーは stock ページの `static/css/benchmarks.css` を保持しており、そのむき出しの `main`、`button`、`footer` セレクターは Docsy のクロームにも到達します。
- **登録**、`config/_default/hugo.yaml`（[Configuration reference][]）: shim がページごとに判断するため、サイトレベルのエントリが 1 つです。
- **テスト**、`tests/public/otel-benchmarks.test.mjs`: 変換済み、未変換、フォールバック言語にわたるビルド済みページと、変換済みページの Markdown 出力。

#### ローカライズ済みページの変換 {#convert-a-localized-page}

まだスクリプトをインラインで保持しているローカライズ済みコピーを変換するには、以下の手順に従います。

1. プローズの上にあるスタイルシートリンクを削除し、その下のブロック（`markdownlint` コメントから最後の `<script>` タグまで）を英語ページのショートコード行に置き換えます。
2. 英語ページの `otel-benchmarks` パラメーターをコピーし、そのヒントを翻訳し、英語ページと同様にプローズからデータをリンクします。
3. `tests/public/otel-benchmarks.test.mjs` の `CONVERTED` にその言語を追加します。

独自のコピーを持たない言語は英語ページを配信し、英語ページとともに変換されます。

## Body-end スクリプト {#body-end-scripts}

| スクリプト                     | ページ                                                     | 目的                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blog-sidebar-entry-opener.js` | ブログインデックスとページャーページ（最初のページに作用） | サイドバーの最新 2 つの年グループを開く                                                                                                                  |
| `imageZoom.js`                 | すべて                                                     | コンテンツ画像のクリック拡大                                                                                                                             |
| `navScroll.js`                 | すべて                                                     | サイドバーのアクティブエントリをビューにスクロールすることを意図していますが、アクティブ状態がこのスクリプトの実行後に適用されるため、現在は動作しません |
| `tracing.js`                   | Netlify ビルド、一時停止解除時                             | [Website telemetry](../../features/#website-telemetry)、一時停止中                                                                                       |

### ブログサイドバーエントリオープナー {#blog-sidebar-entry-opener}

`blog-sidebar-entry-opener.js` は、ページにゲートされた唯一の body-end スクリプトであり、サイドバーに作用する唯一のスクリプトです。

#### ブログインデックスへのゲート {#gating-to-the-blog-index}

body-end フックはすべてのページでレンダリングされるため、オープナーはページの `.Path` でゲートされます。
`.Path` はすべてのロケールで同一です: `{{ if eq .Path "/blog" }}`。

`.Path` ゲートでは、ページネーションされたリストの最初のページだけを特定できません。
Hugo はリストのページャーページを 1 つのセクションページからレンダリングするため、`.Path`、`.RelPermalink`、`.Pages` は `/blog/` と `/blog/page/2/` で同一であり、現在のスライスはページャー（`.Paginator`、または `.Paginate` が返したもの）だけが認識できます。
Docsy のテンプレートがページネーションしないままにしているリストページ（空のブログなど）で `.Paginator` を呼び出すと、そのページがページネーションされ、`page/1/` エイリアスが公開されます。
そのため、オープナーはすべてのページャーページで読み込まれ、実行時に `location.pathname` で `/page/` を検査してスキップします。

#### サイドバーへの作用 {#acting-on-the-sidebar}

サイトは Docsy のキャッシュ済みサイドバー（`ui.sidebar_cache_limit: 1`）を使用します。
これはサイドバールートごとに 1 つのナビゲーションで、アクティブ状態なしの非表示（`d-none`）で配信されます。
Docsy の `chrome-nav.js` は `DOMContentLoaded` 時にこれをハイドレートします。
アクティブ状態を適用してナビゲーションを表示します。
ブログインデックスは、すべてのセクションのランディングページと同様に、両方の[ビルド種類](../../build/#build-kinds)でそのナビゲーションをインラインで保持するため、body-end スクリプトはパース中、表示前に実行され、サイドバーが表示される前にサイドバーの状態を設定できます。
オープナーはそのとき 2 つの年グループをチェックします。
リーンビルドでは、他のページはプレースホルダーを保持し、`chrome-nav.js` がナビゲーションをフェッチ後に埋めますが、body-end スクリプトには遅すぎます。
JavaScript が無効の場合、サイドバーは非表示のままです。

<!-- prettier-ignore-start -->
[Adjust a plugin per page]: https://www.docsy.dev/docs/content/plugins/#adjust-a-plugin-per-page
[Configuration reference]: https://www.docsy.dev/docs/content/plugins/#configuration-reference
[Dependency versions]: https://www.docsy.dev/docs/content/plugins/#dependency-versions
[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[github-action-benchmark]: https://github.com/benchmark-action/github-action-benchmark
[Markdown output]: https://www.docsy.dev/docs/content/agent-support/#markdown-output
[Page flags in included content]: https://www.docsy.dev/docs/content/plugins/#page-flags-in-included-content
[Plugin files]: https://www.docsy.dev/docs/content/plugins/#plugin-files
[Security]: https://www.docsy.dev/docs/content/plugins/#security
[source types]: https://github.com/benchmark-action/github-action-benchmark/blob/master/src/extract.ts
[stock renderer]: https://github.com/benchmark-action/github-action-benchmark/blob/master/src/default_index_html.ts
[store]: https://gohugo.io/methods/page/store/
<!-- prettier-ignore-end -->
