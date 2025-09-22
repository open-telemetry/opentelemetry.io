---
title: Serviço de Carrinho
linkTitle: Carrinho
aliases: [cartservice]
---

Este serviço mantém itens colocados no carrinho de compras pelos usuários. Ele interage
com um serviço de cache Valkey para acesso rápido aos dados do carrinho de compras.

[Código fonte do serviço de carrinho](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/cart/)

> **Nota** O OpenTelemetry para .NET usa a biblioteca `System.Diagnostic.DiagnosticSource`
> como sua API em vez da API padrão do OpenTelemetry para Rastreamentos e
> Métricas. A biblioteca `Microsoft.Extensions.Logging.Abstractions` é usada para Logs.

## Rastreamentos

### Inicializando Rastreamento

O OpenTelemetry é configurado no container de injeção de dependência .NET. O
método builder `AddOpenTelemetry()` é usado para configurar bibliotecas de instrumentação
desejadas, adicionar exportadores, e definir outras opções. Configuração do exportador
e atributos de recurso é realizada através de variáveis de ambiente.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddSource("OpenTelemetry.Demo.Cart")
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());
```

### Adicionar atributos a spans auto-instrumentados

Dentro da execução de código auto-instrumentado você pode obter o span atual
(activity) do contexto.

```cs
var activity = Activity.Current;
```

Adicionar atributos (tags em .NET) a um span (activity) é realizado usando
`SetTag` no objeto activity. Na função `AddItem` do
`services/CartService.cs` vários atributos são adicionados ao span
auto-instrumentado.

```cs
activity?.SetTag("app.user.id", request.UserId);
activity?.SetTag("app.product.quantity", request.Item.Quantity);
activity?.SetTag("app.product.id", request.Item.ProductId);
```

### Adicionar eventos de span

Adicionar eventos de span (activity) é realizado usando `AddEvent` no objeto
activity. Na função `GetCart` do `services/CartService.cs` um evento de span é
adicionado.

```cs
activity?.AddEvent(new("Fetch cart"));
```

## Métricas

### Inicializando Métricas

Similar a configurar Rastreamentos OpenTelemetry, o container de injeção de dependência .NET
requer uma chamada para `AddOpenTelemetry()`. Este builder configura
bibliotecas de instrumentação desejadas, exportadores, etc.

```cs
Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithMetrics(meterBuilder => meterBuilder
        .AddMeter("OpenTelemetry.Demo.Cart")
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .SetExemplarFilter(ExemplarFilterType.TraceBased)
        .AddOtlpExporter());
```

### Exemplares

[Exemplares](/docs/specs/otel/metrics/data-model/#exemplars) são configurados no
serviço Cart com filtro de exemplar baseado em trace, que habilita o
SDK OpenTelemetry a anexar exemplares às métricas.

Primeiro ele cria um `CartActivitySource`, `Meter` e dois `Histograms`. O
histograma mantém controle da latência dos métodos `AddItem` e `GetCart`,
já que esses são dois métodos importantes no serviço Cart.

Esses dois métodos são críticos para o serviço Cart já que usuários não devem esperar muito
tempo ao adicionar um item ao carrinho, ou ao visualizar seu carrinho antes de prosseguir
para o processo de checkout.

```cs
private static readonly ActivitySource CartActivitySource = new("OpenTelemetry.Demo.Cart");
private static readonly Meter CartMeter = new Meter("OpenTelemetry.Demo.Cart");
private static readonly Histogram<long> addItemHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.add_item.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 500000, 600000, 700000, 800000, 900000, 1000000, 1100000 ]
    });
private static readonly Histogram<long> getCartHistogram = CartMeter.CreateHistogram<long>(
    "app.cart.get_cart.latency",
    advice: new InstrumentAdvice<long>
    {
        HistogramBucketBoundaries = [ 300000, 400000, 500000, 600000, 700000, 800000, 900000 ]
    });
```

Note que um limite de bucket personalizado também é definido, já que os valores padrão não
se adequam aos resultados de microssegundos que o serviço Cart tem.

Uma vez que as variáveis são definidas, a latência da execução de cada método é
rastreada com um `StopWatch` da seguinte forma:

```cs
var stopwatch = Stopwatch.StartNew();

(lógica do método)

addItemHistogram.Record(stopwatch.ElapsedTicks);
```

Para conectar tudo, no pipeline de Rastreamentos, é necessário adicionar a
fonte criada. (Já presente no snippet acima, mas adicionado aqui para
referência):

```cs
.AddSource("OpenTelemetry.Demo.Cart")
```

E, no pipeline de Métricas, o `Meter` e o `ExemplarFilter`:

```cs
.AddMeter("OpenTelemetry.Demo.Cart")
.SetExemplarFilter(ExemplarFilterType.TraceBased)
```

Para visualizar os Exemplares, navegue para Grafana
<http://localhost:8080/grafana> > Dashboards > Demo > Cart Service Exemplars.

Exemplares aparecem como "pontos em forma de diamante" especiais no gráfico do 95º percentil
ou como pequenos quadrados no gráfico de mapa de calor. Selecione qualquer exemplar para visualizar seus dados,
que incluem o timestamp da medição, o valor bruto, e o contexto de trace
no momento do registro. O `trace_id` habilita navegação para o
backend de rastreamento (Jaeger, neste caso).

![Cart Service Exemplars](exemplars.png)

## Logs

Logs são configurados no container de injeção de dependência .NET no
nível `LoggingBuilder` chamando `AddOpenTelemetry()`. Este builder configura
opções desejadas, exportadores, etc.

```cs
builder.Logging
    .AddOpenTelemetry(options => options.AddOtlpExporter());
```
