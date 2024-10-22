---
title: Bibliotecas
description: Aprenda como adicionar instrumentação nativa à sua biblioteca.
weight: 40
default_lang_commit: a570a00c7a238ffe26528d7bfb20efdbaf939c39
htmltest:
  IgnoreDirs:
    # TODO drop next line after https://github.com/open-telemetry/opentelemetry.io/issues/5423 is fixed for pt pages:
    - ^pt/docs/concepts/instrumentation/libraries/
---

O OpenTelemetry fornece [bibliotecas de instrumentação][] para várias
bibliotecas, geralmente feitas por meio de _hooks_ de biblioteca ou
_monkey-patching_ do código da biblioteca.

A instrumentação nativa de bibliotecas com OpenTelemetry oferece melhor
observabilidade e experiência para desenvolvedores, eliminando a necessidade das
bibliotecas exporem e documentarem _hooks_:

- _Hooks_ personalizados de logging podem ser substituídos por APIs
  OpenTelemetry comuns e fáceis de usar, os usuários utilizarão somente o
  OpenTelemetry
- Rastros, logs e métricas do código da biblioteca e da aplicação são
  correlacionados e coerentes
- Convenções comuns permitem que os usuários obtenham uma telemetria semelhante
  e consistente com a mesma tecnologia e entre diferentes bibliotecas e
  linguagens
- Sinais de telemetria podem ser ajustados (filtrados, processados, agregados)
  para diversos cenários de consumo usando uma grande variedade de pontos de
  extensibilidade bem documentados do OpenTelemetry.

## Convenção semântica

Confira as [convenções semânticas](/docs/specs/semconv/general/trace/)
disponíveis, que abrangem frameworks web, clientes RPC, bancos de dados,
clientes de mensagens, componentes de infraestrutura e muito mais!

Se a sua biblioteca se enquadra em alguma dessas categorias, siga as convenções.
Elas são a principal fonte de verdade e indicam quais informações devem ser
incluídas nos trechos. As convenções tornam a instrumentação consistente:
usuários que trabalham com telemetria não precisam aprender as especificidades
de cada biblioteca, e fornecedores de observabilidade podem criar experiências
para uma ampla variedade de tecnologias (por exemplo, bancos de dados ou
sistemas de mensagens). Quando as bibliotecas seguem as convenções, muitos
cenários podem ser habilitados automaticamente, sem necessidade de intervenção
ou configuração por parte do usuário.

As convenções semânticas estão em constante evolução, e novas são adicionadas
regularmente. Se ainda não existirem convenções para a sua biblioteca,
[considere adicioná-las](https://github.com/open-telemetry/semantic-conventions/issues).
Preste atenção especial aos nomes dos trechos; procure usar nomes significativos
e considere a cardinalidade ao defini-los.

Há um atributo [`schema_url`](/docs/specs/otel/schemas/#schema-url) que pode ser
usado para registrar a versão das convenções semânticas em uso. Sempre que
possível, configure esse atributo.

Se tiver algum feedback ou quiser adicionar uma nova convenção, participe e
contribua! O
[Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7) ou
o repositório de
[Specification](https://github.com/open-telemetry/opentelemetry-specification)
são ótimos pontos de partida!

### Definindo trechos

Pense na sua biblioteca do ponto de vista de um usuário e no que ele poderia
querer saber sobre o comportamento e a atividade da biblioteca. Como mantenedor
da biblioteca, você conhece os detalhes internos, mas o usuário provavelmente
estará mais interessado na funcionalidade da aplicação do que no funcionamento
interno da biblioteca. Considere quais informações podem ser úteis para analisar
o uso da sua biblioteca e pense em uma maneira apropriada de modelar esses
dados. Algumas considerações incluem:

- Trechos e hierarquias de trecho
- Atributos numéricos em trechos (como alternativa a métricas agregadas)
- Eventos em trechos
- Métricas agregadas

Por exemplo, se sua biblioteca está fazendo requisições a um banco de dados,
crie trechos apenas para a requisição lógica ao banco de dados. As requisições
físicas pela rede devem ser instrumentadas nas bibliotecas que implementam essa
funcionalidade. Além disso, é preferível capturar outras atividades, como a
serialização de objetos/dados como eventos em trechos, ao invés de trechos
adicionais.

Siga as convenções semânticas ao definir atributos dos trechos.

## Quando **não** instrumentar

Algumas bibliotecas atuam como camadas finas que encapsulam chamadas de rede. Há
uma grande chance de que o OpenTelemetry já tenha uma biblioteca de
instrumentação para o cliente RPC subjacente (confira o
[registry](/ecosystem/registry/)). Nesse caso, pode não ser necessário
instrumentar a biblioteca que encapsula essas chamadas. Como diretriz geral, só
instrumente sua biblioteca em seu próprio nível.

Não instrumente se:

- Sua biblioteca é um proxy simples em cima de APIs documentadas ou
  autoexplicativas
- O OpenTelemetry já tem instrumentação para as chamadas de rede subjacentes
- Não existem convenções que sua biblioteca deva seguir para enriquecer a
  telemetria

Se estiver em dúvida - não instrumente - você sempre pode fazê-lo mais tarde,
quando perceber a necessidade.

Se optar por não instrumentar, ainda pode ser útil fornecer uma maneira de
configurar _handlers_ do OpenTelemetry para a instância interna do cliente RPC.
Isso é essencial em linguagens que não suportam instrumentação totalmente
automática e ainda é útil em outras.

O restante deste documento fornece orientações sobre o que e como instrumentar,
caso decida fazê-lo.

## OpenTelemetry API

O primeiro passo é adicionar a dependência do pacote OpenTelemetry API.

O OpenTelemetry possui [dois módulos principais](/docs/specs/otel/overview/) -
API e SDK. A API do OpenTelemetry é um conjunto de abstrações e implementações
não operacionais. A menos que sua aplicação importe o SDK do OpenTelemetry, sua
instrumentação não faz nada e não impacta o desempenho da aplicação.

**Bibliotecas devem usar apenas a API do OpenTelemetry.**

Você pode estar com receio de adicionar novas dependências, então aqui estão
algumas considerações para ajudar a minimizar problemas com dependências:

- A API de rastros do OpenTelemetry alcançou estabilidade no início de 2021,
  seguindo a
  [Convenção semântica 2.0](/docs/specs/otel/versioning-and-stability/), e
  levamos a estabilidade da API a sério.
- Ao adicionar dependências, use a versão estável da API do OpenTelemetry
  (1.0.\*) e evite atualizá-la, a menos que precise usar novas funcionalidades.
- Enquanto sua instrumentação se estabiliza, considere lançá-la como um pacote
  separado, para que isso não cause problemas para usuários que não a utilizam.
  Você pode mantê-la em seu repositório ou
  [adicioná-la ao OpenTelemetry](https://github.com/open-telemetry/oteps/blob/main/text/0155-external-modules.md#contrib-components),
  para que seja distribuída junto com outras bibliotecas de instrumentação.
- As Convenções Semânticas são [estáveis, mas sujeitas à evolução][]: embora
  isso não cause problemas funcionais, pode ser necessário atualizar sua
  instrumentação de tempos em tempos. Ter a instrumentação em um pacote
  experimental ou no repositório _contrib_ do OpenTelemetry pode ajudar a manter
  as convenções atualizadas sem causar mudanças disruptivas para seus usuários.

### Obtendo um rastreador

Toda a configuração da aplicação é ocultada da sua biblioteca por meio da API de
Rastreamento. As bibliotecas podem permitir que as aplicações passem instâncias
de `TracerProvider` para facilitar testes e injeção de dependências, ou podem
obtê-las a partir do
[TracerProvider global](/docs/specs/otel/trace/api/#get-a-tracer). As
implementações do OpenTelemetry em diferentes linguagens podem ter preferências
distintas para passar instâncias ou acessar o global, dependendo do que é mais
comum na linguagem.

Ao obter o rastreador, forneça o nome e a versão da sua biblioteca (ou do pacote
de rastreamento) - essas informações aparecerão na telemetria e ajudarão os
usuários a processar e filtrar a telemetria, além de entender sua origem e
depurar/relatar quaisquer problemas de instrumentação.

## O que instrumentar

### APIs Públicas

APIs públicas são bons candidatos para rastreamento: trechos criados para
chamadas de APIs públicas permitem que os usuários mapeiem a telemetria para o
código da aplicação, entendam a duração e o resultado das chamadas da
biblioteca. Quais chamadas devem ser rastreadas:

- Métodos públicos que fazem chamadas de rede internamente ou operações locais
  que levam tempo significativo e podem falhar (ex.: operações de Entrada/Saída)
- _Handlers_ que processam requisições ou mensagens

**Exemplo de instrumentação:**

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // consulte as convenções para obter orientações sobre nomes de trechos e atributos
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // torna o trecho ativo e permite correlacionar logs e trechos aninhados
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

Siga as convenções para preencher atributos! Se nenhuma delas se aplicar,
consulte as [convenções gerais](/docs/specs/semconv/general/attributes/).

### Trechos de rede aninhados e outros trechos

Chamadas de rede são geralmente rastreadas com auto-instrumentações do
OpenTelemetry através da implementação correspondente do cliente.

![Trecho de banco de dados e HTTP aninhados na interface do Jaeger](../nested-spans.svg)

Se o OpenTelemetry não suportar o rastreamento do seu cliente de rede, use seu
melhor julgamento. Aqui estão algumas considerações para ajudar:

- Rastrear chamadas de rede melhoraria a observabilidade para os usuários ou sua
  capacidade de apoiá-los?
- Sua biblioteca é um encapsulador de uma API RPC pública e documentada? Os
  usuários precisariam obter suporte do serviço subjacente em caso de problemas?
  - instrumente a biblioteca e certifique-se de rastrear tentativas individuais
    de rede
- Rastrear essas chamadas com trechos seria muito verboso? Ou impactaria
  notavelmente o desempenho?
  - Use logs com verbosidade ou eventos de trecho: logs podem ser
    correlacionados ao trecho raiz (chamadas de API pública), enquanto eventos
    de rastro devem ser definidos no trecho da API pública.
  - Se eles precisarem ser trechos (para carregar e propagar contexto de um
    único rastro), coloque-os atrás de uma opção de configuração e desative-os
    por padrão.

Se o OpenTelemetry já suportar o rastreamento de suas chamadas de rede, você
provavelmente não quer duplicá-lo. Pode haver algumas exceções:

- Para suportar usuários sem auto-instrumentação (que pode não funcionar em
  certos ambientes ou os usuários podem ter preocupações com _monkey-patching_)
- Para habilitar protocolos personalizados (legados) de correlação e propagação
  de contexto com o serviço subjacente
- Enriquecer trechos de RPC com informações absolutamente essenciais específicas
  da biblioteca/serviço não cobertas pela auto-instrumentação

AVISO: Solução genérica para evitar duplicação está em construção 🚧.

### Eventos

Rastros são um tipo de sinal que seus aplicativos podem emitir. Eventos (ou
logs) e traces se complementam, não se duplicam. Sempre que você tiver algo que
deva ter uma verbosidade, logs são uma escolha melhor do que traces.

É provável que seu aplicativo já use log ou algum módulo semelhante. Seu módulo
pode já ter integração com o OpenTelemetry -- para descobrir, veja o
[registry](/ecosystem/registry/). As integrações geralmente adicionam o contexto
de rastros ativo em todos os logs, para que os usuários possam correlacioná-los.

Se sua linguagem e ecossistema não tiverem suporte comum para logs, use [span
events][] para compartilhar detalhes adicionais do aplicativo. Eventos podem ser
mais convenientes se você quiser adicionar atributos também.

Como regra geral, use eventos ou logs para dados verbosos em vez de rastros.
Sempre anexe eventos à instância do trecho que sua instrumentação criou. Evite
usar o trecho ativo se puder, pois você não controla a que ele se refere.

## Propagação de contexto

### Extraindo contexto

Se você trabalha em uma biblioteca ou serviço que recebe chamadas _upstream_,
como um framework web ou um consumidor de mensagens, você deve extrair o
contexto da requisição/mensagem recebida. O OpenTelemetry fornece a API
`Propagator`, que oculta padrões específicos de propagação e lê o `Context` de
rastreamento do cabeçalho. No caso de uma única resposta, há apenas um contexto
no cabeçalho, que se torna o pai dos novos trechos criado pela biblioteca.

Após criar um trecho, você deve passar o novo contexto de rastreamento para o
código da aplicação (_callback_ ou _handler_), tornando o rastro ativo; se
possível, você deve fazer isso explicitamente.

```java
// extrair o contexto
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
Span span = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// tornar o trecho ativo para que qualquer telemetria aninhada seja correlacionada
try (Scope unused = span.makeCurrent()) {
  userCode();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

Aqui estão os
[exemplos completos de extração de contexto em Java](/docs/languages/java/instrumentation/#context-propagation),
consulte a documentação do OpenTelemetry no seu idioma.

No caso de um sistema de mensagens, você pode receber mais de uma mensagem de
uma vez. As mensagens recebidas se tornam
[_links_](/docs/languages/java/instrumentation/#create-spans-with-links) no
trecho que você cria. Consulte as
[convenções de mensagens](/docs/specs/semconv/messaging/messaging-spans/) para
mais detalhes (AVISO: as convenções de mensagens estão
[em construção](https://github.com/open-telemetry/oteps/pull/173) 🚧).

### Injetando contexto

Quando você faz uma chamada de saída, geralmente vai querer propagar o contexto
para o serviço _downstream_. Nesse caso, você deve criar um novo trecho para
rastrear a chamada de saída e usar a API `Propagator` para injetar o contexto na
mensagem. Podem haver outros casos em que você queira injetar o contexto, por
exemplo, ao criar mensagens para processamento assíncrono.

```java
Span span = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// tornar o trecho ativo para que qualquer telemetria aninhada seja correlacionada
// até mesmo chamadas de rede podem ter camadas aninhadas de trechos, logs ou eventos
try (Scope unused = span.makeCurrent()) {
  // injetar o contexto
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

Aqui está o
[exemplo completo de injeção de contexto em Java](/docs/languages/java/instrumentation/#context-propagation).

Podem haver algumas exceções:

- O serviço _downstream_ não suporta metadados ou proíbe campos desconhecidos
- O serviço _downstream_ não define protocolos de correlação. Existe a
  possibilidade de que uma versão futura do serviço suporte a propagação de
  contexto compatível? Injete-o!
- O serviço _downstream_ suporta um protocolo de correlação personalizado.
  - Melhor esforço com propagador personalizado: use o contexto de rastreamento
    do OpenTelemetry, se for compatível.
  - Ou gere e aplique IDs de correlação personalizados no trecho.

### Em processo

- **Torne seus trechos ativos** (também conhecidos como atuais): isso permite
  correlacionar trechos com logs e qualquer auto-instrumentação aninhada.
- Se a biblioteca tiver uma noção de contexto, suporte a **propagação explícita
  de contexto de rastreamento opcional** _além_ de trechos ativos
  - Coloque rastros (contexto de rastreamento) criados pela biblioteca no
    contexto explicitamente, documente como acessá-los
  - Permita que os usuários passem o contexto de rastreamento em seu contexto
- Dentro da biblioteca, propague o contexto de rastreamento explicitamente -
  trechos ativos podem mudar durante _callbacks_!
  - Capture o contexto ativo dos usuários na superfície da API pública assim que
    puder, use-o como contexto pai para seus trechos
  - Passe o contexto e aplique atributos, exceções, eventos nas instâncias
    propagadas explicitamente
  - Isso é essencial se você iniciar threads explicitamente, fizer processamento
    em segundo plano ou outras coisas que podem falhar devido a limitações de
    fluxo de contexto assíncrono em sua linguagem

## Miscelânea

### Registro de Instrumentação

Por favor, adicione sua biblioteca de instrumentação ao
[registro do OpenTelemetry](/ecosystem/registry/), para que os usuários possam
encontrá-la.

### Performance

A API do OpenTelemetry não executa operações quando não há SDK configurado na
aplicação. Quando o SDK do OpenTelemetry é configurado, ele
[consome recursos limitados](/docs/specs/otel/performance/).

Aplicações da vida real, especialmente em grande escala, frequentemente têm
amostragem baseada em cabeçalho configurada. Techos não amostrados são baratos e
você pode verificar se o trecho está gravando, para evitar alocações extras e
cálculos potencialmente caros, enquanto preenche atributos.

```java
// alguns atributos são importantes para a amostragem e devem ser fornecidos no momento da criação
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// outros atributos, especialmente aqueles caros de calcular
// devem ser adicionados se o trecho estiver gravando
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### Tratamento de Erros

A API do OpenTelemetry é
[tolerante em tempo de execução](/docs/specs/otel/error-handling/#basic-error-handling-principles)
– não falha em argumentos inválidos, nunca lança exceções, e as elimina. Dessa
forma, problemas de instrumentação não afetam a lógica da aplicação. Teste a
instrumentação para identificar problemas que o OpenTelemetry pode esconder em
tempo de execução.

### Testes

Como o OpenTelemetry oferece uma variedade de auto-instrumentações, é útil
verificar como a sua instrumentação interage com outras telemetrias:
solicitações de entrada, solicitações de saída, logs, etc. Use uma aplicação
típica, com frameworks e bibliotecas populares e com todo o rastreamento ativado
ao testar sua instrumentação. Verifique como bibliotecas semelhantes à sua são
exibidas.

Para testes unitários, você geralmente pode simular ou criar versões fictícias
de `SpanProcessor` e `SpanExporter`.

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // executa teste ...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    exportedSpans.addAll(spans);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[bibliotecas de instrumentação]:
  /docs/specs/otel/overview/#instrumentation-libraries
[span events]: /docs/specs/otel/trace/api/#add-events
[estáveis, mas sujeitas à evolução]:
  /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability
