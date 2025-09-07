---
title: コレクターのホスティングに関するベストプラクティス
linkTitle: コレクターのホスティング
weight: 115
default_lang_commit: d96ef10c0bf452f6e01b9d9b596355693638e0d9
---

OpenTelemetry (OTel)コレクターのホスティングをセットアップする際には、ホストするインスタンスのセキュリティを強化するために以下のベストプラクティスを検討してください。

## データを安全に保存する {#store-data-securely}

コレクターの設定ファイルには、認証トークンやTLS証明書などの機密データが含まれている場合があります。
[設定のセキュリティ保護](../config-best-practices/#create-secure-configurations)のベストプラクティスを参照してください。

処理のためにテレメトリーを保存している場合は、生データの改ざんを防ぐために、それらのディレクトリへのアクセスを制限してください。

## 秘密情報を安全に保つ {#keep-your-secrets-safe}

Kubernetesの[シークレット](https://kubernetes.io/docs/concepts/configuration/secret/)は、機密データを保持する認証情報です。
それらは特権アクセスを認証および認可します。
コレクターでKubernetesのデプロイメントを使用している場合は、[推奨されるベストプラクティス](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)に従って、クラスターのセキュリティを強化してください。

## 最小権限の原則を適用する {#apply-the-principle-of-least-privilege}

コレクターは、収集しているデータが特権のある場所にある場合を除き、特権アクセスを必要としません。
たとえば、Kubernetesのデプロイメントでは、システムログ、アプリケーションログ、コンテナランタイムログはアクセスに特別な権限が必要なノードボリュームに保存されていることがよくあります。
コレクターがノードでデーモンセットとして実行されている場合、これらのログにアクセスするために必要な特定のボリュームマウントの権限のみを付与し、それ以上の権限は付与しないでください。
特権アクセスは、ロールベースのアクセス制御(RBAC)で構成できます。
詳しくは[RBACのベストプラクティス](https://kubernetes.io/docs/concepts/security/rbac-good-practices/)を参照してください。

## サーバーのようなコンポーネントへのアクセスを制御する {#control-access-to-server-like-components}

コレクターの一部のコンポーネント(レシーバーやエクスポーター)などは、サーバーのように機能します。
認可されたユーザーのみがアクセスできるようにするには、次のことが必要です。

- たとえば、Bearerトークン認証拡張機能やBasic認証拡張機能を使用して認証を有効にします。
- コレクターが実行されるIPを制限します。

## リソース使用量を保護する {#safeguard-resource-utilization}

コレクター自身の[内部テレメトリー](/docs/collector/internal-telemetry/)を使用して、そのパフォーマンスを監視します。
コレクターからCPU、メモリ、スループットの使用状況に関するメトリクスを収集し、リソース枯渇のアラートを設定します。

リソース上限に達した場合は、負荷分散された構成で複数のインスタンスをデプロイし[コレクターの水平スケーリング](/docs/collector/scaling/)を検討してください。
コレクターをスケールすることで、リソースの需要が分散されボトルネックを回避します。

デプロイメント内のリソース使用量を保護したら、コレクターインスタンスでも[設定での保護](../config-best-practices/#safeguard-resource-utilization)を使用していることを確認してください。
