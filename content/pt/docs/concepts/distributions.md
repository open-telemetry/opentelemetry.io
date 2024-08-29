---
title: Distribuições
description: >-
  Uma distribuição, que não deve ser confundida com um fork, é uma versão
  customizada de um componente OpenTelemetry.
weight: 190
default_lang_commit: 2f34c456ab38b4d3502cd07bc36fa1455d4ef875
---

Os projetos OpenTelemetry consistem em múltiplos [componentes](../components)
que suportam múltiplos [sinais](../signals). As implementações de referência do
OpenTelemetry estão disponíveis em:

- [Bibliotecas de instrumentação específicas para linguagens de programação](../instrumentation)
- Um [Coletor binário](/docs/concepts/components/#collector)

Qualquer implementação de referência pode ser personalizada como uma
distribuição.

## O que é uma distribuição? {#what-is-a-distribution}

Uma distribuição é uma versão personalizada de um componente do OpenTelemetry.
Uma distribuição é um encapsulamento em torno de um repositório do OpenTelemetry
com algumas personalizações. Distribuições não devem ser confundidas com
'forks'.

As personalizações em uma distribuição podem incluir:

- Scripts para facilitar ou personalizar o uso de um backend ou fornecedor
  específico
- Alterações nas configurações padrão, necessárias para um backend, fornecedor
  ou usário final
- Pacotes ou bibliotecas adicionais que podem ser específicas para determinado
  fornecedor ou usuário final
- Cobertura adicional de testes, performance e segurança além do fornecido pelo
  OpenTelemetry
- Funcionalidades adicionais além do que já é fornecido pelo OpenTelemetry
- Remoção de funcionalidades fornecidas pelo OpenTelemetry

As distribuições geralmente se enquadram nas seguintes categorias:

- **"Pura":** Estas distribuições fornecem as mesmas funcionalidades da versão
  pública e são 100% compatíveis. As personalizações normalmente aprimoram a
  facilidade de uso ou configurações. Estas personalizações podem ser
  específicas para backends, fornecedores ou usuários finais.
- **"Plus":** Estas distribuições oferecem funcionalidades adicionais ao que é
  encontrado na versão pública, através de componentes adicionais. Exemplos
  incluem bibliotecas de instrumentação ou exportadores de fornecedores que não
  foram incluídos na versão pública do OpenTelemetry.
- **"Minus":** Estas distribuições fornecem um subconjunto de funcionalidades da
  versão pública. Exemplos podem incluir a remoção de bibliotecas de
  instrumentação ou de receptores, processadores, exportadores ou extensões
  encontradas no projeto do Coletor do OpenTelemetry. Estas distribuições podem
  ser fornecidas para aumentar o suporte e/ou temas relacionados à segurança.

## Quem pode criar uma distribuição? {#who-can-create-a-distribution}

Qualquer pessoa pode criar uma distribuição. Atualmente, diversos
[fornecedores](/ecosystem/vendors/) oferecem
[distribuições](/ecosystem/distributions). Além disso, os usuários finais podem
considerar criar uma distribuição caso queiram usar componentes no
[Registro](/ecosystem/registry) que não foram incluídos na versão pública do
projeto OpenTelemetry.

## Contribuição ou distribuição? {#contribution-or-distribution}

Antes de continuar e aprender como criar sua própria distribuição, pergunte a si
mesmo se as suas adições a um determinado componente do OpenTelemetry seriam
benéficas para todos e, portanto, deveriam ser incluídas nas implementações de
referência:

- Os seus scripts são "fáceis para uso" e podem ser generalizados?
- Suas alterações nas configurações padrão podem ser a melhor opção para todos?
- Os seus pacotes ou bibliotecas adicionais, são realmente específicos?
- Sua cobertura de testes, performance ou segurança também funcionarão nas
  implementações de referência?
- Você verificou com a comunidade se as suas funcionalidades ou comportamentos
  adicionais podem se tornar parte do padrão?

## Criando a sua própria distribuição {#creating-your-own-distribution}

### Coletor {#collector}

Um guia sobre como criar a sua própria distribuição está disponível nesta
publicação do blog:
["Building your own OpenTelemetry Collector distribution"](https://medium.com/p/42337e994b63)

Caso você esteja criando a sua própria distriuição, o
[OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
pode ser um bom ponto de partida.

### Bibliotecas de instrumentação específicas para linguagens de programação {#language-specific-instrumentation-libraries}

Existem algumas linguagens de programação que exigem mecanismos de
extensibilidade específicos para a personalização das bibliotecas de
instrumentação:

- [Java agent](/docs/zero-code/java/agent/extensions)

## Siga as diretrizes {#follow-the-guidelines}

Ao utilizar materiais relacionados ao projeto OpenTelemetry para distribuição,
como logotipo e nome, certifique-se de estar alinhado com as [Diretrizes de
Marketing do Open Telemetry para Organizações Contribuintes][diretrizes] .

O projeto OpenTelemetry não certifica distribuições neste momento. No futuro, o
OpenTelemetry poderá certificar distribuições e parceiros de maneira semelhante
ao que ocorre no projeto Kubernetes. Ao avaliar uma distribuição, assegure-se de
que seu uso não irá resultar em uma dependência de fornecedor (vendor lock-in).

> Qualquer suporte para uma distribuição deve ser fornecido diretamente pelos
> seus autores e não por autores do projeto OpenTelemetry.

[diretrizes]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
