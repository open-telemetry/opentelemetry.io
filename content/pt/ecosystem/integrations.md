---
title: Integrações
description:
  Bibliotecas, serviços e aplicações com suporte nativo para o OpenTelemetry.
aliases: [/integrations]
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

A missão do OpenTelemetry é
[possibilitar uma observabilidade eficaz, tornando a telemetria de alta qualidade algo portátil e ubíquo](/community/mission/).
Em outras palavras, a observabilidade deve estar integrada ao software que você
desenvolve.

Embora a instrumentação externa por meio de
[soluções de instrumentação sem código](/docs/concepts/instrumentation/zero-code)
e
[bibliotecas de instrumentação](/docs/specs/otel/overview/#instrumentation-libraries)
ofereça uma maneira conveniente de tornar sua aplicação observável, acreditamos
que, no final, todas as aplicações devem integrar diretamente as APIs e SDKs do
OpenTelemetry para telemetria nativa ou fornecer um plugin nativo que se encaixe
no ecossistema do software em questão.

Esta página contém um exemplo de bibliotecas, serviços e aplicações que oferecem
instrumentação nativa ou plugins de primeira classe.

## Bibliotecas {#libraries}

A instrumentação nativa de bibliotecas com OpenTelemetry oferece melhor
observabilidade e experiência para os desenvolvedores, eliminando a necessidade
de as bibliotecas exporem e documentarem _hooks_. Abaixo, você encontrará uma
lista de bibliotecas que utilizam a API do OpenTelemetry para fornecer
observabilidade pronta para uso.

{{% ecosystem/integrations-table "native libraries" %}}

## Aplicações e Serviços {#applications-and-services}

A lista a seguir contém um exemplo de bibliotecas, serviços e aplicativos que
integraram diretamente as APIs e SDKs do OpenTelemetry para telemetria nativa ou
fornecem um plugin nativo que se encaixa em seu próprio ecossistema de
extensibilidade.

Projetos de código aberto (OSS) aparecem no início da lista, seguidos por
projetos comerciais. Projetos uqe fazem parte da [CNCF](https://www.cncf.io/)
possuem o logotipo da CNCF ao lado de seus nomes.

{{% ecosystem/integrations-table "application integrations" %}}

## Adicionando sua integração {#how-to-add}

Para que sua biblioteca, serviço ou aplicativo seja listado, [envie um PR] com
uma entrada adicionada ao [registro](/ecosystem/registry/adding). A entrada deve
incluir o seguinte:

- Link para a página principal de sua biblioteca, serviço ou aplicação
- Link para a documentação que explica como habilitar a observabilidade
  utilizando o OpenTelemetry

{{% alert title="Nota" %}}

Caso você forneça integração externa do OpenTelemetry para qualquer tipo de
biblioteca, serviço ou aplicação,
[considere adicioná-la ao registro](/ecosystem/registry/adding).

Se você adota o OpenTelemetry para Observabilidade como um usuário final e não
fornece nenhum tipo de serviço relacionado ao OpenTelemetry, consulte
[Adotantes](/ecosystem/adopters).

Se você oferece uma solução que consome o OpenTelemetry para fornecer
observabilidade aos usuários finais, consulte
[Fornecedores](/ecosystem/vendors).

{{% /alert %}}

[envie um PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md integrações %}}
