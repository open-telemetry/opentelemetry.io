---
title: '自動計装の謎を解く: その仕組みを理解する'
linkTitle: 自動計装の謎を解く
date: 2025-10-08
author: >-
  [Severin Neumann](https://github.com/svrnm) (Causely)
canonical_url: https://www.causely.ai/blog/demystifying-automatic-instrumentation
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7810
sig: Comms
default_lang_commit: b291d077d4c7aba2b43ec5a1648c02bb5c43f870
cspell:ignore: Beyla bpftrace Causely libbpf premain uprobes
---

OpenTelemetry や [eBPF](https://ebpf.io/) が普及しているにもかかわらず、自動計装が内部で実際に何をしているかを理解している開発者はほとんどいません。
この記事ではその仕組みを分解します。
自分で自動計装を構築することを勧めるためではなく、ツールが「ただ動く」ときに何が起きているのかを理解する手助けとするためです。

ここでは、自動計装を支える 5 つの主要な技術を紹介します。
モンキーパッチ、バイトコード計装、コンパイル時計装、eBPF、そして言語ランタイム API です。
それぞれの技術は、異なるプログラミング言語やランタイム環境の固有の特性を活用し、コードを変更せずにオブザーバビリティを実現します。

## 自動計装とは何か {#what-is-automatic-instrumentation}

[用語集](/docs/concepts/glossary)によると、自動計装とは「_エンドユーザーがアプリケーションのソースコードを変更する必要のないテレメトリー収集方法。
方法はプログラミング言語によって異なり、バイトコードインジェクションやモンキーパッチがその例です。_」と定義されています。

「自動計装」という用語は、関連はしているものの異なる 2 つの概念を指すためによく使われる点に注意が必要です。
上記の定義およびこのブログ記事では、コードを変更せずにオブザーバビリティを実現するために使用できる特定の技術（バイトコードインジェクションやモンキーパッチなど）を指しています。
一方、会話の中で「自動計装」と言う場合、[OpenTelemetry Java エージェント](/docs/zero-code/java/agent/)のような完全なゼロコードソリューションを意味することがよくあります。

この区別は重要です。
実際には 3 層の階層構造があります。
最下層には、このブログ記事で紹介する**自動計装の技術**（バイトコードインジェクション、モンキーパッチなど）があります。
これらの技術は、特定のフレームワークを対象とした[計装ライブラリ](/docs/concepts/glossary/#instrumentation-library)によって使用されます。
たとえば、[Spring および Spring Boot](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/f7cba3b86167946b3783fb8e575f1c169aec6972/instrumentation/spring?from_branch=main)、[Express.js](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)、[Laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel)、その他の人気フレームワークを計装するライブラリがあります。
そして、OpenTelemetry Java エージェントのような完全なソリューションは、これらの計装ライブラリをまとめ、エクスポーター、サンプラー、その他の構成要素に必要なボイラープレート設定をすべて追加します。

オブザーバビリティコミュニティでは適切な用語について議論が続いていますが、このブログ記事ではその議論の解決を試みません。

ある人にとって「自動」に見えるものが、別の人にとっては「手動」に見えることもあります。
ライブラリ開発者が OpenTelemetry API を自分のコードに統合していれば、そのライブラリのユーザーは、アプリケーションに OpenTelemetry SDK を追加するだけで、そのライブラリからトレース、ログ、メトリクスを「自動的に」取得できます。

## 技術を自分で試してみたい場合 {#want-to-try-the-techniques-yourself}

このブログ記事には、概念を説明するための小さなコードスニペットが含まれています。
完全に動作するサンプルは、[ラボリポジトリ](https://github.com/causely-oss/automatic-instrumentation-lab)で試すことができます。

これらの技術を紹介する前に、重要な注意点があります。
自動計装をゼロから自分で構築すべきではありません。
特に、このブログ記事を設計図として使うべきではありません。
ここでのサンプルは教育目的で簡略化されており、実際の実装で直面する多くの複雑な詳細は省略されています。
複雑さやエッジケースの多くに対処してくれる確立されたツールやメカニズムが利用可能です。
この分野をさらに深く掘り下げたい場合は、[OpenTelemetry のような既存プロジェクトに貢献する](/community/#develop-and-contribute)のが最良のアプローチです。
経験豊富なメンテナーから学び、本番環境で使えるコードに取り組むことができます。

## 自動計装の技術 {#automatic-instrumentation-techniques}

それでは、これらの技術が内部でどのように動作するかを見ていきましょう。

### モンキーパッチ: ランタイムでの関数置換 {#monkey-patching-runtime-function-replacement}

モンキーパッチは、おそらく最も直感的な自動計装の技術であり、JavaScript、Python、Ruby などの動的言語でよく使われます。
コンセプトはシンプルです。
ランタイムで既存の関数を計装済みバージョンに置き換え、元の関数の呼び出し前後にテレメトリーを挿入します。

Node.js での動作は以下のとおりです。

```javascript
const originalFunction = exports.functionName;

function instrumentedFunction(...args) {
  const startTime = process.hrtime.bigint();
  const result = originalFunction.apply(this, args);
  const duration = process.hrtime.bigint() - startTime;
  console.log(`functionName(${args[0]}) took ${duration} nanoseconds`);
  return result;
}

exports.functionName = instrumentedFunction;
```

require-in-the-middle ライブラリを使用すると、モジュールのロード時にこの置換を実行できます。
モジュールのロードプロセスをインターセプトし、エクスポートされた関数がアプリケーションで使用される前に変更します。

```javascript
const hook = require("require-in-the-middle");
hook(["moduleName"], (exports, name, basedir) => {
  const functionName = exports.fibonacci;
  ...
  exports.functionName = instrumentedFunction;
  return exports;
});
```

ただし、モンキーパッチには制約があります。
すでにマシンコードにコンパイルされたコードは計装できず、計装がロードされる前に呼び出される関数には効果がない場合があります。
また、関数のラッピングによるオーバーヘッドは、パフォーマンスが重要なアプリケーションでは大きくなる可能性があります。
さらに、計装対象のコードの実装が大きく変わった場合、モンキーパッチは脆弱です。
計装コードを新しいインターフェイスに合わせて更新する必要があるためです。

自分で試してみたい場合は、ラボの [Node.js のサンプル](https://github.com/causely-oss/automatic-instrumentation-lab#monkey-patching-nodejs)を参照してください。

モンキーパッチの実際に使われている実装を確認したい場合は、OpenTelemetry が提供する [JavaScript](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/87876b5451052f336bad2f5b9df65d77c75dbd76/packages?from_branch=main) または [Python](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/413c98e542b747b14bc35d79c18c7d020662f745/instrumentation?from_branch=main) の計装ライブラリを参照してください。

### バイトコード計装: 仮想マシンの変更 {#bytecode-instrumentation-modifying-the-virtual-machine}

仮想マシン上で動作する言語には、バイトコード計装が強力なアプローチです。
この技術は、コンパイルされたバイトコードを仮想マシンがロードする際に変更し、命令レベルでコードを挿入します。

Java の Instrumentation API がこのアプローチの基盤を提供します。
`-javaagent` フラグで Java エージェントが指定されると、JVM はメインアプリケーションの起動前にエージェントの `premain()` メソッドを呼び出します。
これにより、クラスがロードされる際に任意のクラスを変更できるクラストランスフォーマーを登録する機会が得られます。

```java
public static void premain(String args, Instrumentation inst) {
    new AgentBuilder.Default()
        .type(ElementMatchers.nameStartsWith("com.example.TargetApp"))
        .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
            builder.method(ElementMatchers.named("targetMethod"))
                   .intercept(MethodDelegation.to(MethodInterceptor.class))
        ).installOn(inst);
}
```

インターセプターは元のメソッド呼び出しを計測ロジックでラップします。

```java
@RuntimeType
public static Object intercept(@Origin String methodName,
                            @AllArguments Object[] args,
                            @SuperCall Callable<?> callable) throws Exception {
    long startTime = System.nanoTime();
    Object result = callable.call();
    long duration = System.nanoTime() - startTime;

    System.out.printf("targetMethod(%s) took %d ns%n", args[0], duration);
    return result;
}
```

バイトコード計装は JVM レベルで動作するため、JVM エコシステム内で言語に依存しません。
Java、Kotlin、Scala、その他の JVM 言語を変更なしに計装できます。

バイトコード計装の主な利点は、包括的なカバレッジです。
動的にロードされたコードや外部ソースからのコードを含め、JVM 上で動作するあらゆるコードを計装できます。
ただし、バイトコード変換プロセスによるオーバーヘッドが多少あります。

実際の実装では、[ByteBuddy](https://bytebuddy.net/#/) が Java におけるバイトコード計装のデファクトスタンダードのライブラリです。
Java エージェントを作成するための強力で柔軟な API を提供し、バイトコード操作の複雑さの多くを抽象化して、計装ルールを定義するためのクリーンで型安全な方法を提供します。

自分で試してみたい場合は、ラボの [Java のサンプル](https://github.com/causely-oss/automatic-instrumentation-lab#byte-code-instrumentation-java)を参照してください。

バイトコード計装の実際に使われている実装を確認したい場合は、OpenTelemetry が提供する [Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/bc533f6df8545f79fcce2b138b14a6aca748e7fc/instrumentation?from_branch=main) または [.NET](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/4a4fab74f466cdbae23876e88e17b797b7674319/src?from_branch=main) の計装ライブラリを参照してください。

### コンパイル時計装: オブザーバビリティをバイナリに組み込む {#compile-time-instrumentation-baking-observability-into-the-binary}

Go のような静的にコンパイルされる言語には、コンパイル時計装が別のアプローチを提供します。
ランタイムでコードを変更するかわりに、[抽象構文木](https://en.wikipedia.org/wiki/Abstract_syntax_tree)（AST）操作を使用して、ビルドプロセス中にソースコードを変換します。

このプロセスでは、ソースコードを AST にパースし、計装コードを追加するためにツリーを変更し、コンパイル前に変更済みソースコードを生成します。
このアプローチにより、計装が最終的なバイナリに組み込まれ、計装メカニズム自体によるランタイムオーバーヘッドがゼロになります。

```go
func instrumentFunction() {
    fset := token.NewFileSet()
    file, err := parser.ParseFile(fset, "app/target.go", nil, parser.ParseComments)

    // 対象の関数を見つけて計測ロジックを追加する
    ast.Inspect(file, func(n ast.Node) bool {
        if fn, ok := n.(*ast.FuncDecl); ok && fn.Name.Name == "targetFunction" {
            // 計測用の defer 文を追加する
            deferStmt := &ast.DeferStmt{
                Call: &ast.CallExpr{
                    Fun: &ast.CallExpr{
                        Fun: &ast.Ident{Name: "trace_targetFunction"},
                    },
                },
            }
            fn.Body.List = append([]ast.Stmt{deferStmt}, fn.Body.List...)
        }
        return true
    })

    // 変更されたファイルを書き戻す
    printer.Fprint(f, fset, file)
}
```

コンパイル時計装にはいくつかの利点があります。
計装メカニズムによるランタイムオーバーヘッドがゼロであり、生成されたバイナリには必要なコードがすべて含まれます。
このアプローチはコンパイル言語との相性がよく、既存のビルドプロセスに統合できます。

ただし、トレードオフもあります。
ソースコードとビルドシステムへのアクセスが必要なため、サードパーティのアプリケーションやライブラリの計装には適していません。
また、抽象構文木（AST）を正確かつ一貫して操作するために、より高度なツールが必要であり、ビルドパイプラインに複雑さが加わります。
CI/CD ワークフローの変更が必要になる場合もあります。

自分で試してみたい場合は、ラボの [Go コンパイル時のサンプル](https://github.com/causely-oss/automatic-instrumentation-lab#compile-time-instrumentation-go)を参照してください。

コンパイル時計装の実際に使われている実装を確認したい場合は、[OpenTelemetry Go Compile Instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation) プロジェクトを参照してください。

### eBPF 計装: カーネルレベルのオブザーバビリティ {#ebpf-instrumentation-kernel-level-observability}

[eBPF](https://ebpf.io/)（Extended Berkeley Packet Filter）は、自動計装に対して根本的に異なるアプローチを取ります。
アプリケーションコードやバイトコードを変更するかわりに、eBPF はカーネルレベルで動作し、実行中のアプリケーションの関数のエントリーポイントとエグジットポイントにプローブをアタッチします。

eBPF プログラムは、カーネル内で動作する小さく安全なプログラムであり、システムコール、関数呼び出し、その他のイベントを観測できます。
自動計装では、uprobes（ユーザー空間プローブ）を使用して、アプリケーション内の特定の関数にアタッチします。

```bash
#!/usr/bin/env bpftrace

uprobe:/app/fibonacci:main.fibonacci
{
    @start[tid] = nsecs;
}

uretprobe:/app/fibonacci:main.fibonacci /@start[tid]/
{
    $delta = nsecs - @start[tid];
    printf("fibonacci() duration: %d ns\n", $delta);
    delete(@start[tid]);
}
```

この [bpftrace](https://github.com/bpftrace/bpftrace) スクリプトは、アプリケーション内の関数にプローブをアタッチします。
関数が呼び出されると開始時刻を記録します。
関数が返ると、実行時間を計算して結果を出力します。

eBPF 計装は言語に依存せず、Linux 上で動作する任意の言語で使用できます。
アプリケーションコードやビルドプロセスへの変更を必要とせず、システムレベルの深いオブザーバビリティを提供します。
計装はカーネル内で実行されるため、オーバーヘッドは最小限です。

ただし、eBPF 計装にはいくつかの制約があります。
実行には Linux と root 権限が必要であり、コンテナ化された環境や昇格した権限で実行できないアプリケーションにはあまり適していません。

実際のユースケースでは、bpftrace は多くの eBPF ツールの 1 つにすぎません。
学習やプロトタイピングには優れていますが、本番環境では通常、[BCC](https://github.com/iovisor/bcc)（BPF Compiler Collection）や [libbpf](https://github.com/libbpf/libbpf) のようなより高度なフレームワークを使用します。
これらは、より優れたパフォーマンス、より多くの機能、より強力な安全性保証を提供します。

自分で試してみたい場合は、ラボの [Go eBPF のサンプル](https://github.com/causely-oss/automatic-instrumentation-lab#ebpf-based-instrumentation-go)を参照してください。

eBPF 計装の実際に使われている実装を確認したい場合は、[OpenTelemetry eBPF Instrumentation](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation) プロジェクト（"OBI"）を参照してください。
これは [Grafana Labs による Beyla の寄贈](https://github.com/open-telemetry/community/issues/2406)の成果です。

### 言語ランタイム API: ネイティブな計装サポート {#language-runtime-apis-native-instrumentation-support}

一部の言語には計装のための組み込み API が用意されており、より統合されたアプローチを提供します。
PHP 8.0 で導入された [PHP の Observer API](https://github.com/php/php-src/blob/PHP-8.0/Zend/zend_observer.h) は、このアプローチの代表的な例です。

Observer API を使用すると、C 拡張が Zend エンジンレベルで PHP エンジンの実行フローにフックできます。
これにより、コードの変更なしに PHP アプリケーションの動作を詳細に観測できます。

```cpp
static void observer_begin(zend_execute_data *execute_data) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            start_time = clock();
        }
    }
}

static void observer_end(zend_execute_data *execute_data, zval *retval) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            clock_t end_time = clock();
            double duration = (double)(end_time - start_time) / CLOCKS_PER_SEC * 1000;
            php_printf("Function %s() took %.2f ms\n", function_name, duration);
        }
    }
}
```

Observer API は、PHP アプリケーションに計装を追加するためのクリーンでサポートされた方法を提供します。
他の言語が計装 API を実装する方法と同様に、言語ランタイムレベルで動作します。
このアプローチは効率的で、言語のエコシステムとうまく統合されています。

ただし、C 拡張の記述が必要であり、複雑さが増します。
C や PHP の内部 API に馴染みのない開発者にとってはアクセスしにくくなります。
また、PHP に固有であるため、その知識は他の言語に転用できません。

自分で試してみたい場合は、ラボの [PHP Observer API のサンプル](https://github.com/causely-oss/automatic-instrumentation-lab#php-observer-api-php)を参照してください。

API 計装の実際に使われている実装を確認したい場合は、OpenTelemetry が提供する [PHP](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/2b6a02f67d85f7f94ebc285d2c08c3523d26e093/src/Instrumentation?from_branch=main) の計装ライブラリを参照してください。

## コンテキスト伝搬に関する注意事項 {#a-note-on-context-propagation}

自動計装のコア技術を取り上げてきましたが、まだ議論していない重要な側面があります。
それは[コンテキスト伝搬](/docs/concepts/context-propagation/)です。
コンテキスト伝搬は、トレースコンテキスト情報（トレース ID、スパン ID）を HTTP ヘッダー、メッセージメタデータ、その他の通信チャネルに挿入し、サービス境界を越えた分散トレーシングを可能にするものです。

ここで紹介した純粋な観測技術とは異なり、コンテキスト伝搬はサービス境界を越えて送信されるデータを変更することで、アプリケーションの動作を能動的に変更します。
これには、専用のブログ記事で取り上げるべき追加の複雑さが伴います。

## まとめ {#conclusion}

モンキーパッチからバイトコード計装、eBPF プローブまで、自動計装を支えるコア技術を紹介しました。
それぞれのアプローチは、異なるプログラミング言語やランタイム環境の固有の特性を活用しています。

これらの技術は OpenTelemetry のような本番向けオブザーバビリティツールを支えており、開発者がソースコードを変更せずにテレメトリーを追加できるようにします。
最も効果的なオブザーバビリティ戦略は、自動計装と手動計装を組み合わせたものです。
自動計装は一般的なパターンに対する幅広いカバレッジを提供し、手動計装はビジネス固有のメトリクスをキャプチャします。

これらの技術を自分で試してみたい場合は、[Automatic Instrumentation Lab](https://github.com/causely-oss/automatic-instrumentation-lab) を使用できます。

これらの技術への貢献に興味がある場合は、[OpenTelemetry のさまざまな Special Interest Group](https://github.com/open-telemetry/community/#special-interest-groups)（SIG）への参加を検討してください。
