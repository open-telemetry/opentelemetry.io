---
title: Bagagem
weight: 4
description: Informações contextuais que são passadas entre sinais
---
No OpenTelemetry, bagagem é uma informação adicional associada ao contexto.
Bagagem é uma loja de chave-valor, o que significa que permite que você context. 
[propague](/docs/concepts/context-propagation/#propagation) qualquer dado que você
goste ao lado[contexto](/docs/concepts/context-propagation/#context).
Bagagem significa que você pode passar dados entre serviços e processos,
tornando-os disponíveis para adicionar[traços](/docs/concepts/signals/traces/),
[metricas](/docs/concepts/signals/metrics/), or
[logs](/docs/concepts/signals/logs/) nesses serviços.

## Example

Bagagem é frequentemente usada no rastreamento para propagar dados adicionais
entre serviços.

Por exemplo, imagine que você tem um `clientId` no início de uma solicitação,
mas, você gostaria que esse ID estivesse disponível em todos os trechos em um
rastreamento, algumas métricas em outro serviço, e alguns logs ao longo do caminho.
Porque os rastros podem ter vários trechos em multiplos serviços, você precisa de 
algumas maneiras para propagar esses dados sem copiar o `clientId` em muitos lugares
na sua base de código.

Ao usar.
[Contexto Propagação](/docs/concepts/signals/traces/#context-propagation) para
passar bagagem através destes serviços, o `clientId` está disponível para adicionar
a qualquer trecho, métricas ou logs. Além disso, as instrumentações propagam
automaticamente a bagagem para você.

![OTel Bagagem](/img/otel-baggage.svg)

## Para que deve ser usada a bagagem Otel?


Baggage is best used to include information typically available only at the
start of a request further downstream. This can include things like Account
Identification, User IDs, Product IDs, and origin IPs, for example.

Propagating this information using baggage allows for deeper analysis of
telemetry in a backend. For example, if you include information like a User ID
on a span that tracks a database call, you can much more easily answer questions
like "which users are experiencing the slowest database calls?" You can also log
information about a downstream operation and include that same User ID in the
log data.

![OTel Baggage](/img/otel-baggage-2.svg)

## Baggage security considerations

Sensitive Baggage items can be shared with unintended resources, like
third-party APIs. This is because automatic instrumentation includes Baggage in
most of your service’s network requests. Specifically, Baggage and other parts
of trace context are sent in HTTP headers, making it visible to anyone
inspecting your network traffic. If traffic is restricted within your network,
then this risk may not apply, but keep in mind that downstream services could
propagate Baggage outside your network.

Also, there are no built-in integrity checks to ensure that Baggage items are
yours, so exercise caution when reading them.

## Baggage is not the same as attributes

An important thing to note about baggage is that it is a separate key-value
store and is unassociated with attributes on spans, metrics, or logs without
explicitly adding them.

To add baggage entries to attributes, you need to explicitly read the data from
baggage and add it as attributes to your spans, metrics, or logs.

Because a common use cases for Baggage is to add data to
[Span Attributes](/docs/concepts/signals/traces/#attributes) across a whole
trace, several languages have Baggage Span Processors that add data from baggage
as attributes on span creation.

> For more information, see the [baggage specification][].

[baggage specification]: /docs/specs/otel/overview/#baggage-signal
