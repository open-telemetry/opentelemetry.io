---
title: Alibaba、Datadog、Quesma が Go コンパイル時計装で協力
linkTitle: Go コンパイル時計装
date: 2025-01-24
author: OpenTelemetry Governance Committee
issue: https://github.com/open-telemetry/community/issues/2509
sig: Governance Committee
default_lang_commit: 75b79dc8db403454660ee5b35d99324125030636
cSpell:ignore: instrgen quesma
---

標準は広く採用されてこそ意味があり、採用は利用可能なツールがそれを促進して初めて効果を発揮します。
[SI 単位](https://en.wikipedia.org/wiki/International_System_of_Units)が導入されたとき、キログラムで重さを量るために自分で秤を作らなければならなかったとしたら、あまり普及しなかったのではないでしょうか！

[Go で OpenTelemetry](/docs/languages/go/) を使っている方なら、よく知られたオープンソースコンポーネントからテレメトリーを自動生成するために計装ライブラリを設定する際の課題をご存知でしょう。
言語のコンパイル特性のため、現在は2つの選択肢があります[^1]。

- Go プロセスを分析し、アプリケーション内のフックに eBPF プログラムをアタッチする別のバイナリを使用する方法 &mdash;
  [opentelemetry-go-instrumentation](https://github.com/open-telemetry/opentelemetry-go-instrumentation/) を参照してください。
- コード内で手動で計装ライブラリを設定する方法。
  たとえば [HTTP サーバーの計装](/docs/languages/go/getting-started/#instrument-the-http-server)を参照してください。

さまざまな理由から、これらの選択肢がどちらも実行可能でない場合や、環境にとって最適でない場合があります。
しかし、状況は変わろうとしています！

## オープン標準の核心にある業界のコラボレーション {#industry-collaboration-at-the-heart-of-open-standards}

ここ数か月のあいだに、OpenTelemetry は業界のリーダーから1つではなく2つの寄贈提案を受け取りました。
これらは上記の問題を解決し、Go アプリケーションでゼロコード、ベンダー中立のコンパイル時計装を可能にするためのものです。
具体的には以下のとおりです。

- Alibaba の
  [寄贈提案](https://github.com/open-telemetry/community/issues/2344):
  [opentelemetry-go-auto-instrumentation](https://github.com/alibaba/opentelemetry-go-auto-instrumentation)
- Datadog の
  [寄贈提案](https://github.com/open-telemetry/community/issues/2497):
  [Orchestrion](https://github.com/datadog/orchestrion)

Alibaba と Datadog のこれらの寄贈提案に大変感謝しています。
これは、OpenTelemetry が定める標準に向けた、より広い業界の収束を引き続き示すものです。

コンパイル時計装は、標準的な Go ツールチェインの `-toolexec` メカニズムを活用して、Go ソースコードが Go コンパイラに渡される前に書き換え、関連するすべての場所（依存関係や Go 標準ライブラリを含む）に計装を追加します。

この発表で最も興奮する点は、Alibaba のソリューションや Datadog のソリューションのどちらかが「勝つ」わけではないということです。
オープンソースコラボレーションの真の精神に則り、この2つの組織は協力して必要なリソースを投入し、新しい
[Go Compile-Time Instrumentation SIG](https://github.com/open-telemetry/community/blob/c5047e230dcd918218de73a05ffdc52db158dc1a/projects/go-compile-instrumentation.md?from_branch=main)
を立ち上げることを決定しました。
これは、各ソリューションの最良の側面を取り入れ、コミュニティ全体に利益をもたらす、統一されたベンダー中立のアプローチを提供することを目的としています。
さらに、Quesma からの追加コントリビューションによるサポートも受けます。
Quesma は [instrgen](https://github.com/open-telemetry/opentelemetry-go-contrib/blob/dafdad14b7858c7f491c8cb72e4bc7deaf9378e3/instrgen/README.md) の経験を持ち込みます。
これは、`-toolexec` に基づく Go コンパイル時計装を提供するための OpenTelemetry の初期の実験的アプローチであり、この SIG の最初の取り組みの一環として置き換えられる予定です。

長期的には、この SIG は以下に注力します。

- 計装コードを自動的に注入するコンパイラプラグインや機能強化の開発。
  最小限のランタイムパフォーマンスオーバーヘッドと既存の Go プロジェクトとの互換性を確保します。
- OpenTelemetry やその他のモニタリングフレームワークに沿った標準化された計装パターンの提供。

コントリビューションに興味がある方や、単にもっと知りたい方のために、SIG に関する有用な情報を以下に示します。

- GitHub リポジトリ:
  [opentelemetry-go-compile-instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation)
- CNCF Slack:
  [#otel-go-compt-instr-sig](https://cloud-native.slack.com/archives/C088D8GSSSF)
- ミーティング: 隔週木曜日 UTC 08:00 – 09:00（カレンダーの招待状は
  [この Google グループ](https://groups.google.com/a/opentelemetry.io/g/calendar-go)
  を登録するか、
  [コミュニティカレンダー](https://github.com/open-telemetry/community/?tab=readme-ov-file#calendar)で詳細をご確認ください）

この新しい SIG の活動開始を楽しみにしており、この素晴らしいコラボレーションの成果を心待ちにしています！

[^1]: 「自分で秤を作る」、つまり OTel に相当する方法として、サードパーティライブラリを手動で計装することを望まない限り。
