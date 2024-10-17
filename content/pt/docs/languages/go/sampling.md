---
title: Amostragem
weight: 80
default_lang_commit: 06837fe15457a584f6a9e09579be0f0400593d57
---

A [Amostragem](/docs/concepts/sampling/) é um processo que restringe a
quantidade de trechos gerados por um sistema. A configuração de amostragem exata
que você deve usar depende das suas necessidades específicas, mas, em geral,
você deve tomar uma decisão no início de um rastro e permitir que a decisão de
amostragem se propague para outros serviços.

Um [`Sampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler)
pode ser definido no `TracerProvider` utilizando o método
[`WithSampler`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#WithSampler),
conforme o exemplo a seguir:

```go
provider := trace.NewTracerProvider(
    trace.WithSampler(trace.AlwaysSample()),
)
```

[`AlwaysSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#AlwaysSample)
e
[`NeverSample`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample)
são valores autoexplicativos. `AlwaysSample` significa que cada trecho será
amostrado, enquanto `NeverSample` significa que nenhum trecho será amostrado. Ao
iniciar um projeto, ou em ambiente de desenvolvimento, utilize `AlwaysSample`.

Outros amostradores disponíveis são:

- [`TraceIDRatioBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TraceIDRatioBased),
  que amostra uma fração dos trechos, com base na fração fornecida ao
  amostrador. Caso esta fração seja .5, metade de todos os trechos serão
  amostrados.
- [`ParentBased`](https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#ParentBased),
  é um decorador de amostrador que se comporta de maneira diferente, com base no
  parente do trecho. Caso o trecho não possua um parente, o amostrador decorado
  é usado para tomar a decisão de amostragem com base no parente do trecho. Por
  padrão, `ParentBased` amostra trechos que possuem parentes que foram
  amostrados e não amostra trechos cujos parentes não foram amostrados.

Por padrão, o Tracer Provider utiliza o amostrador `ParentBased` com o
amostrador `AlwaysSample`

Caso esteja em um ambiente de produção, considere utilizar o amostrador
`ParentBased` com o amostrador `TraceIDRatioBased`.
