---
title: Logs
description: Um registro de um evento.
weight: 3
default_lang_commit: 7c0e4db0b6c39b0ca0e7efb17df5610d1b77b8a3
cSpell:ignore: filelogreceiver semistructured transformprocessor
---

Um **log** é um registro de texto com marcação de data e hora, que pode ser
tanto estruturado (recomendado) quanto não estruturado, e com metadados
opcionais. Dentre os sinais de telemetria, os logs têm uma história mais
consolidada. A maioria das linguagens de programação possuem recursos nativos ou
bibliotecas bem conhecidas e amplamente utilizadas para gerar logs.

## Logs do OpenTelemetry {#opentelemetry-logs}

O OpenTelemetry não possui uma especificação de API ou SDK própria para gerar
logs. Em vez disso, os logs no OpenTelemetry são os logs que você já possui, que
foram gerados por um framework de _logging_ ou componente de infraestrutura. Os
SDKs e a autoinstrumentação do OpenTelemetry utilizam vários componentes para
correlacionar automaticamente logs com [rastros](../traces).

O suporte do OpenTelemetry para logs é projetado para ser totalmente compatível
com o que você já possui, oferecendo a capacidade de adicionar contextos a esses
logs e uma série de ferramentas para analisar e manipular logs em um formato
comum, abrangendo diversas fontes.

### Logs do OpenTelemetry no OpenTelemetry Collector {#opentelemetry-logs-in-the-opentelemetry-collector}

O [OpenTelemetry Collector](/docs/collector/) fornece várias ferramentas para
trabalhar com logs:

- Vários _receivers_ que analisam logs de fontes específicas e conhecidas de
  dados de logs.
- O `filelogreceiver`, que lê logs de qualquer arquivo e fornece recursos para
  analisá-los a partir de diferentes formatos ou usar uma expressão regular.
- _Processors_ como o `transformprocessor`, permite analisar dados aninhados,
  simplificar estruturas complexas, adicionar/remover/atualizar valores e mais.
- _Exporters_ permitem emitir dados de log em um formato não OpenTelemetry.

O primeiro passo na adoção do OpenTelemetry frequentemente envolve implantar um
Collector como um agente de logging genérico.

### Logs do OpenTelemetry para aplicações {#opentelemetry-logs-for-applications}

Em aplicações, logs do OpenTelemetry são criados com qualquer biblioteca ou
recursos nativos para geração de logs. Quando você adiciona autoinstrumentação
ou ativa um SDK, o OpenTelemetry automaticamente correlaciona seus logs com os
rastros e trechos, incluindo os seus IDs no corpo do log. Em outras palavras, o
OpenTelemetry automaticamente correlaciona seus logs com os seus rastros.

### Linguagens suportadas {#language-support}

Log é um sinal [estável](/docs/specs/otel/versioning-and-stability/#stable) na
especificação do OpenTelemetry. Para as implementações específicas da API e SDK
de Logs em cada linguagem, temos o seguinte estado:

{{% signal-support-table "logs" %}}

## Logs estruturados, não estruturados e semiestruturados {#structured-unstructured-and-semistructured-logs}

Tecnicamente o OpenTelemetry não distingue entre logs estruturados e não
estruturados. Você pode usar qualquer log que tiver com o OpenTelemetry. No
entanto, nem todos os formatos de log são igualmente úteis! Logs estruturados,
em particular, são recomendados para observabilidade em produção porque são
fáceis de analisar e interpretar em escala. A seção a seguir explica as
diferenças entre logs estruturados, não estruturados e semiestruturados.

### Logs estruturados {#structured-logs}

Um log estruturado é aquele que segue um formato consistente e legível por
máquina. Para aplicações, um dos formatos mais comuns é o JSON:

```json
{
  "timestamp": "2024-08-04T12:34:56.789Z",
  "level": "INFO",
  "service": "user-authentication",
  "environment": "production",
  "message": "User login successful",
  "context": {
    "userId": "12345",
    "username": "johndoe",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  },
  "transactionId": "abcd-efgh-ijkl-mnop",
  "duration": 200,
  "request": {
    "method": "POST",
    "url": "/api/v1/login",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": {
      "username": "johndoe",
      "password": "******"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "success": true,
      "token": "jwt-token-here"
    }
  }
}
```

e para componentes de infraestrutura, o _Common Log Format_ (CLF) é
frequentemente usado:

```text
127.0.0.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234
```

Também é comum ter logs estruturados com uma mistura de formatos. Por exemplo,
um log no formato _Extended Log Format_ (ELF) pode combinar JSON com os dados
separados por espaços em um log CLF.

```text
192.168.1.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" {"transactionId": "abcd-efgh-ijkl-mnop", "responseTime": 150, "requestBody": {"username": "johndoe"}, "responseHeaders": {"Content-Type": "application/json"}}
```

Para aproveitar ao máximo este log, transforme tantos os dados formatados em
JSON quanto os formatados em ELF em um mesmo formato comum para facilitar a
análise em um backend de observabilidade. O `filelogreceiver` do
[OpenTelemetry Collector](/docs/collector) contém maneiras padronizadas de
analisar logs como estes.

Logs estruturados são a melhor forma de usar logs. Por serem emitidos em um
formato consistente, eles são simples de extrair informações, o que facilita o
pré-processamento no OpenTelemetry Collector, a correlação com outros dados e,
por fim, a análise em um backend de Observabilidade.

### Logs não estruturados {#unstructured-logs}

Logs não estruturados são logs que não seguem uma estrutura consistente. Eles
podem ser mais legíveis para humanos e são frequentemente usados em
desenvolvimento. No entanto, não é aconselhável usar logs não estruturados para
fins de observabilidade em produção, pois são muito mais difíceis de analisar e
interpretar em escala.

Exemplos de logs não estruturados:

```text
[ERROR] 2024-08-04 12:45:23 - Failed to connect to database. Exception: java.sql.SQLException: Timeout expired. Attempted reconnect 3 times. Server: db.example.com, Port: 5432

System reboot initiated at 2024-08-04 03:00:00 by user: admin. Reason: Scheduled maintenance. Services stopped: web-server, database, cache. Estimated downtime: 15 minutes.

DEBUG - 2024-08-04 09:30:15 - User johndoe performed action: file_upload. Filename: report_Q3_2024.pdf, Size: 2.3 MB, Duration: 5.2 seconds. Result: Success
```

É possível armazenar e analisar logs não estruturados em produção, embora seja
necessário realizar um trabalho significativo para analisá-los ou processa-los
antes de serem legíveis por máquinas. Por exemplo, os três logs acima exigirão
uma expressão regular para analisar a marcação de data e hora e personalizar
analisadores para extrair os campos da mensagem de log de forma consistente.
Isso geralmente é necessário para que um _backend_ de log saiba como classificar
e organizar os logs por data e hora. Embora seja possível processar logs não
estruturados para análise, fazer isso pode dar mais trabalho do que mudar para
logs estruturados, através de um framework de log padrão em suas aplicações.

### Logs Semiestruturados {#semistructured-logs}

Um log semiestruturado é um log que utiliza um padrão interno consistente para
distinguir dados de forma que sejam legíveis por máquinas, mas que pode não usar
o mesmo formato e delimitadores entre os dados em diferentes sistemas.

Exemplo de um log semiestruturado:

```text
2024-08-04T12:45:23Z level=ERROR service=user-authentication userId=12345 action=login message="Failed login attempt" error="Invalid password" ipAddress=192.168.1.1 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
```

Embora sejam legíveis por máquinas, logs semiestruturados podem precisar de
diferentes tipos de analisadores para interpretação em grande escala.

## Componentes de logs do OpenTelemetry {#opentelemetry-logging-components}

A seguir estão listados os conceitos e componentes que sustentam o suporte de
log do OpenTelemetry.

### Conector / Ponte de Log {#log-appender--bridge}

Como desenvolvedor de aplicações, você não deve chamar diretamente a **API de
Logs Bridge**, pois ela é destinada a pessoas desenvolvendo bibliotecas de
geração de logs que querem construir conectores ou pontes de log. Em vez disso,
você deve usar sua biblioteca de log preferida e configurá-la para utilizar um
conector de log (ou ponte de log) capaz de emitir logs para um OpenTelemetry
_LogRecordExporter_.

Os SDKs do OpenTelemetry oferecem essa funcionalidade.

### Logger Provider

> Parte da **API de Logs Bridge** e deve ser usada apenas se você estiver
> desenvolvendo uma biblioteca de log.

Um Logger Provider (às vezes chamado de `LoggerProvider`) é uma fábrica de
`Logger`s. Na maioria dos casos, o Logger Provider é inicializado uma vez, e seu
ciclo de vida coincide com o ciclo de vida da aplicação. A inicialização do
Logger Provider também inclui a inicialização do Resource e Exporter.

### Logger

> Parte da **API de Logs Bridge** e deve ser usada apenas se você estiver
> desenvolvendo uma biblioteca de log.

Um Logger cria registros de log. Loggers são criados a partir do Log Providers.

### Log Record Exporter

Os Log Record Exporters enviam registros de log para um consumidor. Esse
consumidor pode ser a saída padrão de um terminal para depuração durante o
desenvolvimento, o OpenTelemetry Collector, ou qualquer backend de código aberto
ou de fornecedor de sua escolha.

### Log Record

Um log record representa a gravação de um evento. No OpenTelemetry, um log
record contém dois tipos de campos:

- Campos nomeados de nível superior com tipo e significado específicos
- Campos de recurso e atributos com valor e tipo variáveis

Os campos de nível superior são:

| Nome do Campo        | Descrição                                                 |
| -------------------- | --------------------------------------------------------- |
| Timestamp            | Momento em que o evento ocorreu.                          |
| ObservedTimestamp    | Momento em que o evento foi observado.                    |
| TraceId              | ID de rastreamento da solicitação.                        |
| SpanId               | ID do trecho da solicitação.                              |
| TraceFlags           | Flag de rastreamento W3C.                                 |
| SeverityText         | Texto de severidade (também conhecido como nível de log). |
| SeverityNumber       | Valor numérico da severidade.                             |
| Body                 | O corpo do registro de log.                               |
| Resource             | Descreve a origem do log.                                 |
| InstrumentationScope | Descreve o escopo que emitiu o log.                       |
| Attributes           | Informações adicionais sobre o evento.                    |

Para mais detalhes sobre registros de log e campos de log, consulte
[Modelo de Dados de Logs](/docs/specs/otel/logs/data-model/).

### Especificação {#specification}

Para saber mais sobre logs no OpenTelemetry, consulte a [especificação de
logs][].

[especificação de logs]: /docs/specs/otel/overview/#log-signal
