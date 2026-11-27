---
title: 'OTel in Practice: Alibaba の OpenTelemetry 導入の歩み'
linkTitle: 'OTiP: Alibaba'
date: 2025-08-07
author: >-
  [Dan Gomez Blanco](https://github.com/danielgblanco) (New Relic)
sig: End-User
default_lang_commit: f73c0ca547d4c6160a6afa492e36992b1876299b
cSpell:ignore: Huxing Quesma youtube Zhang
---

[OTel in Practice](/community/end-user/otel-in-practice/) の最新セッションで、エンジニアの [Huxing Zhang](https://github.com/ralf0131) と [Steve Rao](https://github.com/steverao) が、Alibaba のサービスにおける OpenTelemetry 導入の歩みを共有しました。

ディスカッションでは、Java エージェントから Go のコンパイル時計装、そしてもちろん Gen-AI オブザーバビリティまで、幅広いトピックが取り上げられました。

Java に焦点を当てると、Alibaba は当初 Pinpoint ベースの社内ソリューションを使用していましたが、フレームワークのサポートや非同期コンテキスト伝搬に制限がありました。
そこで、強力なエコシステムと業界標準としての地位を活用するため、OpenTelemetry への移行を決断しました。

Alibaba のエンジニアたちは移行プロセスについて紹介しました。
まず OTel Java エージェントをフォークして、プロファイリング機能や中国で広く使われているフレームワークのサポートなど、必要なカスタム機能を迅速に追加しました。
そして現在では、公式のアップストリームエージェントを直接使用し、カスタムエクステンションをバンドルするという、より保守しやすいモデルに移行しています。

もう一つの重要なイノベーションとして共有されたのが、Go のコンパイル時計装アプローチです。
これにより、コード変更なしで Go アプリケーションの自動計装が可能になります。
このプロジェクトは OTel コミュニティに寄贈され、現在は [Alibaba、Datadog、Quesma による共同の取り組み](/blog/2025/go-compile-time-instrumentation/)となっています。

OpenTelemetry は現在 Alibaba で広く使われており、クラウドサービスやモダンアプリケーションのエンドツーエンドのオブザーバビリティを提供しています。
チームは引き続き、自らの改善をアップストリームプロジェクトにコントリビュートしていくことにコミットしています。

Huxing と Steve、ご参加いただきありがとうございました。
以下の録画でセッションをご覧ください！

<div class="td-max-width-on-larger-screens">
{{< youtube fgbB0HhVBq8 >}}
</div>
