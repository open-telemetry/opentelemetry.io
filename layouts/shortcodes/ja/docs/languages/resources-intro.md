{{/*
default_lang_commit: 1f992fb2 # patched
*/ -}}

{{ $processWord := .Get 0 | default "プロセス"  -}}
{{ $resourceHRef := "/docs/concepts/resources/" -}}
{{ if eq .Page.RelPermalink $resourceHRef -}}
  {{ $resourceHRef = "/docs/specs/otel/resource/sdk/" -}}
{{ end -}}

[リソース]({{ $resourceHRef }})は、リソース属性としてテレメトリーを生成するエンティティを表します。たとえば、Kubernetes上のコンテナで実行されているテレメトリーを生成する{{ $processWord }}は、{{ $processWord }}名、ポッド名、ネームスペース、および場合によってはデプロイメント名を持ちます。これらの4つの属性すべてをリソースに含まれることができます。

オブザーバビリティバックエンドでは、リソース情報を使用して興味深い動作をより詳細に調査できます。たとえば、トレースまたはメトリクスデータがシステムのレイテンシーを示している場合、それを特定のコンテナ、ポッド、またはKubernetesデプロイメントに絞り込むことができます。
