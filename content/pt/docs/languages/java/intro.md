---
title: Introdução ao OpenTelemetry Java
description: Introdução ao ecossistema OpenTelemetry Java
weight: 9
default_lang_commit: 5472965d7714ed898b008d41fa97561591320196
cSpell:ignore: boms
---

OpenTelemetry Java é o conjunto de ferramentas de observabilidade do
OpenTelemetry para o ecossistema Java. Em alto nível, consiste na API, no SDK e
na instrumentação.

Esta página apresenta o ecossistema, com uma [visão geral](#overview)
conceitual, um guia para [navegar pela documentação](#navigating-the-docs), uma
lista de [repositórios](#repositories) com detalhes importantes sobre
lançamentos e artefatos.

## Visão geral {#overview}

A API é um conjunto de classes e interfaces para registrar telemetria em
sinais-chave de observabilidade. Ela suporta múltiplas implementações, incluindo
uma implementação minimalista _Noop_ de baixo _overhead_ (pronunciada "no-op",
de "no operation", significando "sem operação") e uma implementação de
referência de SDK fornecida de forma nativa. Ela foi projetada para ser
utilizada como dependência direta por bibliotecas, _frameworks_ e responsáveis
por aplicações que desejam adicionar instrumentação. Possui fortes garantias de
compatibilidade retroativa, nenhuma dependência transitiva e suporte ao Java 8+.

O SDK é a implementação de referência integrada da API, responsável por
processar e exportar a telemetria produzida pelas chamadas da API de
instrumentação. Configurar o SDK para processar e exportar adequadamente é um
passo essencial para integrar o OpenTelemetry a uma aplicação. O SDK possui
opções de configuração automática e programática.

A instrumentação registra telemetria através da API. Existem várias categorias
de instrumentação, incluindo: agente Java sem código, inicializador do _Spring
Boot_ sem código, biblioteca, nativa, manual e _shims_.

Para uma visão geral independente de linguagem, consulte
[conceitos do OpenTelemetry](/docs/concepts/).

## Navegando pela documentação {#navigating-the-docs}

A documentação do OpenTelemetry Java está organizada da seguinte forma:

- [Primeiros Passos com Exemplos](../getting-started/): Um exemplo rápido para
  começar a utilizar o OpenTelemetry Java, demonstrando a integração do agente
  Java OpenTelemetry em uma aplicação web simples.
- [Ecossistema de instrumentação](../instrumentation/): Um guia para o
  ecossistema de instrumentação do OpenTelemetry Java. Este é um recurso chave
  para autores de aplicações que desejam integrar o OpenTelemetry Java em suas
  aplicações. Aprenda sobre as diferentes categorias de instrumentação e decida
  qual é a certa para você.
- [Registrar Telemetria com a API](../api/): Uma referência técnica para a API
  do OpenTelemetry, explorando todos os aspectos chave da API com exemplos de
  código funcionais. A maioria dos usuários usará esta página como uma
  enciclopédia, consultando o índice de seções conforme necessário, em vez de
  ler do início ao fim.
- [Gerenciar Telemetria com o SDK](../sdk/) Uma referência técnica para o SDK do
  OpenTelemetry, explorando todos os pontos de extensão de plugins do SDK e a
  API de configuração programática, com exemplos de código funcionais. Assim
  como a anterior, esta página costuma ser utilizada como uma enciclopédia.
- [Configurar o SDK](../configuration/): Uma referência técnica para configurar
  o SDK, com foco na configuração automática sem código. Inclui uma referência
  de todas as variáveis de ambiente e propriedades do sistema suportadas para
  configurar o SDK. Também explora todos os pontos de personalização
  programática com exemplos de código. A maioria dos usuários usará esta página
  como uma enciclopédia.
- **Saiba Mais**: Recursos complementares, incluindo [exemplos](../examples/)
  completos, [Javadoc](../api/), [registro](../registry/) de componentes e uma
  [referência de desempenho](/docs/zero-code/java/agent/performance/).

## Repositórios {#repositories}

O código-fonte do OpenTelemetry Java está organizado em vários repositórios:

| Repositório | Descrição | ID do Grupo | Versão atual | Cadência de lançamento
|\n|

---

## |

## | ---------------------------------- | ------------------------------------ |

| | [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java) |
Componentes principais da API e do SDK | `io.opentelemetry` |
`{{% param vers.otel %}}` |
[Sexta-feira após a primeira segunda-feira do mês](https://github.com/open-telemetry/opentelemetry-java/blob/main/RELEASING.md#release-cadence)
| |
[opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)
| Instrumentação mantida pelo OpenTelemetry, incluindo o agente Java
OpenTelemetry | `io.opentelemetry.instrumentation` |
`{{% param vers.instrumentation %}}` |
[Quarta-feira após a segunda segunda-feira do mês](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/RELEASING.md#release-cadence)
| |
[opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)
| Componentes mantidos pela comunidade que não se encaixam no escopo expresso de
outros repositórios | `io.opentelemetry.contrib` | `{{% param vers.contrib %}}`
|
[Sexta-feira após a segunda segunda-feira do mês](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/RELEASING.md#release-cadence)
| |
[semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)
| Código gerado para convenções semânticas | `io.opentelemetry.semconv` |
`{{% param vers.semconv %}}` | Segue os lançamentos de
[semantic-conventions](https://github.com/open-telemetry/semantic-conventions) |
|
[opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)
| _Bindings_ gerados para OTLP | `io.opentelemetry.proto` | `1.3.2-alpha` |
Segue os lançamentos de
[opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto) | |
[opentelemetry-java-examples](https://github.com/open-telemetry/opentelemetry-java-examples)
| Exemplos de código completos demonstrando uma variedade de padrões usando a
API, SDK e instrumentação | n/a | n/a | n/a |

`opentelemetry-java`, `opentelemetry-java-instrumentation` e
`opentelemetry-java-contrib` publicam grandes catálogos de artefatos. Consulte
os repositórios para mais detalhes ou veja a coluna "Dependências gerenciadas"
na tabela de [Declaração de Materiais](#dependencies-and-boms) para conferir a
lista completa de dependências gerenciadas.

Como regra geral, artefatos publicados a partir do mesmo repositório possuem a
mesma versão. A exceção é o `opentelemetry-java-contrib`, que pode ser entendido
como um conjunto de projetos independentes que compartilham o mesmo repositório
para aproveitar ferramentas compartilhadas. Por enquanto, os artefatos do
`opentelemetry-java-contrib` estão alinhados, mas isso é uma coincidência e vai
mudar no futuro.

Os repositórios têm uma cadência de lançamento que reflete sua estrutura de
dependência em alto nível:

- `opentelemetry-java` é o núcleo e lança primeiro a cada mês.
- `opentelemetry-java-instrumentation` depende de `opentelemetry-java` e é
  publicado logo em seguida.
- `opentelemetry-java-contrib` depende de `opentelemetry-java-instrumentation` e
  `opentelemetry-java` e é publicado por último.
- Embora `semantic-conventions-java` seja uma dependência de
  `opentelemetry-java-instrumentation`, é um artefato independente e possui seu
  próprio cronograma de lançamento.

## Dependências e declaração de materiais (BOMs) {#dependencies-and-boms}

Uma
[declaração de materiais](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Bill_of_Materials_.28BOM.29_POMs),
ou BOM (_bill of materials_) de forma abreviada, é um artefato que ajuda a
manter alinhadas as versões de dependências relacionadas. O OpenTelemetry Java
publica várias BOMs para diferentes casos de uso, listados abaixo em ordem
crescente de escopo. Recomendamos fortemente o uso de uma BOM.

{{% alert %}} Como as BOMs são hierárquicas, adicionar dependências em múltiplas
BOMs não é recomendado, pois é redundante e pode levar a resoluções de versão de
dependência não intuitivas. {{% /alert %}}

Clique no link na coluna "Dependências gerenciadas" para ver uma lista dos
artefatos gerenciados pela BOM.

| Descrição                                                                                         | Repositório                          | ID do grupo                        | ID do artefato                            | Versão atual                               | Dependências gerenciadas                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| Artefatos principais estáveis de API e SDK                                                        | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom`                       | `{{% param vers.otel %}}`                  | [pom.xml mais recente][opentelemetry-bom]                       |
| Artefatos principais experimentais de API e SDK, incluindo todos de `opentelemetry-bom`           | `opentelemetry-java`                 | `io.opentelemetry`                 | `opentelemetry-bom-alpha`                 | `{{% param vers.otel %}}-alpha`            | [pom.xml mais recente][opentelemetry-bom-alpha]                 |
| Artefatos estáveis de instrumentação, incluindo todos de `opentelemetry-bom`                      | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom`       | `{{% param vers.instrumentation %}}`       | [pom.xml mais recente][opentelemetry-instrumentation-bom]       |
| Artefatos experimentais de instrumentação, incluindo todos de `opentelemetry-instrumentation-bom` | `opentelemetry-java-instrumentation` | `io.opentelemetry.instrumentation` | `opentelemetry-instrumentation-bom-alpha` | `{{% param vers.instrumentation %}}-alpha` | [pom.xml mais recente][opentelemetry-instrumentation-alpha-bom] |

O trecho de código a seguir demonstra como adicionar uma dependência de BOM, com
`{{bomGroupId}}`, `{{bomArtifactId}}` e `{{bomVersion}}` referindo-se,
respectivamente, às colunas "ID do grupo", "ID do artefato" e "Versão atual" da
tabela.

{{< tabpane text=true >}} {{% tab "Gradle" %}}

```kotlin
dependencies {
  implementation(platform("{{bomGroupId}}:{{bomArtifactId}}:{{bomVersion}}"))
  // Adiciona uma dependência em um artefato cuja versão é gerenciada pela BOM
  implementation("io.opentelemetry:opentelemetry-api")
}
```

{{% /tab %}} {{% tab Maven %}}

```xml
<project>
  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>{{bomGroupId}}</groupId>
        <artifactId>{{bomArtifactId}}</artifactId>
        <version>{{bomVersion}}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>
  <!-- Adiciona uma dependência em um artefato cuja versão é gerenciada pela BOM -->
  <dependencies>
    <dependency>
      <groupId>io.opentelemetry</groupId>
      <artifactId>opentelemetry-api</artifactId>
    </dependency>
  </dependencies>
</project>
```

{{% /tab %}} {{< /tabpane >}}

[opentelemetry-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom/{{% param vers.otel %}}/opentelemetry-bom-{{% param vers.otel %}}.pom>
[opentelemetry-bom-alpha]:
  <https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-bom-alpha/{{% param vers.otel %}}-alpha/opentelemetry-bom-alpha-{{% param vers.otel %}}-alpha.pom>
[opentelemetry-instrumentation-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom/{{% param vers.instrumentation %}}/opentelemetry-instrumentation-bom-{{% param vers.instrumentation %}}.pom>
[opentelemetry-instrumentation-alpha-bom]:
  <https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-instrumentation-bom-alpha/{{% param vers.instrumentation %}}-alpha/opentelemetry-instrumentation-bom-alpha-{{% param vers.instrumentation %}}-alpha.pom>
