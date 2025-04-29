---
title: Fornecedores
description: Fornecedores que oferecem suporte nativo ao OpenTelemetry
aliases: [/vendors]
default_lang_commit: b6ddba1118d07bc3c8d1d07b293f227686d0290e
---

Uma lista não exaustiva de organizações que oferecem soluções que consomem o
OpenTelemetry nativamente via [OTLP](/docs/specs/otlp/), como _backends_ de
observabilidade e _pipelines_ de observabilidade.

Algumas organizações fornecem uma [distribuição](/ecosystem/distributions/) (de
componentes personalizados do OpenTelemetry) que oferece capacidades adicionais
ou maior facilidade de uso.

_Open Source_ (OSS) refere-se a um fornecedor que possui um produto de
observabilidade que é [código aberto](https://opensource.org/osd). O fornecedor
ainda pode ter outros produtos que são de código fechado, como uma oferta SaaS
que disponibiliza um produto de código aberto para seus clientes.

{{% ecosystem/vendor-table %}}

## Adicionando sua organização {#how-to-add}

Para que sua organização seja listada, [envie um PR] com um a entrada adicionada
à [lista de fornecedores]. A entrada deve incluir:

- Link para a documentação que detalha como sua solução consome o OpenTelemetry
  nativamente via [OTLP](/docs/specs/otlp).
- Link para sua distribuição, se aplicável.
- Link que comprove que sua solução é de código aberto, se aplicável. Uma
  distribuição de código aberto não qualifica sua solução para ser marcada como
  "código aberto".
- Usuário do GitHub ou e-mail como ponto de contato, para que possamos entrar em
  contato caso tenhamos dúvidas.

Observe que esta lista é destinada a organizações que consomem o OpenTelemetry e
oferecem Observabilidade para [usuários finais](/community/end-user/).

Se você adota o OpenTelemetry para Observabilidade como uma
[organização usuária final](https://www.cncf.io/enduser/) e não fornece nenhum
tipo de serviço relacionado ao OpenTelemetry, consulte
[Adotantes](/ecosystem/adopters/).

Se você fornece uma biblioteca, serviço ou aplicação que se torna observável por
meio do OpenTelemetry, consulte [Integrações](/ecosystem/integrations/).

[envie um PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md fornecedores %}}

[lista de fornecedores]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/vendors.yaml
