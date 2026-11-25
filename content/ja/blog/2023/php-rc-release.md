---
title: OpenTelemetry PHP リリース候補
linkTitle: PHP リリース候補
date: 2023-09-13
author:
  '[Brett McBride](https://github.com/brettmc/) (Deakin University), [Przemek
  Delewski](https://github.com/pdelewski/) (SumoLogic), and [Bob
  Strecansky](https://github.com/bobstrecansky/) (Mailchimp)'
default_lang_commit: 1bd13789862174c89d11afd31d3f655de3cd16c9
cSpell:ignore: Delewski Mailchimp McBride PECL Przemek Strecansky
---

OpenTelemetry PHP チームは、[opentelemetry-php](https://github.com/open-telemetry/opentelemetry-php/) ライブラリがリリース候補として公開できる水準の安定性に達したことをお知らせします。
このリリースは、OpenTelemetry PHP チームによる数年にわたる取り組みの集大成です。
このリリースを実現してくださったすべてのコントリビューター、テスター、インテグレーターの皆さんに感謝します。
コミュニティ全体の助けがなければ、このリリースは実現できなかったことでしょう。

これは、コミュニティからのさらなるフィードバックを得るために公開する最初のリリース候補です。
このリリースでは、PHP アプリケーション向けのトレース、メトリクス、ログのサポートに加え、[PECL エクステンション](https://pecl.php.net/package/opentelemetry)による自動計装を提供します。
バグレポートを受け付けながらライブラリの改善を続け、一般公開リリースに向けて前進していきます。

## 次のステップ {#what-happens-next}

本番に近いワークロードでコードをテストしていただければ幸いです。
コミュニティからの前向きなフィードバックにより大規模環境での信頼性が確認できましたら、1.0.0 リリースとして一般公開に移行します。

また、コミュニティからのフィードバックに基づき、[contrib パッケージ](https://github.com/open-telemetry/opentelemetry-php-contrib/)を RC、そして GA へと昇格させることも検討しています。

## どのように貢献できますか？ {#how-can-you-help}

OpenTelemetry PHP を初めて使う方は、[入門ドキュメント](/docs/languages/php/getting-started/)から始めるのが最適です。

PHP コードベースでこの計装をテストしてくださる開発者を募集しています。
報告いただいた問題はチームでトリアージしますので、リポジトリの [GitHub Issues](https://github.com/open-telemetry/opentelemetry-php/issues/) でお気軽にイシューを作成してください。
プルリクエストも、以下のどのリポジトリでもいつでも歓迎しています。

- [API/SDK](https://github.com/open-telemetry/opentelemetry-php/)
- [Contrib](https://github.com/open-telemetry/opentelemetry-php-contrib/)
- [Instrumentation](https://github.com/open-telemetry/opentelemetry-php-instrumentation/)
