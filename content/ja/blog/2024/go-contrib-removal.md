---
title: 所有者のいない Go Contrib モジュールにはコードオーナーが必要です。さもなければ削除されます
linkTitle: Go Contrib モジュールの所有権
date: 2024-05-28
author: >-
  [Fabrizio Ferri-Benedetti](https://github.com/theletterf) (Splunk)
issue: 4542
sig: SIG Go
default_lang_commit: fe9ed7ba61fa6b54041f5173db20d11ce780a1e2
# prettier-ignore
cSpell:ignore: aws Benedetti Fabrizio Ferri gopkg labstack macaron otelaws otelecho otellambda otelmacaron otelmongo otelmux
---

Go SIG は、コードオーナーのいない contrib モジュールのコードを 2024年8月21日以降に削除します。
公開済みのパッケージとリリースは非推奨としてマークされますが、引き続きダウンロード可能です。

現在オーナーのいないモジュールは以下のとおりです。

- [`go.opentelemetry.io/contrib/detectors/aws/ec2`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/ec2)
- [`go.opentelemetry.io/contrib/detectors/aws/ecs`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/ecs)
- [`go.opentelemetry.io/contrib/detectors/aws/eks`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/eks)
- [`go.opentelemetry.io/contrib/detectors/aws/lambda`](https://pkg.go.dev/go.opentelemetry.io/contrib/detectors/aws/lambda)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-lambda-go/otellambda`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-lambda-go/otellambda)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/aws/aws-sdk-go-v2/otelaws)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux)
- [`go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho)
- [`go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo)
- [`go.opentelemetry.io/contrib/instrumentation/gopkg.in/macaron.v1/otelmacaron`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/gopkg.in/macaron.v1/otelmacaron)
- [`go.opentelemetry.io/contrib/propagators/aws`](https://pkg.go.dev/go.opentelemetry.io/contrib/propagators/aws)
- [`go.opentelemetry.io/contrib/samplers/aws/xray`](https://pkg.go.dev/go.opentelemetry.io/contrib/samplers/aws/xray)

削除対象のモジュールの全リストは、[Remove unowned modules](https://github.com/orgs/open-telemetry/projects/92/views/1) プロジェクトボードを参照してください。

## なぜこれらのモジュールは削除されるのですか？ {#why-are-those-modules-going-to-be-removed}

Go Contrib の[コントリビューションガイドライン](https://github.com/open-telemetry/opentelemetry-go-contrib/blob/57e5a3a8b5c44d96d1f67bcf52e3a33b983c1a79/CONTRIBUTING.md?from_branch=main#code-owners)に記載されているとおり、すべての Contrib モジュールにはコードが放棄されないようにコードオーナーが必要です。
コードオーナーには、コンポーネントのメンテナンス、イシューへの対応、プルリクエストのレビューを行う責任があります。

## コードオーナーになりたい方へ {#i-want-to-become-a-code-owner-what-do-i-do}

モジュールのコードオーナーになるには、OpenTelemetry organization のメンバーであり、メンテナンスしたいコードについて十分な実務知識を持っている必要があります。
GitHub で OpenTelemetry のメンバーになるための要件については、[Community membership](https://github.com/open-telemetry/community/blob/25f027532a6e9b503d6eb4dd3db0a98eb3b5f1cb/guides/contributor/membership.md?from_branch=main#requirements) を参照してください。

すべての要件を満たしている場合は、[イシューを作成](https://github.com/open-telemetry/opentelemetry-go-contrib/issues/new?assignees=&labels=&projects=&template=owner.md&title=)してください。

皆さんからのリクエストをお待ちしています！
