---
title: Desempenho
description: Referência de desempenho para o Java agent do OpenTelemetry
weight: 400
aliases: [/docs/languages/java/performance]
default_lang_commit: 6cebc46de450dd44481a8a6f17c9b3d6f04aa0f2
cSpell:ignore: Dotel
---

O Java agent do OpenTelemetry instrumenta sua aplicação sendo executado dentro
da mesma Máquina Virtual Java (JVM). Como qualquer outro agente de software, o
Java agent requer recursos do sistema, como CPU, memória e largura de banda de
rede. O uso de recursos pelo agente é chamado de _overhead_ do agente ou
_overhead_ de desempenho. O Java agent do OpenTelemetry tem um impacto mínimo no
desempenho do sistema ao instrumentar aplicações JVM, embora o _overhead_ final
do agente dependa de vários fatores.

Alguns fatores que podem aumentar o _overhead_ do agente são ambientais, como a
arquitetura física da máquina, a frequência da CPU, a quantidade e a velocidade
da memória, a temperatura do sistema e a contenção de recursos. Outros fatores
incluem virtualização e conteinerização, o sistema operacional e suas
bibliotecas, a versão e o fornecedor da JVM, as configurações da JVM, o design
algorítmico do software monitorado e as dependências de software.

Devido à complexidade do software moderno e à ampla diversidade de cenários de
implantação, é impossível chegar a uma estimativa única de _overhead_ do agente.
Para descobrir o _overhead_ de qualquer agente de instrumentação em uma
determinada implantação, é necessário realizar experimentos e coletar medições
diretamente. Portanto, trate todas as afirmações sobre desempenho como
informações gerais e diretrizes que estão sujeitas a avaliação em um sistema
específico.

As seções a seguir descrevem os requisitos mínimos do Java agent do
OpenTelemetry, bem como potenciais restrições que impactam o desempenho e
diretrizes para otimizar e solucionar problemas de desempenho do agente.

## Diretrizes para reduzir o _overhead_ do agente {#guidelines-to-reduce-agent-overhead}

As seguintes boas práticas e técnicas podem ajudar a reduzir o _overhead_
causado pelo Java agent.

### Configurar a amostragem de rastros {#configure-trace-sampling}

O volume de _spans_ processados pela instrumentação pode afetar o _overhead_ do
agente. Você pode configurar a amostragem de rastros para ajustar o volume de
_spans_ e reduzir o uso de recursos. Consulte
[Amostragem](/docs/languages/java/sdk/#sampler).

### Desativar instrumentações específicas {#turn-off-specific-instrumentations}

Você pode reduzir ainda mais o _overhead_ do agente desativando instrumentações
que não sejam necessárias ou que estejam gerando muitos _spans_. Para desativar
uma instrumentação, use `-Dotel.instrumentation.<name>.enabled=false` ou a
variável de ambiente `OTEL_INSTRUMENTATION_<NAME>_ENABLED`, onde `<name>` é o
nome da instrumentação.

Por exemplo, a seguinte opção desativa a instrumentação JDBC:
`-Dotel.instrumentation.jdbc.enabled=false`

### Alocar mais memória para a aplicação {#allocate-more-memory-for-the-application}

Aumentar o tamanho máximo do _heap_ da JVM usando a opção `-Xmx<size>` pode
ajudar a aliviar problemas de _overhead_ do agente, já que as instrumentações
podem gerar um grande número de objetos de vida curta na memória.

### Reduzir a instrumentação manual ao estritamente necessário {#reduce-manual-instrumentation-to-what-you-need}

O excesso de instrumentação manual pode introduzir ineficiências que aumentam o
_overhead_ do agente. Por exemplo, usar `@WithSpan` em todos os métodos resulta
em um volume elevado de _spans_, o que por sua vez aumenta o ruído nos dados e
consome mais recursos do sistema.

### Provisionar recursos adequados {#provision-adequate-resources}

Certifique-se de provisionar recursos suficientes para sua instrumentação e para
o Collector. A quantidade de recursos, como memória ou disco, depende da
arquitetura e das necessidades de sua aplicação. Por exemplo, uma configuração
comum é executar a aplicação instrumentada no mesmo _host_ que o OpenTelemetry
Collector. Nesse caso, considere dimensionar adequadamente os recursos para o
Collector e otimizar suas configurações. Consulte
[Escalonamento](/docs/collector/scaling/).

## Restrições que impactam o desempenho do Java agent {#constraints-impacting-the-performance-of-the-java-agent}

Em geral, quanto mais telemetria você coletar de sua aplicação, maior será o
impacto no _overhead_ do agente. Por exemplo, rastrear métodos que não são
relevantes para a sua aplicação ainda pode produzir um _overhead_ considerável
do agente, pois rastrear tais métodos é computacionalmente mais custoso do que
executar o próprio método. Da mesma forma, _tags_ de alta cardinalidade em
métricas podem aumentar o uso de memória. O _logging_ de depuração (_debug_), se
ativado, também aumenta as operações de gravação em disco e o uso de memória.

Algumas instrumentações, por exemplo JDBC ou Redis, produzem altos volumes de
_spans_ que aumentam o _overhead_ do agente. Para obter mais informações sobre
como desativar instrumentações desnecessárias, consulte
[Desativar instrumentações específicas](#turn-off-specific-instrumentations).

> [!NOTE]
>
> Recursos experimentais do Java agent podem aumentar o _overhead_ do agente
> devido ao foco experimental na funcionalidade em detrimento do desempenho.
> Recursos estáveis são mais seguros em termos de _overhead_ do agente.

## Solução de problemas de _overhead_ do agente {#troubleshooting-agent-overhead-issues}

Ao solucionar problemas de _overhead_ do agente, faça o seguinte:

- Verifique os requisitos mínimos. Consulte
  [Pré-requisitos](/docs/languages/java/getting-started/#prerequisites).
- Use a versão compatível mais recente do Java agent.
- Use a versão compatível mais recente de sua JVM.

Considere adotar as seguintes ações para reduzir o _overhead_ do agente:

- Se a sua aplicação estiver próxima dos limites de memória, considere fornecer
  mais memória a ela.
- Se a sua aplicação estiver utilizando toda a CPU, considere escaloná-la
  horizontalmente.
- Tente desativar ou ajustar as métricas.
- Ajuste as configurações de amostragem de rastros para reduzir o volume de
  _spans_.
- Desative instrumentações específicas.
- Revise a instrumentação manual para evitar a geração desnecessária de _spans_.

## Diretrizes para medir o _overhead_ do agente {#guidelines-for-measuring-agent-overhead}

Medir o _overhead_ do agente em seu próprio ambiente e implantações fornece
dados precisos sobre o impacto da instrumentação no desempenho de sua aplicação
ou serviço. As seguintes diretrizes descrevem as etapas gerais para coletar e
comparar medições confiáveis de _overhead_ do agente.

### Decidir o que você deseja medir {#decide-what-you-want-to-measure}

Diferentes usuários de sua aplicação ou serviço podem notar diferentes aspectos
do _overhead_ do agente. Por exemplo, enquanto os usuários finais podem notar a
degradação na latência do serviço, os usuários avançados com cargas de trabalho
pesadas prestam mais atenção ao _overhead_ de CPU. Por outro lado, usuários que
fazem implantações frequentemente, por exemplo devido a cargas de trabalho
elásticas, preocupam-se mais com o tempo de inicialização.

Reduza suas medições aos fatores que certamente impactam a experiência do
usuário, para que seus conjuntos de dados não contenham informações
irrelevantes. Alguns exemplos de medições incluem:

- Uso médio de CPU pelo usuário, pico do usuário e uso médio da máquina
- Total de memória alocada e _heap_ máximo utilizado
- Tempo de pausa da coleta de lixo (_garbage collection_)
- Tempo de inicialização em milissegundos
- Latência média do serviço e percentil 95 (p95)
- Taxa média de transferência (_throughput_) de leitura e gravação na rede

### Preparar um ambiente de teste adequado {#prepare-a-suitable-test-environment}

Ao medir o _overhead_ do agente em um ambiente de teste controlado, você poderá
identificar melhor os fatores que afetam o desempenho. Ao preparar um ambiente
de teste, realize o seguinte:

1.  Certifique-se de que a configuração do ambiente de teste seja semelhante à
    da produção.
2.  Isole a aplicação sob teste de outros serviços que possam interferir.
3.  Desative ou remova todos os serviços de sistema desnecessários no _host_ da
    aplicação.
4.  Garanta que a aplicação tenha recursos de sistema suficientes para lidar com
    a carga de trabalho do teste.

### Criar uma bateria de testes realistas {#create-a-battery-of-realistic-tests}

Projete os testes executados no ambiente de testes para se assemelharem o máximo
possível às cargas de trabalho típicas. Por exemplo, se alguns _endpoints_ de
API REST do seu serviço forem suscetíveis a altos volumes de requisições, crie
um teste que simule um tráfego de rede intenso.

Para aplicações Java, utilize uma fase de aquecimento (_warm-up_) antes de
iniciar as medições. A JVM é uma máquina altamente dinâmica que realiza um
grande número de otimizações por meio de compilação _just-in-time_ (JIT). A fase
de aquecimento ajuda a aplicação a concluir a maior parte do carregamento de
classes e dá tempo ao compilador JIT para executar a maioria das otimizações.

Certifique-se de executar um grande número de requisições e de repetir a bateria
de testes muitas vezes. Essa repetição ajuda a garantir uma amostra
representativa de dados. Inclua cenários de erro em seus dados de teste. Simule
uma taxa de erro semelhante à de uma carga de trabalho normal, normalmente entre
2% e 10%.

> [!NOTE]
>
> Os testes podem aumentar os custos ao direcionar para _backends_ de
> observabilidade e outros serviços comerciais. Planeje seus testes de acordo ou
> considere usar soluções alternativas, como _backends_ auto-hospedados ou
> executados localmente.

### Coletar medições comparáveis {#collect-comparable-measurements}

Para identificar quais fatores podem estar afetando o desempenho e causando
_overhead_ do agente, colete medições no mesmo ambiente após modificar um único
fator ou condição.

### Analisar os dados de _overhead_ do agente {#analyze-the-agent-overhead-data}

Depois de coletar dados de múltiplas execuções, você pode plotar os resultados
em um gráfico ou comparar médias utilizando testes estatísticos para verificar
diferenças significativas.

Considere que diferentes pilhas (_stacks_), aplicações e ambientes podem
resultar em diferentes características operacionais e diferentes resultados de
medição de _overhead_ do agente.
