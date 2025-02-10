---
title: Distribuições
description:
  Lista de distribuições de código aberto do OpenTelemetry mantidas por
  terceiros.
default_lang_commit: 8a15d0d668c516ccb255cd0a92e0bcd442e83b4d
---

As [distribuições](/docs/concepts/distributions/) do OpenTelemetry são uma forma
de personalizar os componentes do OpenTelemetry para torná-los mais fáceis de
implantar e utilizar com _backends_ de observabilidade específicos.

Qualquer terceiro pode personalizar os componentes do OpenTelemetry com
alterações específicas para _backends_, fornecedores ou usuários finais. Não é
obrigatório utilizar distribuições para utilizar os componentes do
OpenTelemetry, embora elas possam facilitar o uso em determinadas
circunstâncias, como requisitos específicos de fornecedores.

A lista a seguir contém um exemplo de distribuições do OpenTelemetry e seus
componentes personalizados.

{{% alert title="Nota" color="warning" %}} O OpenTelemetry **não valida nem
endossa** as distribuições de terceiros listadas na tabela a seguir. A lista é
fornecida como uma conveniência para a comunidade. {{% /alert %}}

{{% ecosystem/distributions-table %}}

## Adicionando sua distribuição {#how-to-add}

Para que sua distribuição seja listada, [envie um PR] com uma entrada adicionada
à [lista de distribuições]. A entrada deve incluir o seguinte:

- Link para a página principal da sua distribuição
- Link para a documentação que explica como utilizar a distriuição
- Lista dos componentes que sua distribuição contém
- Usuário do GitHub ou e-mail como ponto de contato, para que possamos entrar em
  contato caso tenhamos dúvidas

{{% alert title="Notas" color="info" %}}

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

{{% ecosystem/keep-up-to-date distribution %}}

[lista de distribuições]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
