---
title: ライブラリ
description: ライブラリにネイティブ計装を追加する方法を紹介します。
weight: 40
default_lang_commit: d8c5612
htmltest:
  IgnoreDirs:
    # TODO drop next line after https://github.com/open-telemetry/opentelemetry.io/issues/5423 is fixed for ja pages:
    - ^ja/docs/concepts/instrumentation/libraries/
---

OpenTelemetryは、多くのライブラリに[計装ライブラリ][instrumentation libraries]を提供していて、これは通常、ライブラリフックやモンキーパッチライブラリコードを通して行われます。

OpenTelemetry を使ったネイティブのライブラリ計装は、ユーザにより良いオブザーバビリティと開発者体験を提供し、ライブラリがフックを公開して、ドキュメントを書く必要性を取り除きます。

- カスタムロギングフックは、一般的で使いやすいOpenTelemetry APIに置き換えられ、ユーザーはOpenTelemetryとだけやり取りすることになります。
- ライブラリとアプリケーションコードからのトレース、ログ、メトリクスを相関させ、一貫性を持たせられます。
- 共通規約により、ユーザーは同じ技術内、ライブラリや言語間で類似した一貫性のあるテレメトリーを得られます。
- テレメトリーシグナルは、さまざまな消費シナリオのために、十分にドキュメントが用意された多種多様なOpenTelemetry拡張ポイントを使用して、微調整（フィルター、処理、集約）できます。

## セマンティック規約 {#semantic-conventions}

ウェブフレームワーク、RPCクライアント、データベース、メッセージングクライアント、インフラなどをカバーする利用可能な[セマンティック規約](/docs/specs/semconv/general/trace/)をチェックしてください！

もしあなたのライブラリがそのようなものであるなら、規約にしたがってください。
規約は主要な情報源であり、どの情報がスパンに含まれるべきかを教えてくれます。
規約は、計装に一貫性を持たせます。テレメトリーに携わるユーザーは、ライブラリの仕様を学ぶ必要がありませんし、オブザーバビリティベンダーは、さまざまなテクノロジー（たとえば、データベースやメッセージングシステム）に対応した体験を構築できます。
ライブラリが規約にしたがえば、ユーザーの入力や設定なしで、多くのシナリオがそのまま有効になります。

セマンティック規約は常に進化しており、常に新しいものが追加されています。
もしあなたのライブラリにないものがあれば、[追加する](https://github.com/open-telemetry/semantic-conventions/issues)ことを検討してください。
スパン名には特に注意してください。
意味のある名前を使うように努め、定義する際にはカーディナリティを考慮してください。

[`schema_url`]（/docs/specs/otel/schemas/#schema-url）属性があり、どのバージョンのセマンティック規約が使用されているかを記録できます。
可能であれば、この属性を設定してください。

何かフィードバックがあったり、新しい規約を追加したい場合は、ぜひ貢献してください！
CNCFのOpenTelemetryに関する[計装チャンネル（ `#otel-instrumentation` ）](https://cloud-native.slack.com/archives/C01QZFGMLQ7)や[仕様のレポジトリ](https://github.com/open-telemetry/opentelemetry-specification)から始めるとよいでしょう！

### スパンの定義 {#defining-spans}

ライブラリの利用者の視点からライブラリのことを考え、利用者がライブラリの動作やアクティビティについて何を知りたいと思うかを考えてみてください。
ライブラリのメンテナーであるあなたは内部構造を知っていますが、ユーザーはライブラリの内部構造にはあまり興味を持たず、自分のアプリケーションの機能に興味を持つでしょう。
ライブラリの使用状況を分析する上でどのような情報が役に立つかを考え、そのデータをモデル化する適切な方法を考えましょう。
考慮すべき点は以下の通りです。

- スパンとスパンの階層
- スパンの数値属性（集約されたメトリクスの代替として）
- スパンイベント
- 集約された指標

たとえば、ライブラリがデータベースへのリクエストを行っている場合、データベースへの論理的なリクエストに対してのみスパンを作成します。
ネットワークを介した物理的なリクエストは、その機能を実装するライブラリ内で計装する必要があります。
また、オブジェクトやデータのシリアライズのような他のアクティビティは、追加スパンとしてではなく、スパンイベントとして捕捉することをおすすめします。

スパン属性を設定するときは、セマンティック規約にしたがってください。

## 計装すべき**でない**とき {#when-not-to-instrument}

いくつかのライブラリは、ネットワーク呼び出しをラップするシンクライアントです。
OpenTelemetryに、RPCクライアント用の計装ライブラリがある可能性があります（[レジストリ](/ecosystem/registry/)をチェックしてください）。
この場合、ラッパーライブラリの計装は必要ないかもしれません。
一般的なガイドラインとして、ライブラリの計装は、そのライブラリ自身のレベルでのみ行ってください。

次のような場合は計装しないでください。

- あなたのライブラリは、ドキュメント化された、あるいは自明なAPIの上にある薄いプロキシです
- _そして_ OpenTelemetryのエコシステムに、土台となるネットワーク呼び出しの計装があります
- _そして_ テレメトリーを充実させるために、ライブラリがしたがうべき規約がありません

迷ったら、計装はやめましょう。後で必要性を感じたときにいつでもできます。

もし、計装しないことを選択した場合でも、内部のRPCクライアントインスタンスに OpenTelemetryハンドラーを設定する方法を提供することは有用でしょう。
これは、完全な自動計装をサポートしていない言語では必須ですが、その他の言語でも有用です。

この文書の残りの部分では、計装を行うことを決定した場合、何をどのように計装するのかについて手引きを示します。

## OpenTelemetry API {#opentelemetry-api}

最初のステップは、OpenTelemetry APIパッケージへ依存することです。

OpenTelemetryには[2つの主要なモジュール](/docs/specs/otel/overview/)であるAPIとSDKがあります。
OpenTelemetry API は、抽象化と動作しない実装のセットです。
アプリケーションが OpenTelemetry SDKをインポートしない限り、あなたの計装は何もせず、アプリケーションのパフォーマンスに影響を与えません。

**ライブラリはOpenTelemetry APIのみを使用すべきです。**

新しい依存関係を追加することを心配するのは当然かもしれませんが、依存地獄を最小限に抑える方法を決めるのに役立ついくつかの考慮事項を紹介しましょう。

- OpenTelemetry Trace APIは2021年初めに安定版に達しました。このAPIは[Semantic Versioning 2.0](/docs/specs/otel/versioning-and-stability/)にしがたっていて、開発チームはAPIの安定性を真剣に受け止めています。
- 依存する場合は、もっとも早い安定版の OpenTelemetry API (1.0.\*)を使用し、新機能を使用する必要がない限り、アップデートは避けてください。
- あなたの計装が安定するまでの間、それを別のパッケージとしてリリースすることを検討してください。
  あなたのレポジトリに置いておくこともできますし、[OpenTelemetryに追加](https://github.com/open-telemetry/oteps/blob/main/text/0155-external-modules.md#contrib-components) して、他の計装パッケージと一緒にリリースすることもできます。
- セマンティック規約は[安定していますが、徐々に発展しています][stable, but subject to evolution]。
  機能的な問題は発生しませんが、ときどき、計装をアップデートする必要があるかもしれません。
  プレビュープラグインか、OpenTelemetry contrib リポジトリにそれを置くことで、ユーザの変更を壊すことなく、規約を最新に保つことができるかもしれません。

  [stable, but subject to evolution]: /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### トレーサーを取得する {#getting-a-tracer}

すべてのアプリケーションの設定は、Tracer API を通してライブラリから隠蔽されます。
ライブラリは、アプリケーションに `TracerProvider` のインスタンスを渡して依存性注入とテストの容易さを促進したり、[グローバルの `TracerProvider`](/docs/specs/otel/trace/api/#get-a-tracer) から取得したりできます。
OpenTelemetry 言語の実装は、インスタンスの受け渡しやグローバルへのアクセスについて、慣用的なものに基づいて好みが異なるかもしれません。

トレーサーを入手する際、ライブラリ（またはトレーシングプラグイン）の名前とバージョンを指定してください。
これらはテレメトリーに表示され、ユーザーがテレメトリーを処理してフィルタリングし、それがどこから来たのかを理解し、計装の問題をデバッグ／報告するのに役立ちます。

## 何を計装すべきか {#what-to-instrument}

### パブリックAPI {#public-apis}

パブリックAPI呼び出し用に作成されたスパンによって、ユーザーはテレメトリーをアプリケーションコードにマッピングし、ライブラリ呼び出しの期間と結果を理解できます。
トレースすべき呼び出しは次のとおりです。

- 内部でネットワークコールを行うパブリックメソッドや、時間がかかり失敗する可能性のあるローカル操作（IOなど）
- リクエストやメッセージを処理するハンドラー

**計装の例：**

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // スパンの名前と属性に関する手引きについては、規約をチェックすること
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // スパンをアクティブにし、ログとネストスパンの関連付けを可能にする
    try (Scope unused = span.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            span.setStatus(StatusCode.OK);
        }

        if (span.isRecording()) {
           // レスポンスコードやその他の情報をレスポンス属性に入力する
        }
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        span.end();
    }
}
```

属性を入力するための規約に従ってください！
該当するものがない場合は、[一般的な規約](/docs/specs/semconv/general/attributes/)をチェックしてください。

### ネストされたネットワークとその他のスパン {#nested-network-and-other-spans}

ネットワーク呼び出しは通常、対応するクライアントの実装を通して、OpenTelemetry 自動計装でトレースされます。

![JaegerのUIでのネストされたデータベースとHTTPスパン](../nested-spans.svg)

OpenTelemetryがネットワーククライアントのトレースをサポートしていない場合、最善の判断をしてください。

- ネットワーク呼び出しをトレースすることで、ユーザーやあなたのサポート能力が向上するでしょうか
- あなたのライブラリは、公開され、ドキュメント化されたRPC API上のラッパーですか。問題が発生した場合、ユーザーは基礎となるサービスからサポートを受ける必要がありますか。
  - ライブラリーを計装し、個々のネットワークトライをトレースしましょう。
- スパンを使ってこれらの呼び出しをトレースすると、非常に冗長になりますか、それともパフォーマンスに顕著な影響を与えますか。
  - 冗長性やスパンイベントにはログを使いましょう。ログは親（パブリックAPIコール）に関連付けられ、スパンイベントはパブリックAPIスパンに設定されるべきです。
  - スパンである必要がある場合（ユニークなトレースコンテキストを伝送し、伝播するため）、設定オプションで指定するようにさせ、デフォルトでは無効にしましょう。

OpenTelemetryがすでにネットワーク呼び出しのトレースをサポートしているのであれば、おそらく、それを複製する必要はないでしょう。
以下のように例外もあります。

- 自動計装を使用しないユーザーをサポートする場合（環境によっては機能しない場合や、ユーザーがモンキーパッチに懸念を持つ場合がある）
- 基礎となるサービスとのカスタム（レガシー）相関およびコンテキスト伝播プロトコルを有効にする場合
- 自動計装ではカバーされない、絶対に必要なライブラリ／サービス固有の情報でRPCスパンを充実させる場合

警告：重複を避けるための一般的なソリューションは現在作成中です 🚧

### イベント {#events}

トレースは、アプリが発するシグナルの一種です。
イベント（またはログ）とトレースは、互いに補完し合うものであり、重複するものではありません。
冗長性を持たせる必要がある場合は、トレースよりもログの方が適しています。

あなたのアプリは、すでにロギングか、似たようなモジュールを使っている可能性があります。
あなたのモジュールは、すでに OpenTelemetry と統合されているかもしれません。それを調べるには、[レジストリ](/ecosystem/registry/) を参照してください。
統合は通常、すべてのログにアクティブなトレースコンテキストを埋め込むことで、ユーザがそれらを関連付けられるようになります。

あなたの言語とエコシステムが共通のロギングサポートを持っていない場合、[スパンイベント][span events]を使って追加のアプリの詳細を共有します。
属性も追加したい場合は、イベントの方が便利かもしれません。

経験則として、詳細データにはスパンではなくイベントまたはログを使用しましょう。
常に、計装が作成したスパンインスタンスにイベントを添付してください。
アクティブスパンの使用は、それが何を参照しているのか制御できないため、できる限り避けてください。

## コンテキスト伝搬 {#context-propagation}

### コンテキストの抽出 {#extracting-context}

もしあなたがライブラリやサービス、たとえばウェブフレームワークやメッセージングコンシューマーなどの上流の呼び出しを受信するような仕事をしているなら、受信するリクエスト／メッセージからコンテキストを抽出する必要があります。
OpenTelemetryは `Propagator` APIを提供していて、これは特定の伝播基準を隠して、トレースされた `Context` をワイヤーから読み取ります。
単一のレスポンスの場合、ワイヤー上のコンテキストは1つだけです。これはライブラリが作成する新しいスパンの親になります。

スパンを作成した後、スパンをアクティブにすることで、新しいトレースコンテキストをアプリケーションコード（コールバックまたはハンドラー）に渡す必要があります。

```java
// コンテキストを抽出する
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
Span span = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// スパンをアクティブにし、ネストされたテレメトリーが相関するようにする
try (Scope unused = span.makeCurrent()) {
  userCode();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

ここに[Java でのコンテキスト抽出の例](/docs/languages/java/instrumentation/#context-propagation) の完全なものがあります。

メッセージングシステムの場合、一度に複数のメッセージを受け取ることがあります。
受信したメッセージは、作成したスパンの[_リンク_](/docs/languages/java/instrumentation/#create-spans-with-links)になります。
詳しくは[メッセージング規約](/docs/specs/semconv/messaging/messaging-spans/)を参照してください（警告：メッセージング規約は[策定中](https://github.com/open-telemetry/oteps/pull/173) 🚧 です）。

### コンテキストを注入する {#injecting-context}

外部呼び出しを行う場合、通常はコンテキストを下流のサービスに伝搬させたくなります。
この場合、外部呼び出しをトレースする新しいスパンを作成し、`Propagator` API を使ってメッセージにコンテキストを注入します。
非同期処理用のメッセージを作成する場合など、コンテキストを注入したいケースは他にもあるかもしれません。

```java
Span span = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// スパンをアクティブにすることで、ネスト化されたテレメトリを相関させる
// ネットワークコールでも、スパン、ログ、イベントのネスト化されたレイヤーがあるかもしれない
try (Scope unused = span.makeCurrent()) {
  // コンテキストを注入
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

[Javaにおけるコンテキスト注入の例](/docs/languages/java/instrumentation/#context-propagation)の全体はこちらを参照してください。

下記のように例外もあるかもしれません。

- 下流のサービスはメタデータをサポートしていないか、未知のフィールドを禁止している
- 下流のサービスが相関プロトコルを定義していない。将来のサービスのバージョンで、互換性のあるコンテキスト伝播がサポートされる可能性はありますか。ないなら入れましょう！
- 下流のサービスは、カスタム相関プロトコルをサポートしている
  - カスタムプロパゲーターでベストエフォートで対応している。互換性があればOpenTelemetryトレースコンテキストを使いましょう。
  - あるいはスパンにカスタム相関IDを生成して埋め込みましょう。

### プロセス内 {#in-process}

- **スパンをアクティブにする**（別名カレント）。スパンをログやネストされた自動計装と関連付けられます。
- ライブラリーにコンテキストの概念がある場合、アクティブスパンに加えて、**オプションで**明示的なトレースコンテキストの伝搬をサポートしましょう。
  - ライブラリが作成したスパン（トレースコンテキスト）を明示的にコンテキストに置き、そのアクセス方法をドキュメント化しましょう。
  - ユーザーが自分のコンテキストにトレースコンテキストを渡せるようにしましょう。
- ライブラリ内で、トレースコンテキストを明示的に伝播させましょう。コールバック中にアクティブなスパンが変更される可能性があります！
  - パブリックAPIの上のユーザーからアクティブなコンテキストをできるだけ早く取得し、それをスパンの親コンテキストとして使用します。
  - コンテキストを受け渡し、明示的に伝播されたインスタンスに属性、例外、イベントを埋め込みます。
  - これは、スレッドを明示的に開始したり、バックグラウンド処理を行ったり、その他、使用する言語の非同期コンテキストフローの制限によって壊れる可能性がある場合に不可欠です。

## その他 {#misc}

### 計装レジストリ {#instrumentation-registry}

[OpenTelemetryレジストリ](/ecosystem/registry/)にあなたの計装ライブラリを追加してください。

### パフォーマンス {#performance}

OpenTelemetryのAPIは、アプリケーションにSDKがない場合、no-opで、非常にパフォーマンスが良いです。
OpenTelemetry SDK が設定されると、[バインドされたリソースを消費します](/docs/specs/otel/performance/)。

実際のアプリケーション、特に大規模なものでは、ヘッドベースのサンプリングが頻繁に設定されます。
サンプリングアウトされたスパンは安価であり、属性の入力中に余分な割り当てや高価な計算を避けるために、スパンが記録されているかどうかをチェックできます。

```java
// サンプリングに重要な属性がある場合は、作成時に提供する必要がある
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// スパンが記録される場合は、他の属性、特に計算コストのかかる属性を追加する必要がある
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### エラーハンドリング {#error-handling}

OpenTelemetry APIは、[実行時に寛容です](/docs/specs/otel/error-handling/#basic-error-handling-principles)。
無効な引数では失敗せず、決して例外をスローせずに飲み込みます。
このようにして、計装の問題がアプリケーションロジックに影響を与えないようにします。
OpenTelemetry が実行時に隠す問題に気づくために、計装をテストしてください。

### テスト {#testing}

OpenTelemetry にはさまざまな自動計装があるので、あなたの計装が他のテレメトリー（受信リクエスト、送信リクエスト、ログなど）とどのように相互作用するかを試してみるのは便利です。
計装を試すときは、一般的なフレームワークとライブラリを使い、すべてのトレースを有効にした典型的なアプリケーションを使ってください。
あなたのライブラリと似たライブラリがどのように表示されるかをチェックしてください。

ユニットテストでは、通常、`SpanProcessor`と`SpanExporter`をモックまたはフェイクできます。

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // テストを実行...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    exportedSpans.addAll(spans);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[instrumentation libraries]: /docs/specs/otel/overview/#instrumentation-libraries
[span events]: /docs/specs/otel/trace/api/#add-events
