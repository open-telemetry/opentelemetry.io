---
title: Amostragem
weight: 80
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

A [Amostragem](/docs/concepts/sampling/) é um processo que restringe a
quantidade de trechos gerados por um sistema. A configuração de amostragem exata
que você deve usar depende das suas necessidades específicas, mas, em geral,
você deve tomar uma decisão no início de um rastro e permitir que a decisão de
amostragem se propague para outros serviços.

Um [`Sampler`][] pode ser definido no `TracerProvider` utilizando o método
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
  pai do trecho. Caso o trecho não possua um pai, o amostrador decorado é usado
  para tomar a decisão de amostragem. Por padrão, `ParentBased` amostra trechos
  que possuem pais que foram amostrados, e não amostra trechos cujos pais não
  foram amostrados.

Por padrão, o Tracer Provider utiliza o amostrador `ParentBased` com o
amostrador `AlwaysSample`

Caso esteja em um ambiente de produção, considere utilizar o amostrador
`ParentBased` com o amostrador `TraceIDRatioBased`.

## Amostradores personalizados

Caso os amostradores nativos não atendam às suas necessidades, você pode criar
um amostrador personalizado implementando a interface [`Sampler`][]. Um
amostrador personalizado deve implementar dois métodos:

- `ShouldSample(parameters SamplingParameters) SamplingResult`: Toma a decisão
  de amostragem com base nos parâmetros fornecidos.
- `Description() string`: Retorna uma descrição do amostrador.

> [!IMPORTANT] Preserve o tracestate do pai
>
> Em `ShouldSample`, você _deve_ preservar o tracestate do pai no seu
> `SamplingResult`. Não fazer isso quebra a propagação de contexto em sistemas
> distribuídos que dependem do tracestate para transmitir dados de rastro
> específicos de fornecedores ou de aplicações.
>
> Extraia o tracestate do contexto do trecho pai:
>
> ```go
> psc := trace.SpanContextFromContext(parameters.ParentContext)
> ```
>
> Repasse `psc.TraceState()` ao construir o seu `SamplingResult`.

### Exemplo

O exemplo a seguir demonstra um amostrador personalizado que amostra trechos com
base no valor de um atributo, preservando corretamente o tracestate:

```go
package main

import (
    "context"

    "go.opentelemetry.io/otel/attribute"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/trace"
)

// AttributeBasedSampler amostra trechos com base no valor de um atributo.
// Ele sempre amostra trechos com o atributo "high.priority" definido como true.
type AttributeBasedSampler struct {
    fallback sdktrace.Sampler
}

// NewAttributeBasedSampler cria um novo AttributeBasedSampler.
func NewAttributeBasedSampler(fallback sdktrace.Sampler) *AttributeBasedSampler {
    return &AttributeBasedSampler{fallback: fallback}
}

func (s *AttributeBasedSampler) ShouldSample(p sdktrace.SamplingParameters) sdktrace.SamplingResult {
    // Sempre extraia o contexto do trecho pai para obter o tracestate.
    psc := trace.SpanContextFromContext(p.ParentContext)

    // Verifica se algum atributo indica alta prioridade.
    for _, attr := range p.Attributes {
        if attr.Key == "high.priority" && attr.Value.AsBool() {
            return sdktrace.SamplingResult{
                Decision:   sdktrace.RecordAndSample,
                Attributes: p.Attributes,
                // Crítico: preserva o tracestate do pai
                Tracestate: psc.TraceState(),
            }
        }
    }

    // Recorre ao amostrador padrão para os demais trechos.
    result := s.fallback.ShouldSample(p)

    // Garante que o tracestate seja preservado mesmo ao usar o fallback.
    // Os amostradores nativos já tratam isso, mas é uma boa prática verificar.
    return sdktrace.SamplingResult{
        Decision:   result.Decision,
        Attributes: result.Attributes,
        Tracestate: psc.TraceState(),
    }
}

func (s *AttributeBasedSampler) Description() string {
    return "AttributeBasedSampler"
}
```

### Utilizando o seu amostrador personalizado

Você pode utilizar o seu amostrador personalizado com o `TracerProvider`:

```go
sampler := NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1))

provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(sampler),
)
```

Você também pode combiná-lo com o amostrador `ParentBased`:

```go
provider := sdktrace.NewTracerProvider(
    sdktrace.WithSampler(
        sdktrace.ParentBased(
            NewAttributeBasedSampler(sdktrace.TraceIDRatioBased(0.1)),
        ),
    ),
)
```

### Considerações adicionais

Ao implementar amostradores personalizados, tenha em mente os seguintes pontos:

1. **Ignorar a decisão de amostragem do pai**: Caso queira respeitar as decisões
   de amostragem do pai, envolva o seu amostrador com `ParentBased` ou verifique
   `psc.IsSampled()` manualmente.

2. **Processamento pesado em ShouldSample**: A função `ShouldSample` é chamada
   de forma síncrona a cada criação de trecho. Evite operações custosas, como
   chamadas de rede ou processamentos complexos, que possam impactar o
   desempenho.

[`Sampler`]: https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#Sampler
