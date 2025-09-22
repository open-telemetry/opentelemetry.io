---
title: Serviço de Email
linkTitle: Email
aliases: [emailservice]
cSpell:ignore: sinatra
---

Este serviço enviará um email de confirmação para o usuário quando um pedido for feito.

[Código fonte do serviço de email](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/email/)

## Inicializando Rastreamento

Você precisará requerer as gems do SDK e exportador core do OpenTelemetry, bem
como qualquer gem que será necessária para bibliotecas de auto-instrumentação (ex:
Sinatra)

```ruby
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/sinatra"
```

O SDK Ruby usa variáveis de ambiente padrão do OpenTelemetry para configurar exportação OTLP,
atributos de recurso e nome do serviço automaticamente. Ao inicializar
o SDK do OpenTelemetry, você também especificará quais bibliotecas de auto-instrumentação
aproveitar (ex: Sinatra)

```ruby
OpenTelemetry::SDK.configure do |c|
  c.use "OpenTelemetry::Instrumentation::Sinatra"
end
```

## Rastreamentos

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual do
contexto.

```ruby
current_span = OpenTelemetry::Trace.current_span
```

Adicionar múltiplos atributos a um span é realizado usando `add_attributes` no
objeto span.

```ruby
current_span.add_attributes({
  "app.order.id" => data.order.order_id,
})
```

Adicionar apenas um único atributo pode ser realizado usando `set_attribute` no
objeto span.

```ruby
span.set_attribute("app.email.recipient", data.email)
```

### Criar novos spans

Novos spans podem ser criados e colocados no contexto ativo usando `in_span` de um
objeto Tracer do OpenTelemetry. Quando usado em conjunto com um bloco `do..end`,
o span será automaticamente encerrado quando o bloco terminar a execução.

```ruby
tracer = OpenTelemetry.tracer_provider.tracer('email')
tracer.in_span("send_email") do |span|
  # lógica no contexto do span aqui
end
```

## Métricas

TBD

## Logs

TBD
