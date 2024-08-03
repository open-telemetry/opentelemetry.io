---
title: Introdução à Observabilidade
description: Conceitos básicos de Observabilidade
weight: 9
cSpell:ignore: webshop
default_lang_commit: 6e3124135e38e749cdda15271d891813d6bc43db
---

## O que é Observabilidade? 

Observabilidade permite que você compreenda um sistema por fora para dentro, permitindo que você faça perguntas sobre ele sem precisar conhecer seu funcionamento interno. Além disso, facilita a resolução de problemas e o tratamento de novos problemas, ou seja, "desconhecidos desconhecido". Também ajuda a responder à pergunta "Por que isso está acontecendo?"

Para fazer essas perguntas sobre o seu sistema, sua aplicação deve estar devidamente instrumentada. Ou seja, o código da aplicação deve emitir [sinais](/docs/concepts/signals/) como [rastros](/docs/concepts/signals/traces/), [métricas](/docs/concepts/signals/metrics/) e [logs](/docs/concepts/signals/logs/). Uma aplicação está devidamente instrumentada quando os desenvolvedores não precisam adicionar mais instrumentação para solucionar um problema, pois já tem todas as informações necessárias.

[OpenTelemetry](/docs/what-is-opentelemetry/) é o mecanismo pelo qual o código da aplicação é instrumentado para ajudar a tornar um sistema observável.

## Confiabilidade e métricas

**Telemetria** refere-se aos dados emitidos por um sistema e seu comportamento. Esses dados podem vir na forma de [rastros](/docs/concepts/signals/traces/), [métricas](/docs/concepts/signals/metrics/) e [logs](/docs/concepts/signals/logs/).

**Confiabilidade** responde à perguntas: "O serviço está fazendo o que os usuários esperam que ele faça?" Um sistema pode estar ativo 100% do tempo, mas se, quando um usuário clica em "Adicionar ao Carrinho" para adicionar um par de sapatos pretos ao carrinho de compras, o sistema nem sempre adiciona sapatos pretos, então o sistema pode ser **não** confiável.

**Métricas** são agregações, ao longo de um período de tempo, de dados numéricos sobre sua infraestrutura ou aplicação. Exemplos incluem: taxa de erro do sistema, utilização da CPU e taxa de requisições para um determinado serviço. Para mais informações sobre métricas e como elas se relacionam com o OpenTelemetry, consulte [Métricas](/docs/concepts/signals/metrics/).

**SLI**, ou _Indicador de Nível de Serviço_, representa uma medida do comportamento de um serviço. Um bom SLI mede seu serviço do ponto de vista dos seus usuários. Um exemplo de SLI pode ser a velocidade de carregamento de uma página web.

**SLO**, ou _Objetivo de Nível de Serviço_, representa a forma como a confiabilidade é comunicada para uma organização/outras equipes. Isso é feito associando um ou mais SLIs ao valor de negócio.

## Compreendendo rastreamento distribuído

O rastreamento distribuído permite que você observe as requisições que se propagam por sistemas complexos e distribuídos. O rastreamento distribuído melhora a visibilidade da saúde da sua aplicação ou sistema, permitindo que você faça depurações de comportamentos difíceis de reproduzir localmente. É essencial para sistemas distribuídos, que comumente têm problemas não determinísticos ou são muito complicados para reproduzir localmente.

Para entender o rastreamento distribuído, você precisa compreender o papel de cada um de seus componentes: logs, spans e rastros.


