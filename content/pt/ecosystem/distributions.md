---
title: Distribuições de terceiros
description:
  Lista de distribuições de código aberto do OpenTelemetry mantidas por
  terceiros.
default_lang_commit: c392c714849921cd56aca8ca99ab11e0e4cb16f4
---

As [distribuições][distributions] do OpenTelemetry são uma forma de personalizar
os [componentes][components] do OpenTelemetry para torná-los mais fáceis de
implantar e utilizar com _backends_ de observabilidade específicos.

Qualquer terceiro pode personalizar os componentes do OpenTelemetry com
alterações específicas para _backends_, [fornecedores][vendor] ou usuários
finais. É possível utilizar componentes do OpenTelemetry sem uma distribuição,
mas uma distribuição pode facilitar as coisas em alguns casos, por exemplo
quando um fornecedor possui requisitos específicos.

A lista a seguir contém uma amostra de distribuições do OpenTelemetry que não
são do Collector e o componente que elas customizam. Para distribuições do
[OpenTelemetry Collector](/docs/collector), consulte
[Distribuições do Collector](/docs/collector/distributions/).

{{% ecosystem/distributions-table filter="non-collector" %}}

## Adicionando sua distribuição {#how-to-add}

Para que sua distribuição seja listada, [envie um PR] com uma entrada adicionada
à [lista de distribuições][distributions list]. A entrada deve incluir:

- Link para a página principal da sua distribuição
- Link para a documentação que explica como utilizar a distribuição
- Lista dos componentes que sua distribuição contém
- Usuário do GitHub ou e-mail como ponto de contato, para que possamos entrar em
  contato caso tenhamos dúvidas

{{% alert title="Notas" %}}

- Se você fornece integração externa do OpenTelemetry para qualquer tipo de
  biblioteca, serviço ou aplicativo, considere
  [adicioná-la ao registro](/ecosystem/registry/adding).
- Se você adota o OpenTelemetry para observabilidade como um usuário final e não
  fornece nenhum tipo de serviço relacionado ao OpenTelemetry, consulte
  [Adotantes](/ecosystem/adopters).
- Se você oferece uma solução que consome o OpenTelemetry para fornecer
  observabilidade aos usuários finais, consulte
  [Fornecedores](/ecosystem/vendors).

{{% /alert %}}

[envie um PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md distributions %}}

[components]: /docs/concepts/components/
[distributions]: /docs/concepts/distributions/
[distributions list]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[vendor]: ../vendors/
