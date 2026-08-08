---
title: リンクベースサンプリング
linkTitle: リンクベースサンプリング
weight: 60
default_lang_commit: f9b631a466855b3bb7ec11bb5a9d342470caa77a
---

プロデューサー・コンシューマーのようなシナリオでは、アクティビティ間の因果関係を「スパンリンク」を使って表現できます。
トレース内のアクティビティ（スパン）は、他のトレースの任意の数のアクティビティにリンクできます。
親ベースサンプラーを使用する場合、サンプリングの判断は単一のトレースレベルで行われます。
これは、リンクされたトレース間のサンプリングの判断がリンクを考慮せず独立して行われることを意味します。
その結果、システムについて推論するための情報が不完全になる可能性があります。
理想的には、リンクされたすべてのトレースをまとめてサンプリングすることが望ましいです。

これに対処する1つの方法として、この例では、リンクされたトレース間で完全なトレースを得られる可能性を高める方法を示します。

## このサンプリングの例はどのように動作するか {#how-does-this-sampling-example-work}

2つのサンプラーを組み合わせた複合サンプラーを使用します。

1. 親ベースサンプラー。
2. リンクベースサンプラー。

この複合サンプラーは、まず親ベースサンプラーに委任します。
親ベースサンプラーがサンプリングすると判断した場合、複合サンプラーもサンプリングすると判断します。
ただし、親ベースサンプラーがドロップすると判断した場合、複合サンプラーはリンクベースサンプラーに委任します。
リンクベースサンプラーは、アクティビティにリンクされたアクティビティがあり、リンクされたアクティビティのうち少なくとも1つがサンプリングされている場合にサンプリングすると判断します。

リンクベースサンプラーは確率的サンプラーではありません。
リンクされたコンテキストのいずれかがサンプリングされている場合にアクティビティをサンプリングすると判断する、偏りのあるサンプラーです。

## このオプションを検討すべき場合とトレードオフ {#when-should-you-consider-such-an-option-what-are-the-tradeoffs}

リンクされたトレース間でより完全なトレースを得たい場合、これは検討に値するオプションです。
ただし、考慮すべきトレードオフがいくつかあります。

### すべての状況で一貫したサンプリングが保証されるわけではない {#not-guaranteed-to-give-consistent-sampling-in-all-situations}

このアプローチでは、すべての状況でリンクされたトレース間の完全なトレースが得られることは保証されません。

同じプロデューサー・コンシューマーのシナリオを使って、いくつかのケースを見てみましょう。
メッセージを生成するプロデューサーアクティビティ（トレース T1 の ID が S1）と、そのメッセージを消費するコンシューマーアクティビティ（トレース T2 の ID が S2）があるとします。

まず、トレース T1 のプロデューサーアクティビティ S1 が、親ベースサンプラーの判断によりサンプリングされるケースを考えます。
トレース T2 のアクティビティ S2 は、T2 の親ベースサンプラーの判断によりサンプリングされないとします。
しかし、T2 のアクティビティ S2 は、サンプリングされているプロデューサーアクティビティ（T1 の S1）にリンクされているため、このメカニズムにより、コンシューマーアクティビティ（T2 の S2）もサンプリングされることが保証されます。

別のケースとして、トレース T1 のプロデューサーアクティビティ S1 が、親ベースサンプラーの判断によりサンプリングされない場合を考えます。
ここで、トレース T2 のコンシューマーアクティビティ S2 は、親ベースサンプラーの判断によりサンプリングされるとします。
この場合、トレース T1 のアクティビティ S1 がサンプリングされていないにもかかわらず、トレース T2 のアクティビティ S2 はサンプリングされます。
これは、このアプローチが役に立たない状況の例です。

部分的なトレースが得られる別の例として、トレース T2 のコンシューマーアクティビティ S2 がトレース T2 のルートアクティビティではない場合があります。
この場合、トレース T2 にはルートアクティビティである別のアクティビティ S3 があるとします。
アクティビティ S3 のサンプリング判断がドロップだったとします。
T2 の S2 は T1 の S1 にリンクされているため、このアプローチでは S2 はサンプリングされます（リンクされたコンテキストに基づいて）。
そのため、生成されるトレース T2 はアクティビティ S3 を含まず、アクティビティ S2 のみを含む部分的なトレースになります。

### データ量の増加につながる可能性がある {#can-lead-to-higher-volume-of-data}

このアプローチでは、リンクされたアクティビティの1つでもサンプリングされていればアクティビティをサンプリングするため、通常のヘッドベースサンプリングと比較してデータ量が増加する可能性があります。
これは、リンクされたアクティビティのサンプリング判断に基づいて非確率的なサンプリング判断を行っているためです。
たとえば、リンクされたアクティビティが20個あり、そのうち1つだけがサンプリングされていたとしても、リンク元のアクティビティはサンプリングされます。

## サンプル出力 {#sample-output}

この例を実行すると、以下のような出力が表示されます。

```text
af448bc1cb3e5be4e4b56a8b6650785c: ParentBasedSampler decision: Drop
af448bc1cb3e5be4e4b56a8b6650785c: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

1b08120fa35c3f4a37e0b6326dc7688c: ParentBasedSampler decision: Drop
1b08120fa35c3f4a37e0b6326dc7688c: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

ff710bd70baf2e8e843e7b38d1fc4cc1: ParentBasedSampler decision: RecordAndSample
Activity.TraceId:            ff710bd70baf2e8e843e7b38d1fc4cc1
Activity.SpanId:             620d9b218afbf926
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.0373932Z
Activity.Duration:           00:00:00.0022481
Activity.Tags:
    foo: bar
Activity.Links:
    f7464f714b23713c9008f8fc884fc391 7d1c96a6f2c95556
    6660db8951e10644f63cd385e7b9549e 526e615b7a70121a
    4c94df8e520b32ff25fc44e0c8063c81 8080d0aaafa641af
    70d8ba08181b5ec073ec8b5db778c41f 99ea6162257046ab
    d96954e9e76835f442f62eece3066be4 ae9332547b80f50f
Resource associated with Activity:
    service.name: unknown_service:links-sampler


68121534d69b2248c4816c0c5281f908: ParentBasedSampler decision: Drop
68121534d69b2248c4816c0c5281f908: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

5042f2c52a08143f5f42be3818eb41fa: ParentBasedSampler decision: Drop
5042f2c52a08143f5f42be3818eb41fa: At least one linked activity
(TraceID: 5c1185c94f56ebe3c2ccb4b9880afb17, SpanID: 1f77abf0bded4ab9) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            5042f2c52a08143f5f42be3818eb41fa
Activity.SpanId:             0f8a9bfa9d7770e6
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.0806081Z
Activity.Duration:           00:00:00.0018874
Activity.Tags:
    foo: bar
Activity.Links:
    ed77487f4a646399aea5effc818d8bfa fcdde951f29a13e0
    f79860fdfb949f2c1f1698d1ed8036b9 e422cb771057bf7c
    6326338d0c0cf3afe7c5946d648b94dc affc7a6c013ea273
    c0750a9fa146062083b55227ac965ad4 b09d59ed3129779d
    5c1185c94f56ebe3c2ccb4b9880afb17 1f77abf0bded4ab9
Resource associated with Activity:
    service.name: unknown_service:links-sampler


568a2b9489c58e7a5a769d264a9ddf28: ParentBasedSampler decision: Drop
568a2b9489c58e7a5a769d264a9ddf28: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

4f8d972b0d7727821ce4a307a7be8e8f: ParentBasedSampler decision: Drop
4f8d972b0d7727821ce4a307a7be8e8f: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

ce940241ed33e1a030da3e9d201101d3: ParentBasedSampler decision: Drop
ce940241ed33e1a030da3e9d201101d3: At least one linked activity
(TraceID: ba0d91887309399029719e2a71a12f62, SpanID: 61aafe295913080f) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            ce940241ed33e1a030da3e9d201101d3
Activity.SpanId:             5cf3d63926ce4fd5
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.1127688Z
Activity.Duration:           00:00:00.0021072
Activity.Tags:
    foo: bar
Activity.Links:
    5223cff39311c741ef50aca58e4270c3 e401b6840acebf43
    398b43fee8a75b068cdd11018ef528b0 24cfa4d5fb310b9d
    34351a0f492d65ef92ca0db3238f5146 5c0a56a16291d765
    ba0d91887309399029719e2a71a12f62 61aafe295913080f
    de18a8af2d20972cd4f9439fcd51e909 4c40bc6037e58bf9
Resource associated with Activity:
    service.name: unknown_service:links-sampler


ac46618da4495897bacd7d399e6fc6d8: ParentBasedSampler decision: Drop
ac46618da4495897bacd7d399e6fc6d8: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

68a3a05e0348d2a2c1c3db34bc3fd2f5: ParentBasedSampler decision: Drop
68a3a05e0348d2a2c1c3db34bc3fd2f5: At least one linked activity
(TraceID: 87773d89fba942b0109d6ce0876bb67e, SpanID: 2aaac98d4e48c261) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            68a3a05e0348d2a2c1c3db34bc3fd2f5
Activity.SpanId:             3d0222f56b0e1e5d
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.1553354Z
Activity.Duration:           00:00:00.0049821
Activity.Tags:
    foo: bar
Activity.Links:
    7175fbd18da2783dc594d1e8f3260c74 13019d9a06a5505b
    59c9bdd52eb5cf23eae9001006743fcf 25573e0f1b290b8d
    87773d89fba942b0109d6ce0876bb67e 2aaac98d4e48c261
    0a1f65c47f556336b4028b515d363810 0816a2a2b7d4ea0b
    7602375d3eae7e849a9dc27e858dc1c2 b918787b895b1374
Resource associated with Activity:
    service.name: unknown_service:links-sampler
```
