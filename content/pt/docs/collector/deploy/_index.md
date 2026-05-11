---
title: Implantar o Collector
linkTitle: Implantar
description:
  Padrões que você pode aplicar para implantar o OpenTelemetry Collector
aliases: [/docs/collector/deployment]
weight: 3
default_lang_commit: bcca85a165acd5dc0c99b011665c53cb30de5ca5
---

O OpenTelemetry Collector consiste em um único binário que você pode implantar
de diferentes maneiras para diferentes casos de uso. Esta seção descreve padrões
comuns de implantação, seus casos de uso, prós e contras. Também fornece as
melhores práticas para configurar o Collector em cenários de múltiplos ambientes
e múltiplos backends. Para considerações de segurança relacionadas à
implantação, consulte as [melhores práticas de hospedagem do
Collector][security].

## Recursos adicionais {#additional-resources}

- Palestra da KubeCon América do Norte 2021 sobre [_OpenTelemetry Collector
  Deployment Patterns_ (Padrões de Implantação do OpenTelemetry
  Collector)][y-patterns] (palestra em inglês)
  - [Padrões de implantação][gh-patterns] que acompanham a palestra

[security]: /docs/security/hosting-best-practices/
[gh-patterns]:
  https://github.com/jpkrohling/opentelemetry-collector-deployment-patterns/
[y-patterns]: https://www.youtube.com/watch?v=WhRrwSHDBFs
