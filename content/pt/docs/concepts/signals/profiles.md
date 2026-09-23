---
title: Perfis
weight: 5
description: Um registro do uso de recursos no nível do código.
default_lang_commit: 274bf95abd0cbad3ad9f95b4426f282466cdaade
drifted_from_default: true
---

**Status**: [Em desenvolvimento](/docs/specs/otel/document-status/)

> [!NOTE]
>
> O sinal de perfis ainda é experimental e está em desenvolvimento ativo.
> Alterações incompatíveis podem ser introduzidas em versões futuras.

Um **perfil** é uma **coleção** de amostras e metadados associados que mostra
onde as aplicações consomem recursos durante a execução. Uma amostra registra
valores encontrados em algum contexto de programa (tipicamente um _stack
trace_), opcionalmente enriquecida com informações auxiliares, como o ID do
rastro correspondente a uma solicitação de nível mais alto.

O momento de captura de uma amostra é conhecido como um **evento de amostra** e
consiste não apenas no ponto de observação dos dados, mas também no momento em
que foi capturado.

Por exemplo, um perfil On-CPU contém amostras (_stack traces_ agregados) de
código que estava sendo executado na CPU quando as amostras foram capturadas,
junto com os _timestamps_ e o número de vezes que cada _stack trace_ foi
observado.

## Visão geral dos perfis {#profiles-overview}

Os perfis estão emergindo como o quarto sinal essencial de observabilidade,
junto com logs, métricas e rastros. Eles oferecem _insights_ incomparáveis sobre
o comportamento do sistema e da aplicação, frequentemente revelando gargalos de
desempenho ignorados por outros sinais.

Os perfis fornecem visões granulares e baseadas em tempo do consumo de recursos
e da execução de código, abrangendo:

- **Perfilamento no nível da aplicação**: Revela como as funções do software
  consomem CPU, memória e outros recursos, destacando código lento ou
  ineficiente.

- **Perfilamento no nível do sistema**: Oferece uma visão holística da
  infraestrutura, identificando problemas em chamadas do sistema operacional,
  operações do kernel e I/O.

Essa visão de desempenho pode levar a:

- **Análise de causa raiz mais rápida**: Identifica rapidamente a causa exata da
  degradação de desempenho.
- **Otimização proativa**: Identifica possíveis problemas antes do impacto ao
  usuário.
- **Melhor utilização de recursos**: Otimiza a infraestrutura para economia de
  custos e eficiência.
- **Maior produtividade do desenvolvedor**: Ajuda os desenvolvedores a validar o
  desempenho do código e prevenir regressões.

## Como os perfis complementam outros sinais {#how-profiles-complement-other-signals}

Cada sinal do OpenTelemetry responde a uma pergunta diferente:

| Sinal        | Pergunta                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| **Logs**     | Quais eventos discretos ocorreram? (informações sobre o comportamento do sistema) |
| **Métricas** | O que está acontecendo no nível do sistema? (ex.: uso de CPU em 90%)              |
| **Rastros**  | Como uma solicitação percorre um sistema distribuído?                             |
| **Perfis**   | Qual código é responsável pelo consumo de recursos?                               |

Os perfis do OpenTelemetry suportam vínculos bidirecionais com outros sinais.
Essas correlações funcionam em duas dimensões:

- **Correlação de contexto de solicitação**: Vincula dados de perfilamento a um
  rastro ou trecho específico para que você possa ver qual código estava em
  execução durante uma solicitação específica.

- **Correlação de contexto de recurso**: Vincula dados de perfilamento ao mesmo
  [recurso](/docs/concepts/resources/) que emitiu as métricas, logs ou rastros
  associados, como a mesma instância da aplicação.

Os perfis se tornam especialmente poderosos quando correlacionados com outros
sinais:

- **Logs para perfis**: A partir de um registro de log de falta de memória,
  encontre os caminhos de código responsáveis pela pressão de memória.
- **Métricas para perfis**: A partir de um pico de uso de CPU ou memória, salte
  diretamente para as funções que estão consumindo esses recursos.
- **Rastros para perfis**: A partir de um trecho lento em um rastro, veja o
  perfil correspondente para identificar o código responsável pela latência.

## Tipos de perfis {#profile-types}

O perfilamento pode capturar muitos tipos diferentes de uso de recursos. Alguns
tipos comuns de perfis incluem:

- **On-CPU**: Quais funções estão consumindo tempo de processador?
- **Off-CPU**: Onde as _threads_ estão bloqueadas ou esperando (ex.: _locks_,
  I/O) em vez de executar?
- **Heap (memória)**: Quais funções alocaram memória que ainda está em uso?
- **Alocações (memória)**: Quais caminhos de código são responsáveis pela
  maioria das alocações de memória (independentemente de a memória ter sido
  liberada)?

O sinal de perfis do OpenTelemetry é flexível o suficiente para acomodar todos
esses tipos. No entanto, os tipos de perfis específicos disponíveis dependem do
_runtime_ da linguagem e do perfilador sendo utilizado.

## Como funciona o perfilamento {#how-profiling-works}

Existem múltiplas abordagens para coletar perfis e projetamos os perfis do
OpenTelemetry para suportar todas elas:

- **Perfilamento baseado em amostragem**: Um perfilador interrompe
  periodicamente o programa, por exemplo usando interrupções baseadas em
  temporizador, e registra o _stack trace_ atual. Essa é a abordagem mais comum
  para perfilamento de CPU. No Linux, perfiladores podem utilizar eBPF para
  capturar _stack traces_ do kernel sem modificar aplicações em _userspace_.
  Essa abordagem permite perfilamento de todo o sistema sem instrumentação
  (incluindo código produzido por linguagens compiladas sem suporte a _runtime_)
  e é projetada para uso contínuo em produção com baixa sobrecarga.
- **Perfilamento baseado em instrumentação**: Ganchos de _runtime_ ou
  instrumentação de _bytecode_ reportam eventos como alocações de memória,
  aquisições de _locks_ ou coletas de lixo junto com seus _stack traces_
  associados.

Independentemente do método de coleta, os dados resultantes são serializados no
modelo de dados comum de perfis do OpenTelemetry e exportados via OTLP.

## Coletando perfis {#collecting-profiles}

O OpenTelemetry fornece um
[agente de perfilamento baseado em eBPF](https://github.com/open-telemetry/opentelemetry-ebpf-profiler)
para Linux, capaz de perfilar a maioria das linguagens sem nenhuma alteração no
código.

Integrações adicionais de perfilamento específicas por linguagem que utilizam
_frameworks_ de perfilamento nativos do _runtime_, como JFR para Java ou pprof
para Go, também se tornarão disponíveis à medida que o sinal amadurecer.

Você pode exportar perfis através do OTLP para o OpenTelemetry Collector ou
diretamente para qualquer _backend_ compatível.

## Especificação {#specification}

Para saber mais sobre perfis no OpenTelemetry, consulte a
[especificação de perfis](/docs/specs/otel/profiles/).
