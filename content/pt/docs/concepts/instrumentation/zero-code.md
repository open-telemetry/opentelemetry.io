---
title: Autoinstrumentação
description: >-
  Aprenda a adicionar observabilidade a uma aplicação sem a necessidade de
  escrever código
weight: 10
aliases: [automatic]
default_lang_commit: 13c2d415e935fac3014344e67c6c61556779fd6f
---

Em um time de [operações](/docs/getting-started/ops/), você pode querer
adicionar observabilidade a uma ou mais aplicações sem precisar editar o
código-fonte. O OpenTelemetry permite que você tenha rapidamente observabilidade
para um serviço sem precisar usar a API e SDK do OpenTelemetry para
instrumentação baseada em código.

A autoinstrumentação adiciona as capacidades da API e SDK do OpenTelemetry à sua
aplicação, geralmente como uma instalação de agente ou semelhante a um agente.
Os mecanismos específicos envolvidos podem variar de acordo com a linguagem,
desde manipulação de bytecode, monkey patching ou eBPF para injetar chamadas à
API e SDK do OpenTelemetry em sua aplicação.

Normalmente, a autoinstrumentação adiciona instrumentação para as bibliotecas
que você está usando. Isso significa que as chamadas de requisições e respostas,
chamadas de banco de dados, chamadas de fila de mensagens e assim por diante são
instrumentadas. No entanto, o código da sua aplicação geralmente não é
instrumentado. Para instrumentar seu código, você precisará usar a
instrumentação baseada em código.

Além disso, a autoinstrumentação permite que você configure as Bibliotecas de
Instrumentação e os Exporters carregados.

Você pode configurar a autoinstrumentação por meio de variáveis de ambiente e
outros mecanismos específicos da linguagem, como propriedades do sistema ou
argumentos passados para métodos de inicialização. Para começar, você só precisa
configurar um nome de serviço para que você possa identificar o serviço no
backend de observabilidade de sua escolha.

Outras opções de configuração estão disponíveis, incluindo:

- Configuração específica da fonte de dados
- Configuração do exportador
- Configuração do propagador
- Configuração de recursos

A instrumentação automática está disponível para as seguintes linguagens:

- [.NET](/docs/zero-code/net/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
