---
title: Serviço de Cotação
linkTitle: Cotação
aliases: [quoteservice]
cSpell:ignore: getquote
---

Este serviço é responsável por calcular custos de envio, baseado no número
de itens a serem enviados. O serviço de cotação é chamado do Serviço de Envio via
HTTP.

O Serviço de Cotação é implementado usando o framework Slim e php-di para
gerenciar a Injeção de Dependência.

A instrumentação PHP pode variar ao usar um framework diferente.

[Código fonte do serviço de cotação](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/quote/)

## Rastreamentos

### Inicializando Rastreamento

Neste demo, o SDK do OpenTelemetry foi automaticamente criado como parte do
carregamento automático do SDK, que acontece como parte do carregamento automático do composer.

Isso é habilitado definindo a variável de ambiente
`OTEL_PHP_AUTOLOAD_ENABLED=true`.

```php
require __DIR__ . '/../vendor/autoload.php';
```

Há múltiplas maneiras de criar ou obter um `Tracer`, neste exemplo nós
obtemos um do provedor de tracer global que foi inicializado acima, como parte
do carregamento automático do SDK:

```php
$tracer = Globals::tracerProvider()->getTracer('manual-instrumentation');
```

### Criando spans manualmente

Criar um span manualmente pode ser feito via um `Tracer`. O span será por padrão
um filho do span ativo no contexto de execução atual:

```php
$span = Globals::tracerProvider()
    ->getTracer('manual-instrumentation')
    ->spanBuilder('calculate-quote')
    ->setSpanKind(SpanKind::KIND_INTERNAL)
    ->startSpan();
/* calculate quote */
$span->end();
```

### Adicionar atributos de span

Você pode obter o span atual usando `OpenTelemetry\API\Trace\Span`.

```php
$span = Span::getCurrent();
```

Adicionar atributos a um span é realizado usando `setAttribute` no objeto
span. Na função `calculateQuote` 2 atributos são adicionados ao
`childSpan`.

```php
$childSpan->setAttribute('app.quote.items.count', $numberOfItems);
$childSpan->setAttribute('app.quote.cost.total', $quote);
```

### Adicionar eventos de span

Adicionar eventos de span é realizado usando `addEvent` no objeto span. Na
rota `getquote` eventos de span são adicionados. Alguns eventos têm atributos
adicionais, outros não.

Adicionando um evento de span sem atributos:

```php
$span->addEvent('Received get quote request, processing it');
```

Adicionando um evento de span com atributos adicionais:

```php
$span->addEvent('Quote processed, response sent back', [
    'app.quote.cost.total' => $payload
]);
```

## Métricas

Neste demo, métricas são emitidas pelos processadores de trace e logs em lote. As
métricas descrevem o estado interno do processador, como número de spans ou logs exportados, o limite da fila, e uso da fila.

Você pode habilitar métricas definindo a variável de ambiente
`OTEL_PHP_INTERNAL_METRICS_ENABLED` para `true`.

Uma métrica manual também é emitida, que conta o número de cotações geradas,
incluindo um atributo para o número de itens.

Um contador é criado do Provedor de Medidor configurado globalmente, e é
incrementado cada vez que uma cotação é gerada:

```php
static $counter;
$counter ??= Globals::meterProvider()
    ->getMeter('quotes')
    ->createCounter('quotes', 'quotes', 'number of quotes calculated');
$counter->add(1, ['number_of_items' => $numberOfItems]);
```

Métricas acumulam e são exportadas periodicamente baseado no valor configurado
em `OTEL_METRIC_EXPORT_INTERVAL`.

## Logs

O serviço de cotação emite uma mensagem de log após uma cotação ser calculada. O pacote de logging
Monolog é configurado com uma
[Ponte de Logs](/docs/concepts/signals/logs/#log-appender--bridge) que converte
logs Monolog para o formato OpenTelemetry. Logs enviados para este logger serão
exportados via o logger OpenTelemetry configurado globalmente.
