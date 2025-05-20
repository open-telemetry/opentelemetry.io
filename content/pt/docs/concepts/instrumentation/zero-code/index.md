---
title: Sem código
description: >-
  Aprenda como adicionar observabilidade a uma aplicação sem precisar escrever
  código
weight: 10
default_lang_commit: d1ef521ee4a777881fb99c3ec2b506e068cdec4c
---

Como [operações](/docs/getting-started/ops/), você pode querer adicionar
observabilidade a uma ou mais aplicações sem precisar editar o código-fonte. O
OpenTelemetry permite que você ganhe rapidamente alguma observabilidade para um
serviço sem ter que usar a API & SDK do OpenTelemetry para
[instrumentação baseada em código](/docs/concepts/instrumentation/code-based).

![Sem código](./zero-code.svg)

A instrumentação sem código adiciona as capacidades da API e do SDK do
OpenTelemetry à sua aplicação, que geralmente é como uma instalação de agente ou
similar. As técnicas específicas podem variar de acordo com a linguagem,
incluindo a manipulação de _bytecode_, _monkey patching_ ou eBPF para incluir
chamadas à API e SDK do OpenTelemetry em sua aplicação.

Geralmente, a instrumentação sem código adiciona instrumentação para as
bibliotecas que você está utilizando. Isso significa que as operações são
instrumentadas, como requisições e respostas, acessos a bancos de dados,
interações com filas de mensagens, entre outras. No entanto, o código da sua
aplicação não é instrumentado normalmente. Para instrumentar o código da sua
aplicação, você precisará usar a
[instrumentação baseada em código](/docs/concepts/instrumentation/code-based).

Além disso, a instrumentação sem código permite que você configure as
[Bibliotecas de Instrumentação](/docs/concepts/instrumentation/libraries) e os
[exporters](/docs/concepts/components/#exporters) carregados.

Você pode configurar a instrumentação sem código por meio de variáveis de
ambiente e outros mecanismos específicos da linguagem, como propriedades de
sistema ou argumentos passados para métodos de inicialização. Para começar, você
só precisa de um nome de serviço configurado para identificar o serviço no
backend de observabilidade de sua escolha.

Outras opções de configuração estão disponíveis, incluindo:

- Configuração específica da fonte de dados
- Configuração de exporters
- Configuração de propagadores
- Configuração de recursos

A instrumentação automática está disponível para as seguintes linguagens:

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
