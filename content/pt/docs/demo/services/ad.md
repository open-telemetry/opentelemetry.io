---
title: Serviço de Anúncios
linkTitle: Anúncios
aliases: [adservice]
---

Este serviço determina anúncios apropriados para servir aos usuários baseado em chaves de contexto.
Os anúncios serão para produtos disponíveis na loja.

[Código fonte do serviço de anúncios](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## Auto-instrumentação

Este serviço depende do agente Java do OpenTelemetry para instrumentar automaticamente
bibliotecas como gRPC e configurar o SDK do OpenTelemetry. O agente é
passado para o processo usando o argumento de linha de comando `-javaagent`. Argumentos de
linha de comando são adicionados através do `JAVA_TOOL_OPTIONS` no `Dockerfile`,
e utilizados durante o script de inicialização do Gradle gerado automaticamente.

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## Rastreamentos

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```java
Span span = Span.current();
```

Adicionar atributos a um span é realizado usando `setAttribute` no objeto
span. Na função `getAds` múltiplos atributos são adicionados ao span.

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### Adicionar eventos de span

Adicionar um evento a um span é realizado usando `addEvent` no objeto span.
Na função `getAds` um evento com um atributo é adicionado quando uma exceção
é capturada.

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### Definir status do span

Se o resultado da operação é um erro, o status do span deve ser definido
adequadamente usando `setStatus` no objeto span. Na função `getAds` o
status do span é definido quando uma exceção é capturada.

```java
span.setStatus(StatusCode.ERROR);
```

### Criar novos spans

Novos spans podem ser criados e iniciados usando
`Tracer.spanBuilder("spanName").startSpan()`. Spans recém-criados devem ser definidos
no contexto usando `Span.makeCurrent()`. A função `getRandomAds` criará
um novo span, defini-lo no contexto, executar uma operação e finalmente encerrar o span.

```java
// criar e iniciar um novo span manualmente
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// colocar o span no contexto, para que se qualquer span filho for iniciado o pai será definido adequadamente
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## Métricas

### Inicializando Métricas

Similar a criar spans, o primeiro passo na criação de métricas é inicializar uma
instância `Meter`, ex. `GlobalOpenTelemetry.getMeter("ad")`. A partir daí, use os
vários métodos builder disponíveis na instância `Meter` para criar o
instrumento de métrica desejado, ex.:

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Counts ad requests by request and response type")
  .build();
```

### Métricas Atuais Produzidas

Note que todos os nomes de métricas abaixo aparecem no Prometheus/Grafana com caracteres `.`
transformados em `_`.

#### Métricas personalizadas

As seguintes métricas personalizadas estão atualmente disponíveis:

- `app.ads.ad_requests`: Um contador de requisições de anúncios com dimensões descrevendo
  se a requisição foi direcionada com chaves de contexto ou não, e se a
  resposta foi anúncios direcionados ou aleatórios.

#### Métricas auto-instrumentadas

As seguintes métricas auto-instrumentadas estão disponíveis para a aplicação:

- [Métricas de runtime para a JVM](/docs/specs/semconv/runtime/jvm-metrics/).
- [Métricas de latência para RPCs](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## Logs

O Serviço de Anúncios usa Log4J, que é automaticamente configurado pelo agente OTel Java.

Ele inclui o contexto de rastreamento nos registros de log, permitindo correlação de log com
rastreamentos.
