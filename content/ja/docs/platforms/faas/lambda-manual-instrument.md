---
title: Lambdaの手動計装
weight: 11
description: OpenTelemetryであなたのLambdaを手動計装する
default_lang_commit: 9ba98f4fded66ec78bfafa189ab2d15d66df2309 # patched
drifted_from_default: true
---

Lambdaの自動計装ドキュメントでカバーされていない言語については、コミュニティはスタンドアロンの計装レイヤーを持っていません。

ユーザーは、選択した言語の汎用計装ガイダンスにしたがい、コレクターLambdaレイヤーを追加してデータを送信する必要があります。

## OTelコレクターLambdaレイヤーのARNを追加する {#add-the-arn-of-the-otel-collector-lambda-layer}

[コレクターLambdaレイヤーのガイダンス](../lambda-collector/)を参照して、アプリケーションにレイヤーを追加し、コレクターを設定してください。
これを最初に追加することをおすすめします。

## LambdaをOTelで計装する {#instrument-the-lambda-with-otel}

アプリケーションを手動で計装する方法については、[各言語向け計装ガイド](/docs/languages/) を確認してください。

## Lambdaを公開する {#publish-your-lambda}

Lambdaの新しいバージョンを公開して、新しい変更と計装をデプロイします。
