---
title: プラグインとスクリプト
description: >-
  ベンチマークプラグインや body-end スクリプトを含む、サイト独自の JavaScript
  の読み込みとゲート処理の仕組み
aliases: [scripts]
default_lang_commit: 9d1c87cdbe98ce2dde3e417bd2f6d965d0f08ae3
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

`benchmarks` ショートコードは、リポジトリのベンチマーク履歴、つまり [github-action-benchmark][] が GitHub Pages 上に公開する `data.js`（その形状はアクションの [source types][]）をチャートにします。
ショートコードはデータを指定し、3 つのオプション引数でその読み取り方を指示します。
`data_url` のみの場合、各ベンチマークはデータが存在するコミット上に描画される独立したチャートになります（コミット内でベンチマーク名が一意であることが前提）。

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" */>}}
```

`group_separator` を指定すると、各チャートは複数のベンチマークをシリーズとして保持します。
[Collector benchmarks][] ページがデータを読み取る方法がこれです。

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " */>}}
```

`group_separator` がある場合、チャートはデータセットのコミット軸を共有するためシリーズが揃い、凡例とツールチップにシリーズ名が表示されます。
ない場合、各チャートにはどちらも表示されず、タイトルがその 1 つのシリーズの名前になります。

- `data_url`: アクションの `data.js`。`https://…` の形式か、`param:`_`NAME`_ の形式（それを保持するページパラメーター）で指定します。
  ページのプローズが `_param` を通じて同じ URL をリンクできるようにするためです。
- `filter`（オプション）: `extra` にカンマ区切りの文字列のいずれかを含むベンチマークを保持します。
- `group_separator`（オプション）: `extra` をグループ（ベンチマーク名と結合されてチャートのタイトルになる）とシリーズ名に分割します。
  セパレーターを含まない `extra` はグループとシリーズの両方になります。
  - `series_separator`（オプション）: シリーズ名を最初の出現位置でトリミングします。
    `group_separator` がなければシリーズ名は存在せず、この引数は何もしません。

引数の動作はバリデーションを含めてショートコードの doc コメントに記載されています。
リンクやテキストはページのプローズに属し、各言語が独自に記述します。
データリンクは、ショートコードの Markdown 出力が空であるため、エージェントが数値にアクセスするためのパスでもあります。

ショートコードの背後にある `otel-benchmarks` プラグインは、アクションの [stock renderer][] のフォークです。
その構成要素は以下のとおりです。

- **ショートコード**、`layouts/_shortcodes/benchmarks.html`: チャートコンテナを出力し、shim とコンパニオン用にデータ URL を記録します。
  各呼び出しはその場所にチャートセットをレンダリングします。
- **Markdown バリアント**、同じ場所にある `benchmarks.md`: 空であるため、チャートのマークアップはページの [Markdown output][] に含まれません（[Agent support](../../design/agent-support/)）。
- **Shim**、`layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`（[Adjust a plugin per page][]）: ショートコードのないページでプラグインを無効にし、リモートデータスクリプトをそれ以外のすべてのページから排除します（[Security][]）。
- **コンパニオン**、`layouts/_partials/scripts/plugins/otel-benchmarks.html`（[Plugin files][]）: エントリの [`version`][Dependency versions] ピンで Chart.js をベンダリングし、データファイルを読み込みます。
  データはライブのリモートスクリプトのまま残されるため、チャートはサイトビルド間でも更新されます。
  固定の整合性ハッシュではこれが禁止されます。
- **スクリプト**、`assets/js/plugins/otel-benchmarks/`（[Plugin files][]）: レンダラー `index.js` と、凡例、ツールチップとポップオーバーにポイントが表示する内容、およびポップオーバー自体のヘルパーです。
- **スタイルシート**、`assets/scss/plugins/otel-benchmarks.scss`（[Plugin files][]）: チャートのレイアウトで、コンテナにスコープされています。
  インラインコピーは stock ページの `static/css/benchmarks.css` を保持しており、そのむき出しの `main`、`button`、`footer` セレクターは Docsy のクロームにも到達します。
- **登録**、`config/_default/hugo.yaml`（[Configuration reference][]）: shim がページごとに判断するため、サイトレベルのエントリが 1 つです。
- **テスト**、`tests/public/otel-benchmarks.test.mjs`: 各ページのビルド済みコピーの配信を検証します。
  その `PAGES` テーブルはプラグインを使用するページと、まだインラインのローカライズ済みコピーの一覧であり、それらの変換は [#12266][] で追跡されています。

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
[#12266]: https://github.com/open-telemetry/opentelemetry.io/issues/12266
[Adjust a plugin per page]: https://www.docsy.dev/docs/content/plugins/#adjust-a-plugin-per-page
[Collector benchmarks]: /docs/collector/benchmarks/
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
<!-- prettier-ignore-end -->
