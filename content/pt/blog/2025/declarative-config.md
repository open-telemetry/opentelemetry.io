---
title:
  'A jornada da configuração declarativa: Por que levou 5 anos para ignorar os
  endpoints de verificação de integridade no rastreamento'
linkTitle: Jornada de configuração declarative
date: 2025-10-17
author: >-
  [Gregor Zeitlinger](https://github.com/zeitlinger)(Grafana Labs), [Jay
  DeLuca](https://github.com/jaydeluca) (Grafana Labs), [Marylia
  Gutierrez](https://github.com/maryliag) (Grafana Labs)
default_lang_commit: b4f82102ae2a6850e29c1facc26d34f77093e976
drifted_from_default: true
cSpell:ignore: Dotel marylia otelconf zeitlinger
---

Uma das solicitações de recursos mais persistentes e populares para o
OpenTelemetry Java nos últimos anos tem sido a capacidade de [eliminar com
eficiência trechos para endpoints de verificação de
integridade][drop-spans-issue] – ou quaisquer outros endpoints que sejam de
baixo valor ou custosos. Essa questão foi levantada pela primeira vez em agosto
de 2020, mas uma solução abrangente permaneceu indefinida por um tempo
surpreendentemente longo. Por que demoramos cinco anos para resolver esse
problema aparentemente simples? A resposta está nos princípios fundamentais do
sistema de configuração do OpenTelemetry e na jornada em direção a uma abordagem
mais robusta e flexível: a configuração declarativa.

Desde o início, o OpenTelemetry se baseia em variáveis ​​de ambiente para
configuração, uma escolha motivada por sua disponibilidade universal em todas as
linguagens e facilidade de análise. No entanto, à medida que a necessidade de
casos de uso de configuração mais complexos cresceu, as limitações de variáveis
​​de ambiente simples baseadas em strings tornaram-se cada vez mais aparentes,
tornando as configurações avançadas complexas e difíceis de gerenciar.

Entra em cena a configuração declarativa, uma evolução poderosa que utiliza
arquivos YAML para definir as configurações do OpenTelemetry. Essa mudança
permite a leitura de dados de qualquer fonte em formato de árvore, transformando
fundamentalmente a forma como abordamos configurações complexas. Ao longo deste
artigo, exploraremos como a configuração declarativa oferece uma solução
elegante para os desafios do passado e demonstraremos seu impacto imediato em
casos de uso práticos, como a exclusão de verificação de integridade em Java.

## Guia de primeiros passos {#getting-started}

O arquivo de configuração é independente de linguagem de programação, portanto,
depois de criar um arquivo, você pode usá-lo para todos os seus SDKs. As únicas
exceções são os parâmetros com o nome da linguagem específica que são relevantes
apenas para aquela linguagem (por exemplo,
`instrumentation/development.java.spring_batch` do Java Spring). Lembre-se de
que a configuração declarativa é **experimental**, portanto, as coisas ainda
podem mudar.

O exemplo a seguir é um arquivo de configuração básico que você pode usar para
começar:

```yaml
file_format: '1.0-rc.1'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # vai adicionar "service.instance.id" e "service.name" do OTEL_SERVICE_NAME

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
```

Tudo o que você precisa fazer é passar
`OTEL_EXPERIMENTAL_CONFIG_FILE=/path/to/otel-config.yaml` para a aplicação para
ativar a opção de configuração declarativa experimental. Esta variável só
funciona no agente Java e no JavaScript no momento.

## Configuração declarativa em Java {#declarative-configuration-in-java}

Vejamos agora a implementação da configuração declarativa no ecossistema Java.
Como linguagem pioneira nessa área, o agente Java 2.21+ agora oferece suporte
total à configuração declarativa, com a maioria das instrumentações e recursos
já funcionais. Estamos trabalhando para incorporar os recursos restantes ao
longo de 2026, e você pode acompanhar nosso progresso no [quadro do
projeto][java-project] e ver a [lista de recursos ainda não
suportados][list-not-supported].

Dependendo se você está começando do zero ou migrando do uso de variáveis ​​de
ambiente, há alguns recursos que você pode aproveitar:

- O exemplo de arquivo de configuração básico (independente de linguagem) da
  seção anterior é a maneira mais rápida de começar quando você não precisa de
  mais personalizações.
- O [arquivo de configuração de migração][migration-file] mapeia as variáveis
  ​​de ambiente antigas para o esquema YAML, permitindo uma substituição
  imediata para usuários que usam _workloads_ já configurados com variáveis ​​de
  ambiente.
- O [arquivo de configuração completo][full-file] _("kitchen sink")_ mostra o
  esquema completo, anotado com documentação como comentários. Isso é útil para
  usuários que desejam ver todas as opções disponíveis e seus padrões.

Todos os arquivos acima funcionam para qualquer linguagem que ofereça suporte à
configuração declarativa.

Além disso, há muitas configurações específicas do agente Java que vão para a
seção de instrumentação do seu arquivo de configuração. Por exemplo, se você
tiver a propriedade de sistema
`otel.instrumentation.spring-batch.experimental.chunk.new-trace` em sua
aplicação, poderá criar o arquivo de configuração declarativo removendo o
prefixo `otel.instrumentation`, dividindo em . e convertendo - para \_.

```yaml
file_format: '1.0-rc.1'

# ...

instrumentation/development:
  java:
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

Com essa configuração implementada, os desenvolvedores podem continuar a usar
sua instrumentação Java normalmente, enviando dados de telemetria para o
_backend_ de observabilidade escolhido. Além disso, o arquivo de configuração
declarativo oferece flexibilidade para expandir e adicionar mais parâmetros
conforme necessário, permitindo um controle altamente personalizado e detalhado
sobre a configuração de observabilidade.

## Exclusão de verificação de integridade {#health-check-exclusion}

Como mencionado na introdução, uma das solicitações de recursos mais populares
na comunidade Java era a possibilidade de excluir verificações de integridade
(ou outros recursos sem importância ou com ruído) de gerarem rastros.

Para isso, você precisa adicionar um novo bloco `sampler` à sua configuração
`tracer_provider`, conforme mostrado abaixo:

```yaml
file_format: '1.0-rc.1'

# ... o resto da configuração ....

tracer_provider:
  # Configurar amostragem para excluir _endpoints_ de verificação de integridade.
  sampler:
    rule_based_routing:
      fallback_sampler:
        always_on:
      span_kind: SERVER
      rules:
        # Ação a ser tomada quando a regra corresponder. Deve ser DROP ou RECORD_AND_SAMPLE.
        - action: DROP
          # O atributo do trecho a ser correspondido.
          attribute: url.path
          # O padrão ao qual comparar o atributo do trecho.
          pattern: /actuator.*
  # ... o resto da configuração do tracer_provider ...
```

Consulte a [documentação do Java Sampler][java-sampler] para obter mais detalhes
sobre as opções disponíveis.

Experimente você mesmo:

1. Salve [a configuração completa][complete-config]
2. Execute o agente Java com
   `-Dotel.experimental.config.file=/path/to/otel-config.yaml`

## Disponibilidade {#availability}

Depois de ler sobre configuração declarativa, você pode estar se perguntando
onde ela está disponível e como pode começar a usá-la. Você pode encontrar
orientações sobre como começar e quais linguagens são suportadas na
[documentação][declarative-docs]. No momento da criação deste artigo, Java é
totalmente compatível e PHP, JavaScript e Go são parcialmente compatíveis. Para
ver o status mais recente, consulte a [matriz de
conformidade][compliance-matrix] ou a _issue_ de [implementações em diferentes
linguagens][tracking-issue].

### Java {#java}

Conforme descrito anteriormente, a configuração declarativa em
[Java][java-declarative-config] é experimental, mas está pronta para uso. Use o
exemplo discutido anteriormente para definir sua nova configuração. Se tiver
dúvidas ou _feedback_, entre em contato pelo [`#otel-java`][slack-java] no Slack
do CNCF.

_Observação para mantenedores de outras linguagens: É útil criar um módulo de
ponte que adapte as configurações declarativas e as variáveis ​​de ambiente a
uma interface comum. Para Java, esta é a [Declarative Config
Bridge][java-bridge](Ponte de Configuração Declarativa)._

### JavaScript {#javascript}

A implementação no SDK do JavaScript está atualmente em desenvolvimento. Um novo
pacote chamado [opentelemetry-configuration][js-package] foi criado e lida tanto
com variáveis ​​de ambiente quanto com configuração declarativa. Com essa
abordagem, o usuário não precisa alterar sua instrumentação ao alternar entre
variáveis ​​de ambiente e arquivo de configuração, pois o novo pacote lida com
isso e retorna o mesmo modelo de configuração para ambos os casos. Atualmente,
este pacote de configuração está sendo adicionado a outros pacotes de
instrumentação, para que possam aproveitar a configuração declarativa. Se tiver
dúvidas, entre em contato pelo [`#otel-js`][slack-js] no Slack do CNCF.

### PHP {#php}

A implementação do PHP é parcialmente compatível e você pode começar a usá-la
[inicializando a partir do seu arquivo de configuração][php-docs]. Para obter
ajuda ou _feedback_, entre em contato pelo [`#otel-php`][slack-php] no Slack do
CNCF.

### Go {#go}

Go possui uma [implementação parcial][go-package] de configuração declarativa.
Cada versão de esquema suportada possui seu próprio diretório de pacotes
correspondente. Por exemplo, importar
`go.opentelemetry.io/contrib/otelconf/v0.3.0` fornece o código que suporta a
versão 0.3.0 do esquema de configuração. Você pode encontrar todas as versões
disponíveis no [índice de pacotes][go-package-index]. Caso tenha dúvidas sobre
como usá-lo, entre em contato com [`#otel-go`][slack-go] no Slack do CNCF.

## A jornada {#the-journey}

Então, por que levamos cinco anos para ignorar os endpoints de verificação de
integridade no rastreamento?

A jornada rumo à configuração declarativa e, consequentemente, a solução para a
exclusão de verificações de integridade, destaca um princípio fundamental do
OpenTelemetry: construir soluções sustentáveis ​​por meio de especificações
rigorosas.

Desde o início, a dependência do OpenTelemetry em variáveis ​​de ambiente,
embora universalmente disponível, mostrou-se cada vez mais complexa para
configurações avançadas. Novas variáveis ​​de ambiente acabaram sendo
desautorizadas, criando uma lacuna que uma solução mais robusta precisava
preencher.

A substituição, como apresentamos neste artigo, é a configuração declarativa.
Elaborar e concordar com a sintaxe e a semântica precisas foi um processo
demorado e, às vezes, exaustivo. Por exemplo, discutimos diversas propostas
sobre como as variáveis ​​de ambiente poderiam ser incorporadas até chegarmos à
solução atual de usar `${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}`.

Este processo serve como um poderoso estudo de caso sobre como a comunidade
OpenTelemetry opera. É uma prova do estabelecimento de consenso, do fomento à
colaboração e do esforço coletivo necessário para introduzir novos recursos
significativos e impulsionar sua implementação em diversos projetos.

## O que vem a seguir para a configuração declarativa? {#Whats-next-for-declarative-configuration}

A jornada da configuração declarativa está longe de terminar. Nosso foco atual
envolve um esforço substancial para expandir o suporte em várias linguagens, o
que é crucial para garantir que os desenvolvedores, independentemente de suas
ferramentas preferidas, possam aproveitar os benefícios de uma abordagem
declarativa.

Estamos muito interessados ​​no _feedback_ dos usuários à medida que continuamos
a desenvolver e refinar esses recursos. Incentivamos você a começar a
experimentar as implementações atuais e a comunicar quaisquer funcionalidades
ausentes, pontos problemáticos ou áreas que precisam de melhoria. Essa abordagem
colaborativa nos ajudará a priorizar os esforços de desenvolvimento e a garantir
que as soluções que criamos realmente atendam às necessidades da comunidade.
Compartilhe seu _feedback_ ou perguntas usando o canal
[`#otel-config-file`][slack-config] do Slack do CNCF.

Além de fornecer _feedback_, existem outras maneiras de se envolver e contribuir
para o crescimento da configuração declarativa. Cada SDK do OpenTelemetry possui
[Grupos de Interesse Especial (SIGs)][sigs] dedicados à sua implementação.
Participar desses SIGs oferece um canal direto para entender o estado atual do
desenvolvimento, participar de discussões e identificar oportunidades de
contribuição. Seja por meio de contribuições de código, melhorias na
documentação ou simplesmente compartilhando suas experiências, cada contribuição
ajuda a avançar o ecossistema de configuração declarativa. Sua participação é
fundamental para promover um conjunto robusto e versátil de ferramentas para o
desenvolvimento de aplicações modernas.

Esperamos ouvir de você!

## Recursos adicionais {#additional-resources}

Para saber mais sobre o trabalho em andamento na configuração declarativa, aqui
estão alguns recursos adicionais para explorar:

- [_Simplifying OpenTelemetry with Configuration - Alex Boten, Honeycomb & Jack
  Berg, New Relic_][yt-config]
- [Documentação para configuração declarativa](/docs/languages/sdk-configuration/declarative-configuration/)
- [Repositório para configuração declarativa][declarative-repo]

[drop-spans-issue]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/issues/1060
[java-project]: https://github.com/orgs/open-telemetry/projects/151
[migration-file]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/sdk-migration-config.yaml
[full-file]:
  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml
[java-sampler]:
  https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/samplers
[complete-config]:
  https://gist.github.com/zeitlinger/09585b1ab57c454f87e6dcb9a6f50a5c
[declarative-docs]: /docs/languages/sdk-configuration/declarative-configuration
[compliance-matrix]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#declarative-configuration
[java-declarative-config]: /docs/zero-code/java/agent/declarative-configuration/
[slack-java]: https://cloud-native.slack.com/archives/C014L2KCTE3
[slack-js]: https://cloud-native.slack.com/archives/C01NL1GRPQR
[slack-php]: https://cloud-native.slack.com/archives/C01NFPCV44V
[slack-go]: https://cloud-native.slack.com/archives/C01NPAXACKT
[slack-config]: https://cloud-native.slack.com/archives/C0476L7UJT1
[java-bridge]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/declarative-config-bridge
[js-package]:
  https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-configuration
[php-docs]:
  https://github.com/open-telemetry/opentelemetry-php/tree/main/src/Config/SDK#initialization-from-configuration-file
[go-package]:
  https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/otelconf
[go-package-index]: https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf
[sigs]:
  https://github.com/open-telemetry/community?tab=readme-ov-file#implementation-sigs
[yt-config]: https://www.youtube.com/watch?v=u6svjtGpXO4
[declarative-repo]:
  https://github.com/open-telemetry/opentelemetry-configuration
[list-not-supported]:
  /docs/zero-code/java/agent/declarative-configuration/#not-yet-supported-features
[tracking-issue]:
  https://github.com/open-telemetry/opentelemetry-configuration/issues/100
