---
title: Distribuições
description: >-
  Uma distribuição, que não deve ser confundida com um fork, é uma versão
  customizada de um componente do OpenTelemetry.
weight: 190
default_lang_commit: 55f9c9d07ba35c241048ffc0d756d67843d68805
---

Os projetos do OpenTelemetry consistem de múltiplos [componentes](../components)
que suportam múltiplos [sinais](../signals). As implementações de referência do
OpenTelemetry estão disponíveis em:

- [Bibliotecas de instrumentação específicas de cada linguagem de programação](../instrumentation)
- Um [binário para o Collector](/docs/concepts/components/#collector)

Qualquer implementação de referência pode ser customizada como uma distribuição.

## O que é uma distribuição? {#what-is-a-distribution}

Uma distribuição é uma versão customizada de um componente do OpenTelemetry. Uma
distribuição é um encapsulamento em torno de um repositório do OpenTelemetry com
algumas customizações. Distribuições não devem ser confundidas com _forks_.

As customizações em uma distribuição podem incluir:

- Scripts para facilitar ou customizar o uso de um _backend_ ou fornecedor
  específico
- Alterações nas configurações padrão que são necessárias para um _backend_,
  fornecedor ou usuário final
- Pacotes ou bibliotecas adicionais que podem ser específicas para determinado
  fornecedor ou usuário final
- Cobertura adicional de testes, performance e segurança além do fornecido pelo
  OpenTelemetry
- Funcionalidades adicionais além do que já é fornecido pelo OpenTelemetry
- Remoção de funcionalidades fornecidas pelo OpenTelemetry

As distribuições geralmente se enquadram nas seguintes categorias:

- **"Pura":** Estas distribuições fornecem as mesmas funcionalidades da versão
  pública e são 100% compatíveis. As customizações normalmente aprimoram a
  facilidade de uso ou configurações. Estas customizações podem ser específicas
  para _backends_, fornecedores ou usuários finais.
- **"Plus":** Estas distribuições oferecem funcionalidades adicionais ao que é
  encontrado na _upstream_, através de componentes adicionais. Exemplos incluem
  bibliotecas de instrumentação ou exportadores de fornecedores que não foram
  incluídos na _upstream_ do OpenTelemetry.
- **"Minus":** Estas distribuições fornecem um subconjunto de funcionalidades da
  upstream. Exemplos podem incluir a remoção de bibliotecas de instrumentação ou
  de receivers, processors, exporters ou extensions encontradas no projeto do
  OpenTelemetry Collector. Estas distribuições podem ser fornecidas por questão
  de suporte e/ou temas relacionados à segurança.

## Quem pode criar uma distribuição? {#who-can-create-a-distribution}

Qualquer pessoa pode criar uma distribuição. Atualmente, diversos
[fornecedores](/ecosystem/vendors/) oferecem
[distribuições](/ecosystem/distributions). Além disso, usuários finais podem
considerar criar uma distribuição caso queiram usar componentes do
[Registry](/ecosystem/registry) que não foram incluídos na _upstream_ do projeto
do OpenTelemetry.

## Contribuição ou distribuição? {#contribution-or-distribution}

Antes de continuar e aprender como criar sua própria distribuição, pergunte a si
mesmo se as suas adições a um determinado componente do OpenTelemetry seriam
benéficas para todos e, portanto, deveriam ser incluídas nas implementações de
referência:

- Os seus scripts para "facilitar o uso" podem ser generalizados?
- Suas alterações nas configurações padrão podem ser a melhor opção para todos?
- Os seus pacotes ou bibliotecas adicionais são realmente específicos?
- Sua cobertura de testes, performance ou segurança também funcionarão nas
  implementações de referência?
- Você verificou com a comunidade se as suas funcionalidades ou comportamentos
  adicionais podem se tornar parte do padrão?

## Criando a sua própria distribuição {#creating-your-own-distribution}

### Collector

Um guia sobre como criar a sua própria distribuição está disponível nesta
publicação do blog:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

Caso você esteja criando a sua própria distribuição, o
[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
pode ser um bom ponto de partida.

### Bibliotecas de instrumentação específicas para cada linguagem de programação {#language-specific-instrumentation-libraries}

Existem algumas linguagens de programação que exigem mecanismos de
extensibilidade específicos para a customização das bibliotecas de
instrumentação:

- [Java agent](/docs/zero-code/java/agent/extensions)

## Siga as diretrizes {#follow-the-guidelines}

Ao utilizar materiais relacionados ao projeto do OpenTelemetry para
distribuição, como logotipo e nome, certifique-se de estar alinhado com as
[Diretrizes de Marketing do OpenTelemetry para Organizações
Contribuintes][guidelines].

O projeto do OpenTelemetry não certifica distribuições neste momento. No futuro,
o OpenTelemetry poderá certificar distribuições e parceiros de maneira
semelhante ao que ocorre no projeto Kubernetes. Ao avaliar uma distribuição,
assegure-se de que seu uso não irá resultar em uma dependência de fornecedor
(_vendor lock-in_).

> Qualquer suporte para uma distribuição deve ser fornecido diretamente por quem
> a criou e não pelas pessoas envolvidas no projeto do OpenTelemetry.

[guidelines]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
