---
title: セキュリティ
cascade:
  collector_vers: 0.137.0
weight: 970
default_lang_commit: 68e94a4555606e74c27182b79789d46faf84ec25
drifted_from_default: true
---

このセクションでは、OpenTelemetryプロジェクトがどのように脆弱性を公開し、インシデントに対応しているかを学び、あなたがテレメトリーを安全に収集し、送信するために何ができるかを知ることができます。

## 共通脆弱性識別子(CVEs) {#common-vulnerabilities-and-exposures-cves}

全リポジトリのCVEsについては[共通脆弱性識別子(CVEs)](cve/)を参照してください。

## インシデントレスポンス {#incident-response}

脆弱性の報告やインシデントの対応方法については、[コミュニティのインシデント対応ガイドライン](security-response/)を参照してください。

## コレクターのセキュリティ {#collector-security}

OpenTelemetryコレクターをセットアップする際には、管理するインフラとコレクターの設定の両方において、セキュリティのベストプラクティスの実装を検討してください。
安全なコレクターの実行は以下のように役に立ちます。

- 個人を特定できる情報（PII）、アプリケーション固有のデータ、またはネットワークトラフィックパターンなどの機密情報について、本来含まれているべきではないが、含まれる可能性があるテレメトリーを保護する。
- テレメトリーの信頼性を低下させ、インシデントへの対応を混乱させるデータの改ざんを防止する。
- データプライバシーおよびセキュリティに関する規制を遵守する。
- DoS攻撃から防御する。

コレクターのインフラをどのように保護する方法については、[ホストのベストプラクティス](hosting-best-practices/)を参照してください。

コレクターのセキュアな設定方法については、[設定のベストプラクティス](config-best-practices/)を参照してください。

コレクターのコンポーネントの開発者は、[セキュリティ上のベストプラクティス](https://github.com/open-telemetry/opentelemetry-collector/blob/main/docs/security-best-practices.md)を参照してください。
