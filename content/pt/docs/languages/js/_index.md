---
title: JavaScript
description: >-
  <img width="35" class="img-initial" src="/img/logos/32x32/JS_SDK.svg"
  alt="JavaScript"> Implementação do OpenTelemetry específica em JavaScript
  (para Node.js & o navegador).
aliases: [/js/metrics, /js/tracing, nodejs]
redirects:
  - { from: /js/*, to: ':splat' }
  - { from: /docs/js/*, to: ':splat' }
weight: 20
default_lang_commit: 33a23bc0805eb0940d214e20e7f2d7da056cbebb
---

{{% docs/languages/index-intro js /%}}

{{% include browser-instrumentation-warning.md %}}

## Suporte de Versões {#version-support}

O OpenTelemetry JavaScript oferece suporte a todas as versões do Node.js que
estejam em status LTS (_Long Term Support_) ativo ou de manutenção. Versões
anteriores do Node.js podem funcionar, mas não são testadas pelo OpenTelemetry.

O OpenTelemetry JavaScript não possui uma lista oficial de navegadores
suportados. O objetivo é funcionar nas versões atualmente suportadas dos
principais navegadores.

O OpenTelemetry JavaScript segue a política de suporte do _DefinitelyTyped_ para
TypeScript, que define uma janela de suporte de 2 anos. O suporte para versões
anteriores a 2 anos será removido em versões menores do OpenTelemetry
JavaScript.

Para mais detalhes sobre o suporte de tempo de execução, consulte
[esta visão geral](https://github.com/open-telemetry/opentelemetry-js#supported-runtimes).

## Repositórios {#repositories}

O OpenTelemetry JavaScript consiste nos seguintes repositórios:

- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js),
  repositório principal que contém a API e o SDK de distribuição.
- [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib),
  repositório de contribuições que não fazem parte da distribuição central da
  API e SDK.

## Ajuda ou Feedback {#help-or-feedback}

Caso tenha alguma dúvida sobre o OpenTelemetry JavaScript, por favor, entre em
contato via
[GitHub Discussions](https://github.com/open-telemetry/opentelemetry-js/discussions)
ou através do canal [#otel-js] do [Slack do CNCF](https://slack.cncf.io/).

Se desejar contribuir para o OpenTelemetry JavaScript, veja as
[instruções de contribuição](https://github.com/open-telemetry/opentelemetry-js/blob/main/CONTRIBUTING.md)
