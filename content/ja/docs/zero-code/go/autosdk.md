---
title: Go 計装用 Auto SDK
linkTitle: Auto SDK
description: Auto SDK を使用して、手動スパンをゼロコード eBPF スパンと統合します。
weight: 16
default_lang_commit: 4edfbfc2ff38123678ca63eca95de94ede457623
---

[OBI](/docs/zero-code/obi) などのツールで使用される OpenTelemetry Go の eBPF 計装フレームワークは、Auto SDK を通じて、手動で計装された OpenTelemetry スパンとの統合をサポートします。

## Auto SDK とは何ですか？ {#what-is-the-auto-sdk}

Auto SDK は、Go の eBPF 自動計装との互換性を持つように設計された、完全に実装済みのカスタム OpenTelemetry Go SDK です。
これにより、たとえば `net/http` のような自動計装されたパッケージが、手動スパンとのコンテキスト伝搬をサポートできるようになります。

## いつ使用するべきですか？ {#when-should-i-use-it}

OpenTelemetry Go eBPF 計装は現在、限られた数のパッケージのみをサポートしています。
そのような場合でも、この計装を拡張し、コード内でカスタムスパンを作成したい場合があります。
Auto SDK は、自動スパンでも使用される共有トレースコンテキストを使ってカスタムスパンを計装することで、これを可能にします。

## どのように使用しますか？ {#how-do-i-use-it}

[OpenTelemetry Go v1.36.0](https://github.com/open-telemetry/opentelemetry-go/releases/tag/v1.36.0) のリリース以降、Auto SDK は OpenTelemetry Go の標準 API の間接的な依存関係として自動的にインポートされます。
プロジェクトに Auto SDK があることは、`go.mod` に `go.opentelemetry.io/auto/sdk` が含まれているかを見ることで確認できます。

Auto SDK を使用した手動スパンの作成は、標準の [Go 計装](/docs/languages/go/instrumentation/)を使用してスパンを作成するのと基本的に同じです。

Auto SDK が利用可能であれば、`tracer.Start()` で手動スパンを作成するだけで使用できます。

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/otel"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// トレーサーを取得します
		tracer := otel.Tracer("example-server")

		// 手動スパンを開始します
		_, span := tracer.Start(r.Context(), "manual-span")
		defer span.End()

		// デモ用の属性を追加します
		span.SetAttributes()
		span.AddEvent("Request handled")
	})

	log.Println("Server running at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

この例では、eBPF フレームワークが HTTP の受信リクエストを自動的に計装し、手動スパンを HTTP ライブラリによって計装された同じトレースにリンクします。
このサンプルでは TracerProvider が初期化されていない点に注意してください。
Auto SDK は、SDK を有効化するうえで重要な独自の TracerProvider を登録します。

基本的に、Go のゼロコードエージェントによって計装されたアプリケーションで手動スパンを作成する以外に、Auto SDK を有効化するために必要なことはありません。
グローバル TracerProvider を手動で登録しない限り、Auto SDK は自動的に有効化されます。

> [!WARNING]
>
> グローバル TracerProvider を手動で設定すると、Auto SDK と競合し、手動スパンが eBPF ベースのスパンと適切に相関できなくなります。
> eBPF による計装も適用されている Go アプリケーションで手動スパンを作成する場合は、独自のグローバル TracerProvider を初期化しないでください。

### Auto SDK TracerProvider {#auto-sdk-tracerprovider}

ほとんどのユースケースでは、Auto SDK の組み込み TracerProvider を手動で操作する必要はありません。
しかし、一部の高度なユースケースでは、Auto SDK の TracerProvider を手動で構成したい場合があります。
[`auto.TracerProvider()`](https://pkg.go.dev/go.opentelemetry.io/auto/sdk) 関数を使ってアクセスできます。

```go
import (
	"go.opentelemetry.io/otel"
    autosdk "go.opentelemetry.io/auto/sdk"
)

func main() {
	tp := autosdk.TracerProvider()
	otel.SetTracerProvider(tp)
}
```

## Auto SDK はどのように動作しますか？ {#how-does-the-auto-sdk-work}

アプリケーションが OpenTelemetry eBPF によって計装されると、eBPF プログラムはアプリケーション内に `go.opentelemetry.io/auto/sdk` の依存関係が存在するかを探します。
（この依存関係は `go.opentelemetry.io/otel` にデフォルトで含まれており、明示的にインポートする必要はないことに留意してください。）
依存関係が見つかった場合、eBPF プログラムはグローバル OpenTelemetry SDK 内のブール値を有効にし、OpenTelemetry に Auto SDK TracerProvider を使用するよう指示します。

その後、Auto SDK は他の SDK と非常によく似た方法で動作し、仕様で要求されるすべての機能を実装します。
主な違いは、Auto SDK も eBPF によって自動計装され、他の eBPF 計装済みライブラリとのコンテキスト伝搬を統一する点です。

基本的に Auto SDK は、OpenTelemetry eBPF が OpenTelemetry の標準 API とのコンテキスト伝搬を識別して調整するための仕組みです。
これは、他のパッケージに対して行うのとほぼ同じように、OpenTelemetry の関数シンボルを計装することで実現されます。
