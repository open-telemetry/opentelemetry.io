---
default_lang_commit: 3a9247feb3e8cdfe675cc8d03d808715794d3375
---

Um [recurso]({{ $resourceHRef }}) representa a entidade que está gerando
telemetria como atributos do recurso. Por exemplo, um {{ $aResource }} que está
gerando telemetria e que está sendo executado em um _container_ no Kubernetes
tem o nome de um {{ $aResource }}, um nome de _pod_, um _namespace_ e
possivelmente um nome de _deployment_. Todos esses quatro atributos podem ser
incluídos em um recurso.

No seu _backend_ de observabilidade, você pode usar as informações de um recurso
para refinar a investigação de comportamentos relevantes. Por exemplo, se seus
dados de rastros ou métricas indicarem latência no seu sistema, você pode
restringir a investigação para um determinado _container_, _pod_ ou _deployment_
do Kubernetes.
