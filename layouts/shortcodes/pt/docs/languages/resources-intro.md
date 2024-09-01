{{/*
default_lang_commit: a1740fd934e595f1396f2eb82a58a80824369b09
*/ -}}

<!-- prettier-ignore -->
{{ $processWord := .Get 0 | default "processo"  -}}
{{ $resourceHRef := "/docs/concepts/resources/" -}}
{{ if eq .Page.RelPermalink $resourceHRef -}}
  {{ $resourceHRef = "/docs/specs/otel/resource/sdk/" -}}
{{ end -}}

Um [resource]({{ $resourceHRef }}) representa a entidade que está gerando telemetria como _resource attributes_. Por exemplo, um {{ $processWord }} que está gerando telemetria e que está sendo executado em um _container_ no Kubernetes tem o nome de um {{ $processWord }}, um nome de _pod_, um _namespace_ e possivelmente um nome de _deployment_. Todos esses quatro atributos podem ser incluídos em um _resource_.

No seu backend de observabilidade, você pode usar as informações de um _resource_ para refinar a investigação de comportamentos relevantes. Por exemplo, se seus dados de rastros ou métricas indicarem latência no seu sistema, você pode restringir a investigação para um determinado _container_, _pod_ ou _deployment_ do Kubernetes.
