---
title: Distribuições
weight: 25
default_lang_commit: 6a7f17450ce3edc2e4363013551ee93ba7934a5d
---

O projeto OpenTelemetry oferece atualmente [distribuições][distributions]
pré-compiladas do Collector. Os componentes incluídos nessas distribuições podem
ser encontrados no arquivo `manifest.yaml` de cada distribuição.

[distributions]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% ecosystem/distributions-table filter="first-party-collector" %}}

## Distribuições personalizadas {#custom-distributions}

As distribuições fornecidas pelo projeto OpenTelemetry podem não atender às suas
necessidades. Por exemplo, você pode querer um binário menor ou precisar
implementar funcionalidades personalizadas, como
[_authenticator extensions_](/docs/collector/extend/custom-component/extension/authenticator)
(extensões de autenticação),
[_receivers_](/docs/collector/extend/custom-component/receiver), _processors_,
_exporters_ ou
[_connectors_](/docs/collector/extend/custom-component/connector). A ferramenta
de criação de distribuições [ocb](/docs/collector/extend/ocb/) (OpenTelemetry
Collector Builder) está disponível para criar suas próprias distribuições.

## Distribuições de terceiros {#third-party-distributions}

Algumas organizações fornecem uma distribuição do Collector com funcionalidades
adicionais ou para facilitar seu uso. A seguir, está uma lista de distribuições
do Collector mantidas por terceiros.

{{% ecosystem/distributions-table filter="third-party-collector" %}}

## Adicionar sua distribuição do Collector {#how-to-add}

Para que sua distribuição do Collector seja listada, [envie um PR][submit a PR]
com uma entrada adicionada à [lista de distribuições][distributions list]. A
entrada deve incluir:

- Link para a página principal da sua distribuição
- Link para a documentação que explica como usar a distribuição
- Nome de usuário do GitHub ou endereço de e-mail como ponto de contato, para
  que possamos entrar em contato caso tenhamos dúvidas

[submit a PR]: /docs/contributing/pull-requests/
[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
