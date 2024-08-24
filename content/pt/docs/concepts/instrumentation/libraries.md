---
title: Bibliotecas
description: Aprenda como adicionar instrumentação nativa à sua biblioteca.
aliases: [../instrumenting-library]
weight: 40
default_lang_commit: 13c2d415e935fac3014344e67c6c61556779fd6f
---

O OpenTelemetry fornece [bibliotecas de instrumentação][] para muitas bibliotecas, o que geralmente é feito por meio de hooks de biblioteca ou modificando o código da biblioteca (monkey-patching).

A instrumentação nativa de bibliotecas com o OpenTelemetry oferece melhor observabilidade e experiência para os desenvolvedores, eliminando a necessidade de as bibliotecas exporem e documentarem hooks:

- hooks personalizados de logs podem ser substituídos por APIs comuns e fáceis de usar do OpenTelemetry, os usuários interagem apenas com o OpenTelemetry
- Rastros, logs e métricas do código da biblioteca e da aplicação são correlacionados e coerentes
- Convenções comuns permitem que os usuários obtenham telemetria semelhante e consistente dentro da mesma tecnologia e entre bibliotecas e linguagens
- Os sinais de telemetria podem ser ajustados (filtrados, processados, agregados) para diversos cenários de consumo usando uma ampla variedade de pontos de extensão do OpenTelemetry bem documentados.

## Convenções Semânticas

Confira as [convenções semânticas](/docs/specs/semconv/general/trace/)
disponíveis, que abrangem frameworks web, clientes RPC, bancos de dados, clientes de mensageria, componentes de infraestrutura e muito mais!

Se a sua biblioteca se enquadra em alguma dessas categorias, siga as convenções, elas são a principal fonte de verdade e indicam quais informações devem ser incluídas nos trechos. As convenções garantem consistência na instrumentação: os usuários que trabalham com telemetria não precisam aprender os detalhes específicos de cada biblioteca, e os fornecedores de observabilidade podem construir experiências para uma ampla variedade de tecnologias (por exemplo, bancos de dados ou sistemas de mensageria). Quando as bibliotecas seguem as convenções, muitos cenários podem ser habilitados automaticamente, sem a necessidade de intervenção ou configuração por parte do usuário.

As convenções semânticas estão sempre evoluindo e novas estão constantemente sendo adicionadas. Se não houver convenções para sua biblioteca, considere
[adicionar novas.](https://github.com/open-telemetry/semantic-conventions/issues).
Tenha atenção especial aos nomes dos trechos; procure usar nomes significativos e considere a cardinalidade ao defini-los.

Há um atributo [`schema_url`](/docs/specs/otel/schemas/#schema-url) que pode ser usado para registrar qual versão das convenções semânticas está sendo utilizada. Defina este atributo, sempre que possível.

Se você tiver algum feedback ou quiser adicionar uma nova convenção, contribua!
[Slack sobre Instrumentação](https://cloud-native.slack.com/archives/C01QZFGMLQ7) ou o
[repositório da Especificação](https://github.com/open-telemetry/opentelemetry-specification)
são ótimos pontos de partida!

### Definindo trechos

Considere sua biblioteca sob a perspectiva de um usuário e o que ele gostaria de saber sobre o comportamento e a atividade da biblioteca. Como mantenedor da biblioteca, você conhece os detalhes internos, mas o usuário provavelmente estará mais interessado na funcionalidade de sua aplicação do que nos aspectos internos da biblioteca. Pense sobre que informações podem ser úteis para analisar o uso da sua biblioteca e sobre a melhor forma de modelar esses dados. Alguns pontos a considerar são:

- trechos e hierarquias de trechos
- Atributos numéricos em trechos (como alternativa a métricas agregadas)
- Eventos de trechos
- Métricas agregadas

Por exemplo, se sua biblioteca faz requisições a um banco de dados, crie trechos apenas para a requisição lógica ao banco de dados. As requisições físicas pela rede devem ser instrumentadas nas bibliotecas que implementam essa funcionalidade. Além disso, prefira capturar atividades adicionais, como a serialização de objetos/dados, como eventos de trechos, em vez de criar trechos separados para essas atividades.

Siga as convenções semânticas ao definir os atributos dos trechos.

## Quando **não** instrumentar

Algumas bibliotecas são clientes simples que envolvem chamadas de rede. É provável que o OpenTelemetry já tenha uma biblioteca de instrumentação para o cliente RPC subjacente (confira o [registro](/ecosystem/registry/)). Nesse caso, pode não ser necessário instrumentar a biblioteca que serve como camada adicional. Como regra geral, instrumente sua biblioteca apenas no seu próprio nível.

Não instrumente se:

- sua biblioteca for um proxy simples sobre APIs documentadas ou autoexplicativas
- _e_ o OpenTelemetry já tiver instrumentação para as chamadas de rede subjacentes
- _e_ e não houver convenções que sua biblioteca deva seguir para enriquecer a telemetria

Se estiver em dúvida, não instrumente – é possível realizar a instrumentação mais tarde, caso necessário.

Se optar por não instrumentar, pode ser útil fornecer uma forma de configurar os manipuladores do OpenTelemetry para a instância interna do seu cliente RPC. Isso é essencial em linguagens que não suportam instrumentação totalmente automática e ainda útil em outras.

O restante deste documento oferece orientações sobre o que e como instrumentar, se optar por fazer.

## API do OpenTelemetry

O primeiro passo é adicionar a dependência do pacote da API do OpenTelemetry.

O OpenTelemetry possui [dois módulos principais](/docs/specs/otel/overview/) - API e SDK.
A API do OpenTelemetry é um conjunto de abstrações e implementações não operacionais. A menos que a aplicação importe o SDK do OpenTelemetry, a instrumentação não terá efeito e não impactará o desempenho da aplicação.

**As bibliotecas devem usar apenas a API do OpenTelemetry.**

É compreensível estar preocupado com a adição de novas dependências, aqui estão algumas considerações para ajudar a minimizar problemas relacionados a dependências:

- A API de Rastros do OpenTelemetry atingiu estabilidade no início de 2021, segue o
  [Versionamento Semântico 2.0](/docs/specs/otel/versioning-and-stability/) e levamos a estabilidade da API a sério.
- Ao adicionar a dependência, use a versão estável mais antiga da API do OpenTelemetry (1.0.\*) e evite atualizá-la a menos que precise de novos recursos.
- Enquanto sua instrumentação se estabiliza, considere disponibilizá-la como um pacote separado, para que não cause problemas para usuários que não a utilizam. Você pode mantê-la em seu repositório ou [adicioná-la ao OpenTelemetry](https://github.com/open-telemetry/oteps/blob/main/text/0155-external-modules.md#contrib-components),
  para que seja incluída com outras bibliotecas de instrumentação.
- As Convenções Semânticas são [estáveis, mas sujeitas a evolução][]: embora isso
  não cause problemas funcionais, pode ser necessário atualizar sua instrumentação
  de vez em quando. Mantê-la em um plugin de pré-visualização ou no repositório contrib
  do OpenTelemetry pode ajudar a manter as convenções atualizadas sem causar mudanças
  que possam impactar seus usuários.

  [estáveis, mas sujeitas a evolução]: /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

## O que instrumentar

### APIs públicas

As APIs públicas são boas candidatas para rastreamento: os intervalos criados para chamadas de APIs públicas permitem aos utilizadores mapear a telemetria para o código da aplicação, compreender a duração e o resultado das chamadas de biblioteca. Quais chamadas rastrear:

- métodos públicos que fazem chamadas de rede internamente ou operações locais que demoram muito tempo e podem falhar (por exemplo, IO)
- manipuladores que processam requisições ou mensagens

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
    // check out conventions for guidance on trecho names and attributes
    trecho trecho = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // makes trecho active and allows correlating logs and nest trechos
    try (Scope unused = trecho.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            trecho.setStatus(StatusCode.OK);
        }

        if (trecho.isRecording()) {
           // populate response attributes for response codes and other information
        }
    } catch (Exception e) {
        trecho.recordException(e);
        trecho.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        trecho.end();
    }
}
```

Siga as convenções para popular os atributos! Se não houver nenhuma aplicável, verifique
as [convenções gerais](/docs/specs/semconv/general/attributes/).

### Rede aninhada e outros trechos

Chamadas de rede são normalmente rastreadas com autoinstrumentações OpenTelemetry
através da implementação do cliente correspondente.

![Base de dados aninhada e trechos HTTP na Jaeger UI](../nested-span.svg)

Se o OpenTelemetry não suportar o rastreio do seu cliente de rede, use seu próprio critério.
Aqui estão algumas considerações para ajudar:

- O rastreamento de chamadas de rede melhoraria a observabilidade para os usuários ou sua capacidade de apoiá-los?
- Sua biblioteca é um módulo sobre uma API RPC pública e documentada? Os usuários precisariam obter suporte do serviço subjacente em caso de problemas?
  - instrumente a biblioteca e certifique-se de rastrear tentativas de rede individuais
- Rastrear essas chamadas com trechos seria muito verboso? Ou teria um impacto perceptível no desempenho?
  - use logs com níveis de verbosidade ou eventos de trecho: os logs podem ser correlacionados ao pai (chamadas da API pública), enquanto os eventos de trecho devem ser configurados no trecho da API pública.
  - se forem necessários trechos (para carregar e propagar o contexto de rastreamento único), coloque-os atrás de uma opção de configuração e desative-os por padrão.

Se o OpenTelemetry já suporta o rastreamento das suas chamadas de rede, provavelmente você não vai querer duplicar isso. Pode haver algumas exceções:

- para dar suporte aos usuários sem autoinstrumentação (que pode não funcionar em certos ambientes ou os usuários podem ter preocupações com monkey-patching)
- para permitir protocolos personalizados (legados) de correlação e propagação de contexto com o serviço subjacente
- enriquecer os trechos RPC com informações essenciais específicas da biblioteca/serviço que não são cobertas pela autoinstrumentação

AVISO: A solução genérica para evitar duplicação está em desenvolvimento 🚧.

### Eventos

Rastros são um tipo de sinal que suas aplicações podem emitir. Eventos (ou logs) e rastros se complementam, não se duplicam. Sempre que você tiver algo que deve ter um nível de verbosidade, logs são uma escolha melhor do que rastros.

É provável que sua aplicação já use logging ou algum módulo similar. Seu módulo pode já ter integração com OpenTelemetry — para descobrir, consulte o [registro](/ecosystem/registry/). As integrações geralmente adicionam o contexto de rastreamento ativo em todos os logs, permitindo que os usuários os correlacionem.

Se sua linguagem e ecossistema não têm suporte comum para logging, use [eventos de trecho][] para compartilhar detalhes adicionais da aplicação. Eventos podem ser mais convenientes se você quiser adicionar atributos também.

Como regra geral, use eventos ou logs para dados detalhados em vez de trechos. Sempre anexe eventos à instância de trecho criada pela sua instrumentação. Evite usar o trecho ativo, se possível, pois você não controla a que ele se refere.

## Propagação de contexto

### Extraindo contexto

Se você trabalha em uma biblioteca ou serviço que recebe chamadas de upstream, como um framework web ou um consumidor de mensagens, você deve extrair o contexto da solicitação/mensagem recebida. O OpenTelemetry fornece a API `Propagator`, que oculta padrões específicos de propagação e lê o contexto de rastreamento a partir da comunicação. Em um caso de uma única resposta, há apenas um contexto na comunicação, que se torna o pai do novo trecho criado pela biblioteca.

Depois de criar um trecho, você deve passar o novo contexto de rastreamento para o código da aplicação (função de retorno ou manipulador), tornando o trecho ativo; se possível, você deve fazer isso de forma explícita.

```java
// extract the context
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
trecho trecho = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// make trecho active so any nested telemetry is correlated
try (Scope unused = trecho.makeCurrent()) {
  userCode();
} catch (Exception e) {
  trecho.recordException(e);
  trecho.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  trecho.end();
}
```

Aqui estão os
[exemplos completos de extração de contexto em Java](/docs/languages/java/instrumentation/#context-propagation),
confira a documentação do OpenTelemetry da sua linguagem.

No caso de um sistema de mensageria, você pode receber mais de uma mensagem de uma só vez. As mensagens recebidas se tornam
[_links_](/docs/languages/java/instrumentation/#create-spans-with-links) no trecho que você cria. Consulte as
[convenções de mensageria](/docs/specs/semconv/messaging/messaging-spans/) para mais detalhes (AVISO: as convenções de mensageria estão
[em construção](https://github.com/open-telemetry/oteps/pull/173) 🚧).

### Injetando contexto

Quando você faz uma chamada de saída, geralmente você vai querer propagar o contexto para o serviço subsequente. Nesse caso, você deve criar um novo trecho para rastrear a chamada de saída e usar a API `Propagator` para injetar o contexto na mensagem. Pode haver outros casos em que você queira injetar contexto, por exemplo, ao criar mensagens para processamento assíncrono.

```java
trecho trecho = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// make trecho active so any nested telemetry is correlated
// even network calls might have nested layers of trechos, logs or events
try (Scope unused = trecho.makeCurrent()) {
  // inject the context
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  trecho.recordException(e);
  trecho.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  trecho.end();
}
```

Aqui está o
[exemplo completo de injeção de contexto em Java](/docs/languages/java/instrumentation/#context-propagation).

Pode haver algumas exceções:

- o serviço subsequente não suporta metadados ou proíbe campos desconhecidos
- o serviço subsequente não define protocolos de correlação. É possível que alguma versão futura do serviço suporte a propagação de contexto compatível? Neste caso, injete o contexto!
- o serviço subsequente suporta um protocolo de correlação personalizado.
  - faça o melhor possível com um propagador personalizado: use o contexto de rastreamento do OpenTelemetry se for compatível.
  - ou gere e adicione IDs de correlação personalizados no trecho.

### In-process

- **Torne seus trechos ativos** (também conhecidos como atuais): isso permite correlacionar trechos com logs e quaisquer autoinstrumentações aninhadas.
- Se a biblioteca tiver uma noção de contexto, suporte a propagação opcional de contexto de rastreamento explícito _além_ dos trechos ativos.
  - coloque os trechos (contexto de rastreamento) criados pela biblioteca explicitamente no contexto e documente como acessá-los.
  - permita que os usuários passem o contexto de rastreamento no seu contexto.
- Dentro da biblioteca, propague o contexto de rastreamento explicitamente - os trechos ativos podem mudar durante as chamadas de retorno!
  - capture o contexto ativo dos usuários na superfície da API pública assim que possível e use-o como contexto pai para seus trechos.
  - passe o contexto ao redor e adicione atributos, exceções e eventos nas instâncias explicitamente propagadas.
  - isso é essencial se você iniciar threads explicitamente, realizar processamento em segundo plano ou outras atividades que possam ser afetadas pelas limitações de fluxo de contexto assíncrono na sua linguagem.

## Misc

### Registro de instrumentação

Por favor, adicione sua biblioteca de instrumentação ao
[registro do OpenTelemetry](/ecosystem/registry/), para que os usuários possam encontrá-la.

### Desempenho

A API do OpenTelemetry é autônoma e muito eficiente quando não há SDK na
aplicação. Quando o SDK do OpenTelemetry é configurado, ele
[consome recursos vinculados](/docs/specs/otel/performance/).

Aplicações do mundo real, especialmente em grande escala, frequentemente têm a amostragem baseada em cabeçalho configurada. Trechos descartados são baratos e você pode verificar se o trecho está gravando, para evitar alocações extras e cálculos potencialmente caros ao popular atributos.

```java
// some attributes are important for sampling, they should be provided at creation time
trecho trecho = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// other attributes, especially those that are expensive to calculate
// should be added if trecho is recording
if (trecho.isRecording()) {
    trecho.setAttribute("db.statement", sanitize(query.statement()))
}
```

### Tratamento de erros

A API do OpenTelemetry é tolerante em tempo de execução - não falha em argumentos inválidos, nunca lança exceções e engole as exceções. Dessa forma, os problemas de instrumentação não afetam a lógica da aplicação. Teste a instrumentação para identificar problemas que o OpenTelemetry oculta em tempo de execução.

### Testes

Como o OpenTelemetry possui uma variedade de autoinstrumentações, é útil testar como sua instrumentação interage com outras telemetrias: solicitações recebidas, solicitações enviadas, logs, etc. Use uma aplicação típica, com frameworks e bibliotecas populares e com todo o rastreamento ativado ao testar sua instrumentação. Verifique como bibliotecas semelhantes à sua são exibidas.

Para testes unitários, você geralmente pode usar mocks ou fakes `SpanProcessor` e `SpanExporter`.

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // run test ...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> trechos) {
    exportedSpans.addAll(trechos);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[bibliotecas de instrumentação]: /docs/specs/otel/overview/#instrumentation-libraries
[eventos de trecho]: /docs/specs/otel/trace/api/#add-events
