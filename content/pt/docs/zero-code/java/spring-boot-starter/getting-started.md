---
title: Introdução
weight: 20
cSpell:ignore: springboot
---
{{% alert title="Note" color="info" %}}
Você também pode utilizar o [agente do Java](../../agent) para instrumentar a sua aplicação Spring Boot. Para verificar os prós e contras, veja [Java instrumentação sem código](..).
{{% /alert %}}
### Compatibilidade
O _starter_ do OpenTelemetry Spring Boot funciona com Spring Boot 2.6+, 3.1+ e
aplicações Spring Boot com imagem nativa. O repositório
[opentelemetry-java-examples/spring-native](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native)
contém um exemplo de uma aplicação Spring Boot com imagem nativa que foi instrumentada utilizando o _starter_ do OpenTelemetry Spring Boot.
### Gerenciamento de dependências
O _Bill of Material_
([BOM](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms))
garante que as versões das dependências (incluindo as transitivas) estejam alinhadas.
Para garantir o alinhamento das versões entre todas as dependências do OpenTelemetry, você deve importar o `opentelemetry-instrumentation-bom` BOM quando estiver utilizando o  _starter_ do OpenTelemetry.
{{% alert title="Note" color="info" %}}
Ao utilizar o Maven, importe os BOMs do OpenTelemetry antes de importar quaisquer outros BOMs no seu projeto. Por exemplo, se você importar o BOM do `spring-boot-dependencies`, você deve declará-lo depois dos BOMs do OpenTelemetry.
O Gradle seleciona a
[última versão](https://docs.gradle.org/current/userguide/dependency_resolution.html#sec:version-conflict)
de uma dependência quando houver múltiplos BOMs, não sendo relevante a ordem dos BOMs.
{{% /alert %}}
O exemplo a seguir mostra como importar os BOMs do OpenTelemetry utilizando o Maven:
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.opentelemetry.instrumentation</groupId>
            <artifactId>opentelemetry-instrumentation-bom</artifactId>
            <version>{{% param vers.instrumentation %}}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```
Com o Gradle e Spring Boot, você possui duas maneiras de importar um BOM.
Você pode utilizar o suporte do BOM nativo do Gradle adicionando `dependencies`:
```kotlin
import org.springframework.boot.gradle.plugin.SpringBootPlugin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
}
dependencies {
  implementation(platform(SpringBootPlugin.BOM_COORDINATES))
  implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))
}
```
Outra maneira de configurar com o Gradle é utilizando o plugin `io.spring.dependency-management` e importando os BOMs em `dependencyManagement`:
```kotlin
plugins {
  id("java")
  id("org.springframework.boot") version "3.2.O"
  id("io.spring.dependency-management") version "1.1.0"
}
dependencyManagement {
  imports {
    mavenBom("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}")
  }
}
```
{{% alert title="Note" color="info" %}}
Tenha cuidado para não misturar as diferentes formas de configurar as coisas com o Gradle.
Por exemplo, não utilize
`implementation(platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:{{% param vers.instrumentation %}}"))`
com o plugin `io.spring.dependency-management`.
{{% /alert %}}
#### Dependência do OpenTelemetry Starter
Adicione a dependência fornecida abaixo para habilitar o _starter_ do OpenTelemetry.
O _starter_ do OpenTelemetry utiliza o OpenTelemetry Spring Boot
[autoconfiguration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration).
{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}
```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
  </dependency>
</dependencies>
```
{{% /tab %}} {{% tab header="Gradle (`gradle.build`)" lang=Gradle %}}
```kotlin
dependencies {
    implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter")
}
```
{{% /tab %}} {{< /tabpane>}}
