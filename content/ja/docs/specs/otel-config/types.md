---
title: 設定タイプリファレンス
linkTitle: 設定タイプ
description: >-
  プロパティや制約を含む、OpenTelemetry の宣言的設定スキーマで定義されたすべてのタイプの検索可能なリファレンスです。
weight: 10
# This file lives in the opentelemetry.io repo but is mounted into the
# docs/specs/otel/ hierarchy, which cascades github_repo/github_subdir from
# the opentelemetry-specification submodule. Override those params so the
# Docsy "View page source" link points to the correct repo.
github_repo: https://github.com/open-telemetry/opentelemetry.io
github_subdir: ''
path_base_for_github_subdir: ''
default_lang_commit: 68992866a957386e428a4d63ec884ea9dc7570b6
---

OpenTelemetry の[宣言的設定](/docs/specs/otel/configuration/data-model/)スキーマは、設定ファイルを介して構成可能な SDK コンポーネントの構造を記述する設定タイプを定義します。
`Experimental` が接頭辞として付いたタイプは、予告なく破壊的変更が加えられる可能性があります。

完全なデータモデルとスキーマについては、[データモデル](/docs/specs/otel/configuration/data-model/)を参照してください。
SDK 固有の使用法については、[設定 SDK](/docs/specs/otel/configuration/sdk/) を参照してください。

{{< config-types-accordion >}}
