---
title: 'コントリビューターの募集: OpenTelemetry for Kotlin'
linkTitle: 'コントリビューターの募集: OTel for Kotlin'
date: 2025-09-30
author: >-
  [Jamie Lynch](https://github.com/fractalwrench) (Embrace)
issue: 2975
sig: Governance Committee
default_lang_commit: f51b643f44ad3768f3762ed1a9d07a03a0e4639f
---

## なぜOpenTelemetry for Kotlinを立ち上げるのか？ {#why-launch-opentelemetry-for-kotlin}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)（KMP）は、ブラウザ、サーバー、デスクトップ環境など、さまざまなプラットフォームでKotlinのコードを実行できます。
従来、KotlinはAndroidとJVMで最も人気がありましたが、KMPの登場により、異なるプラットフォーム間でコードを共有するために使用するユーザーが着実に増加しています。

[Embrace](https://embrace.io/)は、KMPプロジェクトで使用できるOpenTelemetry仕様のKotlin実装を寄贈する[提案を公開](https://github.com/open-telemetry/community/issues/2975)しました。
これにより、KMPおよびKotlinプロジェクトは、1つのAPIで多くの異なるプラットフォーム向けのテレメトリーを取得できるようになります。
このAPIは、可能な限りプラットフォームに依存しないOpenTelemetryの実装として設計されており、AndroidとiOSの重要なユースケースに対応するため、モバイルフレンドリーであることを目指しています。

[opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)はJVM上で動作するKotlinアプリをサポートしていますが、これはJava相互運用に依存しており、Kotlinらしい慣用的なAPIだと「感じられません」。
さらに、opentelemetry-javaはJVM上でしか動作しませんが、Kotlinは非JVMターゲットにもデプロイできます。

## コントリビューターの募集 {#call-for-contributors}

Kotlin MultiplatformでOpenTelemetryを使用することに興味がある方、ぜひご協力ください！
コードベースのメンテナンス、定期的なSpecial Interest Group（SIG）ミーティングへの参加、SDKの発展に貢献してくださるコントリビューターを募集しています。

コントリビューターになることに興味がある方、または興味を持ちそうな方をご存知の方は、[寄贈の提案](https://github.com/open-telemetry/community/issues/2975)にコメントしてください。

コントリビューターにはならないけれども、これまでのプロジェクトへのフィードバックや試用を _したい_ という方は、[こちらのリポジトリ](https://github.com/embrace-io/opentelemetry-kotlin)をご覧いただき、ご意見をissueとしてお寄せください。
