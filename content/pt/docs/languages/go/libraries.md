---
title: Utilizando bibliotecas de instrumentação
linkTitle: Bibliotecas
aliases:
  - /docs/languages/go/using_instrumentation_libraries
  - /docs/languages/go/automatic_instrumentation
weight: 40
default_lang_commit: 825010e3cfece195ae4dfd019eff080ef8eb6365
---

{{% docs/languages/libraries-intro "go" %}}

## Utilizando bibliotecas de instrumentação {#use-instrumentation-libraries}

Caso uma biblioteca não venha com o OpenTelemetry, você pode utilizar uma
[biblioteca de instrumentação](/docs/specs/otel/glossary/#instrumentation-library)
para gerar dados de telemetria para uma biblioteca ou framework.

Por exemplo, a
[biblioteca de instrumentação para `net/http`](https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp)
cria automaticamente [trechos](/docs/concepts/signals/traces/#spans) e
[métricas](/docs/concepts/signals/metrics/) com base nas requisições HTTP.

## Configuração {#setup}

Cada biblioteca de instrumentação é um pacote. Em geral, isso significa que você
precisa usar `go get` para obter o pacote apropriado. Por exemplo, para obter as
bibliotecas de instrumentação mantidas no
[repositório Contrib](https://github.com/open-telemetry/opentelemetry-go-contrib),
execute o seguinte comando:

```sh
go get go.opentelemetry.io/contrib/instrumentation/{caminho-de-importacao}/otel{nome-do-pacote}
```

Em seguida, configure o seu código com base no que a biblioteca requer para ser
ativada.

Em [Primeiros Passos](../getting-started/) fornecemos um exemplo mostrando como
configurar a instrumentação para um servidor `net/http`.

## Pacotes disponíveis {#available-packages}

Uma lista completa de bibliotecas de instrumentação disponíveis pode ser
encontrada no
[registro do OpenTelemetry](/ecosystem/registry/?language=go&component=instrumentation).

## Próximos passos {#next-steps}

As bibliotecas de instrumentação podem gerar dados de telemetria para
requisições HTTP de entrada e saída, mas não instrumentam sua aplicação
completamente.

Enriqueça seus dados de telemetria realizando uma
[instrumentação personalizada](../instrumentation/) em seu código. Isso
complementa a telemetria da biblioteca padrão e pode oferecer dados mais
profundos sobre sua aplicação em execução.
