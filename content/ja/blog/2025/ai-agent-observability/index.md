---
title: AIエージェントオブザーバビリティ - 標準の進化とベストプラクティス
author: >-
  [Guangya Liu](https://github.com/gyliu513) (IBM), [Sujay
  Solomon](https://github.com/solsu01) (Google)
linkTitle: AI Agent Observability
issue: https://github.com/open-telemetry/opentelemetry.io/issues/6389
sig: SIG GenAI Observability
date: 2025-03-06
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
cSpell:ignore: genai Guangya PydanticAI Sujay
---

## 2025年、AIエージェントの年

AIエージェントは、2025年の人工知能における次の大きな飛躍になりつつあります。
自律的なワークフローからインテリジェントな意思決定まで、AIエージェントは業界を横断する数多くのアプリケーションを強化するでしょう。
しかし、この進化に伴い、特に企業のニーズに合わせてこれらのエージェントを拡張する場合、AIエージェントのオブザーバビリティが非常に重要になります。
適切な監視、トレース、ロギングのメカニズムがなければ、AIエージェント駆動型アプリケーションの問題を診断し、効率を改善し、信頼性を確保することは困難です。

### AIエージェントとはなにか

AIエージェントとは、LLMの能力、外界に接続するツール、高レベルの推論を組み合わせて使用し、望ましい最終目標や状態を達成するアプリケーションのことです。
別の言い方では、エージェントは、LLMが自身のプロセスやツールの使い方を動的に指示し、タスクを達成する方法を制御するシステムとして扱うこともできます。

![ReActの推論と計画を使ったRAGベースのサンプルアプリケーション](ai-agent.png)
<small>_Image credit_:
[Google AI Agent Whitepaper](https://www.kaggle.com/whitepaper-agents).</small>

AIエージェントについての情報は他にも以下を参照してください。

- [Google: What is an AI agent?](https://cloud.google.com/discover/what-are-ai-agents)
- [IBM: What are AI agents?](https://www.ibm.com/think/topics/ai-agents)
- [MicroSoft: AI agents — what they are, and how they’ll change the way we work](https://news.microsoft.com/source/features/ai/ai-agents-what-they-are-and-how-theyll-change-the-way-we-work/)
- [AWS: What are AI Agents?](https://aws.amazon.com/what-is/ai-agents/)
- [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)

### オブザーバビリティのかなたへ

通常、アプリケーションからのテレメトリーは、アプリケーションの監視とトラブルシューティングのために使用されます。
AIエージェントの場合、その非決定論的な性質から、テレメトリーは、評価ツールのインプットとして使用することで、エージェントの品質から継続的に学び、改善するためのフィードバックループとしても使用されます。

生成AIのためのオブザーバビリティと評価ツールがさまざまなベンダーから提供されていることを考えると、ベンダーやフレームワーク固有のフォーマットによるロックインを避けるために、エージェントアプリによって生成されるテレメトリーの形状に関する標準を確立することが重要です。

## AIエージェントのオブザーバビリティの現状

AIエージェントのエコシステムが成熟し続けるにつれて、標準化された強固なオブザーバビリティの必要性がより明らかになってきています。
いくつかのフレームワークが組み込みの計装を提供する一方で、他のフレームワークはオブザーバビリティツールとの統合に依存しています。
この断片的な状況は、[生成AIオブザーバビリティプロジェクト](https://github.com/open-telemetry/community/blob/main/projects/gen-ai.md)とOpenTelemetryの新たなセマンティック規約の重要性を強調しています。
これらは、テレメトリーデータがどのように収集され報告されるかを統一することを目的としています。

### AIエージェントアプリケーションとAIエージェントフレームワークの比較

**AIエージェントアプリケーション**と**AIエージェントフレームワーク**を区別することは極めて重要です。

- **AIエージェントアプリケーション**は、自律的に特定のタスクを実行する個々のAI駆動エンティティを指す。
- **AIエージェントフレームワーク**は、AIエージェントを開発、管理、展開するために必要なインフラを提供し、多くの場合、エージェントをゼロから構築するよりも合理的な方法です。
  たとえば、以下のようなものがあります。
  [IBM Bee AI](https://github.com/i-am-bee),
  [IBM wxFlow](https://github.com/IBM/wxflows/),
  [CrewAI](https://www.crewai.com/),
  [AutoGen](https://microsoft.github.io/autogen/dev/),
  [Semantic Kernel](https://github.com/microsoft/semantic-kernel),
  [LangGraph](https://www.langchain.com/langgraph),
  [PydanticAI](https://ai.pydantic.dev/)などです.

![AIエージェントアプリケーションとAIエージェントフレームワーク](agent-agent-framework.png)

### 標準化されたセマンティック規約の確立

今日、OpenTelemetry内の[生成AIオブザーバビリティプロジェクト](https://github.com/open-telemetry/community/blob/main/projects/gen-ai.md)は、AIエージェントのオブザーバビリティを標準化するためのセマンティック規約の定義に積極的に取り組んでいます。
この取り組みは、主に次のようなものによって推進されています。

- **エージェントアプリケーションのセマンティック規約** - AIエージェントアプリケーションのセマンティック規約の草案は、[OpenTelemetryのセマンティック規約リポジトリ](https://github.com/open-telemetry/semantic-conventions/issues/1732)での議論の一部として、すでに確立され、最終化されています。
  最初のAIエージェントセマンティック規約は、[GoogleのAIエージェント白書](https://www.kaggle.com/whitepaper-agents)に基づいており、オブザーバビリティ標準を定義するための基礎的な枠組みを提供しています。
  今後、この最初の規約をより強固で包括的なものにするために、改良と強化を続けていきます。

- **エージェントフレームワークのセマンティック規約** - 今、焦点はすべてのAIエージェントフレームワークに共通のセマンティック規約を定義することに移っています。
  この取り組みは[このOpenTelemetry issue](https://github.com/open-telemetry/semantic-conventions/issues/1530)で議論されており、IBM Bee Stack、IBM wxFlow、CrewAI、AutoGen、LangGraphなどのフレームワークのための標準化されたアプローチを確立することを目指しています。
  さらに、異なるAIエージェントフレームワークは、共通の標準を遵守しながら、独自のフレームワークベンダー固有のセマンティック規約を定義することができるようになります。

これらの規約を確立することで、AIエージェントフレームワークが標準化されたメトリクス、トレース、ログを報告できるようになり、オブザーバビリティソリューションの統合や、異なるフレームワーク間でのパフォーマンスの比較が容易になります。

注意: モデルのためのOpenTelemetryについては、[生成AIセマンティック規約](/docs/specs/semconv/gen-ai/)に実験的な規約がすでに存在します。

### 計装のアプローチ

システムをオブザーバビリティがある状態にするためには、計装されなければなりません。
つまり、システムのコンポーネントのコードは、[トレース、メトリクス、ログを出力しなければなりません](/docs/concepts/instrumentation/)。

AIエージェントフレームワークによって、オブザーバビリティを実装するアプローチはさまざまで、主に2つの選択肢に分類されます。

#### 選択肢1: 組み込み計装

最初の選択肢は、OpenTelemetry のセマンティックな規約を使ってテレメトリーを放出する組み込みの計装を実装することです。
これは、オブザーバビリティがネイティブ機能であることを意味し、ユーザーはエージェントのパフォーマンス、タスク実行、リソース利用をシームレスに追跡することができます。
CrewAIのようないくつかのAIエージェントフレームワークは、このパターンにしたがっています。

エージェントフレームワークの開発者として、この計装の長所と短所をいくつか挙げてみましょう。

- 長所
  - テレメトリー用の計装を最新に保つためのメンテナンスのオーバーヘッドを引き受けることができます。
  - OpenTelemetryのコンフィギュレーションに不慣れなユーザーでも簡単に導入できます。
  - 新機能を秘密にしておきつつ、リリース日にはそのための計装を提供できます。
- 短所
  - オブザーバビリティ機能を必要としないユーザーにとっては、フレームワークが肥大化します。
  - フレームワークのOpenTelemetryへの依存関係がアップストリームのアップデートに遅れた場合、バージョンロックインのリスクがあります。
  - カスタム計装を好む上級ユーザーにとっては、柔軟性が低いです。
  - 現在のセマンティック規約に詳しいOTelの貢献者からフィードバックやレビューが得られないかもしれません。
  - あなたの計装は、（OTelライブラリの依存関係のバージョンだけでなく）ベストプラクティスや慣例に関して遅れているかもしれません。
- この方法を検討する場合に従うべきベストプラクティスをいくつか紹介しましょう
  - ユーザーがフレームワークの組み込み計装からのテレメトリー収集を簡単に有効または無効にできるように、コンフィギュレーション設定を提供します。
  - 他の外部計装パッケージの使用を希望するユーザーを事前に計画し、衝突を避けます。
  - このパスを選択する場合は、[OpenTelemetryレジストリ](/ecosystem/registry/) にエージェントフレームワークを登録することを検討してください。
- エージェントアプリケーションの開発者として、次の条件を満たせば、計装を組み込んだエージェントフレームワークを選択したいと思うかもしれません。
  - エージェントアプリケーションのコードにおいて、外部パッケージへの依存を最小限に抑えられる
  - 手動で設定することなく、すぐにオブザーバビリティが得られる

#### 選択肢2: OpenTelemetry経由で計装する

このオプションは、いくつかの GitHub リポジトリに OpenTelemetry の計装ライブラリを公開するものです。
これらの計装ライブラリをエージェントにインポートし、OpenTelemetry セマンティック規約にしたがってテレメトリーを出すように設定できます。

OpenTelemetryで計装を公開するには、2つのオプションがあります。

- オプション1: [Traceloop OpenTelemetry Instrumentation](https://github.com/traceloop/openllmetry/tree/main/packages)、[Langtrace OpenTelemetry Instrumentation](https://github.com/Scale3-Labs/langtrace-python-sdk/tree/main/src/langtrace_python_sdk/instrumentation)などのように、あなた自身のリポジトリ/パッケージにある外部計装。
- オプション 2: [instrumentation-genai](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation-genai) などのように、OpenTelemetry が所有するリポジトリにある外部計装。

どちらのオプションもうまくいきますが、長期的なゴールは、Traceloopが今OpenTelemetryに[計装コードを寄付](https://github.com/open-telemetry/community/issues/2571)しようとしているように、OpenTelemetry所有のリポジトリでコードをホストすることです。

エージェントフレームワークの開発者として、OpenTelemetryを使った計装の長所と短所をいくつか挙げます。

- 長所
  - オブザーバビリティをコアフレームワークから切り離し、肥大化を抑えられます。
  - OpenTelemetryのコミュニティ主導のメンテナンスを活用し、計装のアップデートを行えます。
  - ユーザーは、特定のニーズ（クラウドプロバイダーやLLMベンダーなど）に応じてcontribライブラリを組み合わせて使用できます。
  - セマンティック規約やゼロコード計装に関するベストプラクティスを活用する可能性が高いです。
- 短所
  - インストール時と実行時の両方で、互換性のない、あるいは古いコントリビュートパッケージに依存している場合、断片化のリスクがあります。
  - OpenTelemetryのレビューキューにPRが多すぎると、開発速度は遅くなります。
- この手法のベストプラクティス
  - 一般的なOpenTelemetryコントリビューションライブラリ（たとえば、LLMベンダー、ベクトルDB）との互換性を確保します。
  - 推奨されるcontribパッケージと設定例に関する明確なドキュメントを提供します。
  - 車輪の再発明を避け、既存のOpenTelemetry標準に合わせます。
- エージェントアプリケーションの開発者として、次の状況であれば、計装を組み込んだエージェントフレームワークを選択したいと思うかもしれません。
  - テレメトリーの送信元と送信先をきめ細かくコントロールする必要がある
  - あなたのユースケースは、ニッチまたはカスタムツールとオブザーバビリティを統合する必要がある

**注意:** どのようなアプローチを取るにせよ、すべてのAIエージェントフレームワークは、オブザーバビリティデータの相互運用性と一貫性を確保するために、AIエージェントフレームワークのセマンティック規約を採用することが不可欠です。

## AIエージェントのオブザーバビリティの未来

今後、AIエージェントのオブザーバビリティは進化し続けるでしょう。

- エッジケースや新たなAIエージェントフレームワークをカバーするため、**より強固なセマンティック規約** を策定します。
- **統一されたAIエージェントフレームワークのセマンティック規約** は、異なるフレームワーク間の相互運用性を確保すると同時に、ベンダー固有の拡張を柔軟に可能にします。
- **AIエージェントのセマンティック規約を継続的に改善** し、初期規格を洗練させ、AIエージェントの進化にともなう新たな課題に対処します。
- AIエージェントの監視、デバッグ、最適化のための **ツールの改善**。
- **AIモデルオブザーバビリティとの緊密な統合** により、AIを活用したアプリケーションにエンドツーエンドの可視性を提供します。

## OpenTelemetryのGenAI SIGの役割

[OpenTelemetryのGenAI Special Interest Group (SIG)](https://github.com/open-telemetry/community/blob/main/projects/gen-ai.md)は、以下のような重要な分野をカバーする[GenAI semantic conventions](/docs/specs/semconv/gen-ai/)を積極的に定義しています。

- LLMやモデルのセマンティック規約
- VectorDBのセマンティック規約
- AIエージェントのセマンティック規約（より広範なGenAIセマンティック規約の重要な構成要素）

規約に加え、SIGは、Pythonや他の言語によるエージェントやモデルの計装カバレッジを提供するために、その範囲を拡大してきました。
AIエージェントがますます洗練されるにつれて、オブザーバビリティはその信頼性、効率性、信頼性を保証する上で基本的な役割を果たすでしょう。
AIエージェントのオブザーバビリティに対する標準化されたアプローチを確立するには協力が必要であり、より広いAIコミュニティからの貢献を求めています。

私たちは、ベストプラクティスを確立し、これらの標準を一緒に洗練するために、さまざまなAIエージェントフレームワークコミュニティと提携することを楽しみにしています。
みなさんの洞察と貢献は、AIのオブザーバビリティの未来を形作る助けとなり、より透明で効果的なAIエコシステムを育成します。

生成AIオブザーバビリティの業界標準の未来を形作る手助けをするこの機会をお見逃しなく！
[CNCF Slack](https://slack.cncf.io) `#otel-genai-instrumentation` チャンネル、または [GenAI SIG meeting](https://github.com/open-telemetry/community/blob/main/projects/gen-ai.md#meeting-times) にご参加ください。
