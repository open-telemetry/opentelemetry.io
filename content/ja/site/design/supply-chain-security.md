---
title: サプライチェーンセキュリティ
description: >-
  サイトの npm 依存関係制御の背景にある脅威モデルと根拠
weight: 20
default_lang_commit: ec40cad3a7ca79640aa6a6f97264fbbe0d00aa87
drifted_from_default: true
---

制御の詳細と日常の手順については、[Dependency management](../../build/dependencies/) を参照してください。
関連するセキュリティトピックにはそれぞれ専用のページがあります。
これらの制御を検証する監査の設計については [Supply-chain audit design](/site/design/supply-chain-audit/) を、ワークフローのトリガーとトークン権限については [CI workflows](../../build/ci-workflows/#security-model) を、脆弱性の報告については [security policy][] を参照してください。

## 脅威モデル {#threat-model}

2026年8月の npm ワーム（[security notice][]）が現在のセキュリティ態勢を定めました。
侵害されたメンテナーアカウントから、人気のある npm パッケージの悪意あるバージョンが公開されました。
パッケージのインストール時の [lifecycle scripts][] がペイロードを実行し、窃取した認証情報を使って伝搬しました。
このリポジトリのいくつかの PR ブランチが封じ込め前に影響を受けましたが、`main` や本番環境には到達しませんでした。

このリポジトリに関連する攻撃経路は以下のとおりです。

- **バージョン解決**: バージョン範囲を解決するインストールは、新しく公開された悪意あるリリースを取得する可能性があります。
- **ライフサイクルスクリプト**: インストール時のスクリプト実行により、悪意あるパッケージがコントリビューターのホスト、CI ランナー、ビルドイメージを侵害できます。
- **無人インストール**: CI ジョブや [Netlify][] のビルドイメージは人間の監視なしにインストールを実行します。
  エージェントセッションも同様です。
- **名前解決**: レジストリに名前で到達できるツール呼び出し（`npx`）は、ローカルのインストールが古いか存在しない場合、その名前を保持しているパッケージを実行します。

## 設計上の決定 {#design-decisions}

共通するテーマは**フェイルクローズ**です。
[制御][control]を強制できない場合、制御なしで続行するのではなく、インストールが失敗します。

各決定は**攻撃経路**に対応しており、おおむね作用するタイミング順に並べています。
末尾の表で決定とその適用方法を対応付けています。

- _直接的・推移的を問わず、すべての依存関係は攻撃者が到達できる攻撃対象領域である。_
  - **依存関係を最小化する**: <a id="minimize"></a> 未使用の依存関係や利便性のためだけの依存関係は、維持するのではなく削除します。
- _バージョン範囲を解決するインストールは、新しく公開された悪意あるリリースを取得する可能性がある。_
  - **ロックファイルからインストールする**: <a id="lock"></a> インストールは[ロック完全一致][install contracts]で行われ、コミット済みでレビュー済みの [`package-lock.json`][] を再現します。
    唯一の例外として、ローカルの `npm install` は不一致のロックファイルを書き換えることがあります。
    [検証](#verify)がそのような書き換えを検出します。
  - **意図的に解決する**: <a id="deliberate"></a> バージョン解決は[意図的な依存関係更新][deliberate dependency updates]でのみ行われ、インストールの副作用としては行われません。
  - **クールダウン済みのリリースのみを解決する**: <a id="cooldown-releases"></a> 意図的な解決であっても、[クールダウン期間][cooldown]より新しいリリースは無視します。
    悪意あるリリースのレジストリ側での削除には数日かかります。
- _パッケージのインストール時スクリプトは、コントリビューターのホストやビルドマシン上で攻撃者のコードを実行する。これがワームのペイロード経路だった。_
  - **レビュー済みのライフサイクルスクリプトのみを実行する**: <a id="scripts"></a> [lifecycle scripts][] は[デフォルト拒否][allowlist]です。
    - 承認はバージョン完全一致であるため、侵害されたパッチリリースが前のバージョンの承認を引き継ぐことはできません。
    - レビューは拒否も記録するため、記録がないことは常に未レビューを意味します。
    - 例外は使用箇所でインラインで名前付きで再有効化されます。
      デフォルトの態勢を弱めることはありません。
- _再有効化された唯一のフックはピン留めされた Hugo バイナリを取得する。インストーラーは、そのフェッチをリポイントまたはアンピンできる環境オーバーライドを尊重する。_
  - **Hugo インストーラーのオーバーライドを拒否する**: <a id="hugo-env"></a> [リビルドラッパー][install contracts]は、それらのいずれかが設定されている間は実行を拒否します。
- _Netlify の[独自の npm install][netlify-deps] は無人で実行され、このリポジトリが制御するスクリプトの範囲外であり、無効化できない。_
  - **自動インストールを無効化する**: <a id="auto-install"></a> 設定により[自動インストールを無効化][inert auto-install]し、ビルドコマンドが[実際のインストール][install contracts]を実行します。
- _レジストリで解決可能な名前で呼び出された bin は、ローカルのインストールが古い場合にその名前を主張する者を実行する。6月に未登録の bin 名のスクワットがこれを証明した。_
  - **bin を呼び出し、名前は呼び出さない**: <a id="no-bare-npx"></a> リポジトリの配線は[素の `npx` を使用しない][no bare npx]。
    bin はインストール済みの依存関係ツリーから取得されるか、明示的に失敗します。
- _制御が暗黙のうちに適用されなくなることは、制御がないことよりも悪い。_
  - **古い npm ではフェイルクローズする**: <a id="old-npm"></a> アクティブな npm が `.npmrc` の設定を適用するには古すぎる場合、続行するのではなくインストールが失敗します。
  - **信頼せず検証する**: <a id="verify"></a> 無効化とロック完全一致は、前提ではなく検証済みの主張です。

適用方法の一覧:

| 決定                                    | 適用方法                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Minimize dependencies][]               | 依存関係レビュー時のメンテナーの判断。機械的な制御はなし                                                                                             |
| [Install from the lock][]               | すべての[インストール契約][install contracts]での `npm ci`                                                                                           |
| [Resolve deliberately][]                | 慣例に基づく。ロックファイルが裏付け: 予期しない解決はロックファイルを書き換え、検証がそれを検出する                                                 |
| [Resolve only cooled-down releases][]   | npm と Renovate の両方に対する[クールダウン][cooldown]制御                                                                                           |
| [Run only reviewed lifecycle scripts][] | 厳格モードの[許可リスト][allowlist]。未レビューの場合はインストールが失敗する                                                                        |
| [Refuse Hugo installer overrides][]     | [リビルドラッパー][install contracts]の環境スクリーン。リビルド試行前に実行                                                                          |
| [Neutralize the auto-install][]         | [自動インストール無効化][inert auto-install]制御                                                                                                     |
| [Invoke bins, not names][]              | [素の npx 禁止][no bare npx]ルール。レビュー規律による制御であり、機械的な制御はなし                                                                 |
| [Fail closed on old npm][]              | 厳格なエンジンチェック付きの [npm エンジンフロア][npm engines floor]                                                                                 |
| [Verify, don't trust][]                 | [サプライチェーン監査][Supply-chain audit]、[クリーンワーキングツリーチェック][install contracts]、ローカルでのロック書き換え時の `postinstall` 警告 |

## 先行事例 {#prior-art}

- デフォルト拒否のライフサイクルスクリプトはエコシステムの方向性です。
  - [pnpm][] と [Yarn][] はデフォルトで依存関係のスクリプトをブロックします。
  - npm の承認済み [RFC #54][] は `allowScripts` を通じて同じモデルを npm にもたらします。
    バージョン完全一致のエントリも含まれています。
- リリースクールダウンは確立されたプラクティスです。
  - [pnpm はデフォルトで][pnpm defers]1日より新しいリリースを遅延させます。
  - Renovate の npm [`minimumReleaseAge`][renovate] セキュリティプリセットは3日間を設定しており、npm の72時間アンパブリッシュウィンドウに対応しています。
    ここで使用しているより長い値は、エコシステムの他の箇所で採用されているクールダウンに沿ったものです。
- この制御セットは確立されたフレームワークのガイダンスに対応しています。
  - [TUF の攻撃分類][tuf]: 任意のソフトウェアインストール、ミックスアンドマッチ、および余分な依存関係攻撃。
  - [OpenSSF npm ガイド][openssf]: ロック完全一致の CI インストール。

<!-- prettier-ignore-start -->
[`package-lock.json`]: https://docs.npmjs.com/cli/configuring-npm/package-lock-json
[allowlist]: ../../build/dependencies/#lifecycle-script-allowlist
[control]: ../../build/dependencies/#controls
[cooldown]: ../../build/dependencies/#release-cooldown
[deliberate dependency updates]: ../../build/dependencies/#updating
[Fail closed on old npm]: #old-npm
[inert auto-install]: ../../build/dependencies/#inert-netlify-auto-install
[install contracts]: ../../build/dependencies/#install-contracts
[Install from the lock]: #lock
[Invoke bins, not names]: #no-bare-npx
[lifecycle scripts]: https://docs.npmjs.com/cli/using-npm/scripts
[Minimize dependencies]: #minimize
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[Netlify]: https://www.netlify.com/
[Neutralize the auto-install]: #auto-install
[no bare npx]: ../../build/dependencies/#no-bare-npx
[npm engines floor]: ../../build/dependencies/#npm-version-floor
[openssf]: https://github.com/ossf/package-manager-best-practices/blob/main/published/npm.md
[pnpm defers]: https://pnpm.io/settings/dependency-resolution
[pnpm]: https://pnpm.io/settings/build
[Refuse Hugo installer overrides]: #hugo-env
[renovate]: https://docs.renovatebot.com/presets-security/#securityminimumreleaseagenpm
[Resolve deliberately]: #deliberate
[Resolve only cooled-down releases]: #cooldown-releases
[RFC #54]: https://github.com/npm/rfcs/blob/main/accepted/0054-make-scripts-install-opt-in.md
[Run only reviewed lifecycle scripts]: #scripts
[security notice]: https://github.com/open-telemetry/opentelemetry.io/issues/11210
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[Supply-chain audit]: ../../build/dependencies/#audit
[tuf]: https://theupdateframework.io/docs/security/
[Verify, don't trust]: #verify
[Yarn]: https://yarnpkg.com/advanced/lifecycle-scripts
<!-- prettier-ignore-end -->
