---
title: Bibliotecas
description: Aprenda como adicionar instrumentação nativa à sua biblioteca.
aliases: [../instrumenting-library]
weight: 40
---

A OpenTelemetry fornece [bibliotecas de instrumentação][] para várias bibliotecas, geralmente feitas por meio de _hooks_ de biblioteca ou _monkey-patching_ do código da biblioteca.

A instrumentação nativa de bibliotecas com OpenTelemetry oferece melhor observabilidade e experiência para desenvolvedores, eliminando a necessidade de as bibliotecas exporem e documentarem hooks:

- hooks de logging personalizados podem ser substituídos por APIs OpenTelemetry comuns e fáceis de usar, os usuários utilizarão somente o OpenTelemetry
- rastros, logs e métricas do código da biblioteca e da aplicação são correlacionados e coerentes
- convenções comuns permitem que os usuários obtenham uma telemetria semelhante e consistente dentro da mesma tecnologia e entre bibliotecas e linguagens
- sinais de telemetria podem ser ajustados (filtrados, processados, agregados) para diversos cenários de consumo usando uma grande variedade de pontos de extensibilidade bem documentados do OpenTelemetry.

## Convenção semântica

Confira as [convenções semânticas](/docs/specs/semconv/general/trace/) disponíveis, que abrangem frameworks web, clientes RPC, bancos de dados, clientes de mensagens, componentes de infraestrutura e muito mais!

Se a sua biblioteca se enquadra em alguma dessas categorias, siga as convenções. Elas são a principal fonte de verdade e indicam quais informações devem ser incluídas nos trechos. As convenções tornam a instrumentação consistente: usuários que trabalham com telemetria não precisam aprender as especificidades de cada biblioteca, e fornecedores de observabilidade podem criar experiências para uma ampla variedade de tecnologias (por exemplo, bancos de dados ou sistemas de mensagens). Quando as bibliotecas seguem as convenções, muitos cenários podem ser habilitados automaticamente, sem necessidade de intervenção ou configuração por parte do usuário.

As convenções semânticas estão em constante evolução, e novas são adicionadas regularmente. Se ainda não existirem convenções para a sua biblioteca, [considere adicioná-las](https://github.com/open-telemetry/semantic-conventions/issues). Preste atenção especial aos nomes dos rastros; procure usar nomes significativos e considere a cardinalidade ao defini-los.

Há um atributo [`schema_url`](/docs/specs/otel/schemas/#schema-url) que pode ser usado para registrar a versão das convenções semânticas em uso. Sempre que possível, configure esse atributo.

Se tiver algum feedback ou quiser adicionar uma nova convenção, participe e contribua! O [Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7) ou o repositório de [Specification](https://github.com/open-telemetry/opentelemetry-specification) são ótimos pontos de partida!

### Definindo rastros

Pense na sua biblioteca do ponto de vista de um usuário e no que ele poderia querer saber sobre o comportamento e a atividade da biblioteca. Como mantenedor da biblioteca, você conhece os detalhes internos, mas o usuário provavelmente estará mais interessado na funcionalidade da aplicação do que no funcionamento interno da biblioteca. Considere quais informações podem ser úteis para analisar o uso da sua biblioteca e pense em uma maneira apropriada de modelar esses dados. Algumas considerações incluem:

- Trechos e hierarquias de trecho
- Atributos numéricos em rastros (como alternativa a métricas agregadas)
- Eventos em rastros
- Métricas agregadas

Por exemplo, se sua biblioteca está fazendo requisições a um banco de dados, crie rastros apenas para a requisição lógica ao banco de dados. As requisições físicas pela rede devem ser instrumentadas nas bibliotecas que implementam essa funcionalidade. Além disso, é preferível capturar outras atividades, como a serialização de objetos/dados, como eventos em rastros, ao invés de rastros adicionais.

Siga as convenções semânticas ao definir atributos em rastros.

## Quando **não** instrumentar

Algumas bibliotecas atuam como camadas finas que encapsulam chamadas de rede. Há uma grande chance de que o OpenTelemetry já tenha uma biblioteca de instrumentação para o cliente RPC subjacente (confira o [registry](/ecosystem/registry/)). Nesse caso, pode não ser necessário instrumentar a biblioteca que encapsula essas chamadas. Como diretriz geral, só instrumente sua biblioteca em seu próprio nível.

Não instrumente se:

- sua biblioteca é um proxy simples em cima de APIs documentadas ou autoexplicativas
- _e_ o OpenTelemetry já tem instrumentação para as chamadas de rede subjacentes
- _e_ não existem convenções que sua biblioteca deva seguir para enriquecer a telemetria

Se estiver em dúvida - não instrumente - você sempre pode fazê-lo mais tarde, quando perceber que é necessidade.

Se optar por não instrumentar, ainda pode ser útil fornecer uma maneira de configurar _handlers_ do OpenTelemetry para a instância interna do cliente RPC. Isso é essencial em linguagens que não suportam instrumentação totalmente automática e ainda é útil em outras.

O restante deste documento fornece orientações sobre o que e como instrumentar, caso decida fazê-lo.

## OpenTelemetry API

O primeiro passo é adicionar a dependência do pacote OpenTelemetry API.

O OpenTelemetry possui [dois módulos principais](/docs/specs/otel/overview/) - API e SDK.
A API do OpenTelemetry é um conjunto de abstrações e implementações não operacionais.
A menos que sua aplicação importe o SDK do OpenTelemetry, sua instrumentação não faz nada e não impacta o desempenho da aplicação.

**Bibliotecas devem usar apenas a API do OpenTelemetry.**

Você pode estar com receio de adicionar novas dependências, então aqui estão algumas considerações para ajudar a minimizar problemas com dependências:

- A API de rastros do OpenTelemetry alcançou estabilidade no início de 2021, seguindo a [Convenção semântica 2.0](/docs/specs/otel/versioning-and-stability/), e levamos a estabilidade da API a sério.
- Ao definir dependências, use a versão estável da API do OpenTelemetry (1.0.\*) e evite atualizá-la, a menos que precise de novos recursos.
- Enquanto sua instrumentação se estabiliza, considere lançá-la como um pacote separado, para que isso não cause problemas para usuários que não a utilizam. Você pode mantê-la em seu repositório ou [adicioná-la ao OpenTelemetry](https://github.com/open-telemetry/oteps/blob/main/text/0155-external-modules.md#contrib-components), para que seja distribuída junto com outras bibliotecas de instrumentação.
- As Convenções Semânticas são [estáveis, mas sujeitas à evolução][]: embora isso não cause problemas funcionais, pode ser necessário atualizar sua instrumentação de tempos em tempos. Ter a instrumentação em um pacote experimental ou no repositório _contrib_ do OpenTelemetry pode ajudar a manter as convenções atualizadas sem causar mudanças disruptivas para seus usuários.

  [estáveis, mas sujeitas à evolução]:
    /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### Obtendo um rastro

Toda a configuração da aplicação é ocultada da sua biblioteca por meio da API de Rastros. As bibliotecas podem permitir que as aplicações passem instâncias de `TracerProvider` para facilitar a injeção de dependências e o teste, ou podem obtê-las a partir do [TracerProvider global](/docs/specs/otel/trace/api/#get-a-tracer). As implementações do OpenTelemetry em diferentes linguagens podem ter preferências distintas para passar instâncias ou acessar o global, dependendo do que é mais comum na linguagem.

Ao obter o rastro, forneça o nome e a versão da sua biblioteca (ou do pacote de rastreamento) - essas informações aparecerão na telemetria e ajudarão os usuários a processar e filtrar a telemetria, além de entender sua origem e depurar/relatar quaisquer problemas de instrumentação.

## O que instrumentar

### APIs Públicas

APIs públicas são bons candidatos para rastreamento: trechos criados para chamadas de APIs públicas permitem que os usuários mapeiem a telemetria para o código da aplicação, entendam a duração e o resultado das chamadas da biblioteca. Quais chamadas devem ser rastreadas:

- métodos públicos que fazem chamadas de rede internamente ou operações locais que levam tempo significativo e podem falhar (e.g. IO)
- handlers que processam requisições ou mensagens

**Exemplo de instrumentação**

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // consulte as convenções para obter orientações sobre nomes de rastros e atributos
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // torna o rastro ativo e permite correlacionar logs e spans aninhados
    try (Scope unused = span.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            span.setStatus(StatusCode.OK);
        }

        if (span.isRecording()) {
           // preencha atributos de resposta para códigos de resposta e outras informações
        }
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        span.end();
    }
}
```

Siga as convenções para preencher atributos! Se nenhuma delas se aplicar, consulte as [convenções gerais](/docs/specs/semconv/general/attributes/).

### Trechos de rede aninhados e outros trechos

Chamadas de rede são geralmente rastreadas com auto-instrumentações do OpenTelemetry através da implementação correspondente do cliente.

![Trecho de banco de dados e HTTP aninhados na interface do Jaeger](../nested-spans.svg)

Se o OpenTelemetry não suportar o rastreamento do seu cliente de rede, use seu melhor julgamento. Aqui estão algumas considerações para ajudar:

- Rastrear chamadas de rede melhoraria a observabilidade para os usuários ou sua capacidade de apoiá-los?
- Sua biblioteca é um encapsulador de uma API RPC pública e documentada? Os usuários precisariam obter suporte do serviço subjacente em caso de problemas?
  - instrumente a biblioteca e certifique-se de rastrear tentativas individuais de rede
- Rastrear essas chamadas com trechos seria muito verboso? Ou impactaria notavelmente o desempenho?
  - use logs com verbosidade ou eventos de trecho: logs podem ser correlacionados ao trecho raiz (chamadas de API pública), enquanto eventos de span devem ser definidos no trecho da API pública.
  - se eles precisarem ser trechos (para carregar e propagar contexto de um único rastro), coloque-os atrás de uma opção de configuração e desative-os por padrão.

Se o OpenTelemetry já suportar o rastreamento de suas chamadas de rede, você provavelmente não quer duplicá-lo. Pode haver algumas exceções:

- para suportar usuários sem auto-instrumentação (que pode não funcionar em certos ambientes ou os usuários podem ter preocupações com monkey-patching)
- para habilitar protocolos personalizados (legados) de correlação e propagação de contexto com o serviço subjacente
- enriquecer trechos de RPC com informações absolutamente essenciais específicas da biblioteca/serviço não cobertas pela auto-instrumentação

AVISO: Solução genérica para evitar duplicação está em construção 🚧.

