---
title: Escalando o Collector
weight: 26
cSpell:ignore: fluentd Linkerd loadbalancer loadbalancing observability receivers scraping exporters Sidecars sharded statefulset
default_lang_commit: 30b7dbbdd94cec0b2a0c99317272b103315518bf
---

Ao planejar o seu pipeline de observabilidade com o OpenTelemetry Collector,
você deve considerar formas de escalar o pipeline à medida que a sua coleta de
telemetria aumenta.

As seções a seguir guiarão você pela fase de planejamento, discutindo quais
componentes escalar, como determinar quando é hora de escalar e como executar o
plano.

## O que escalar {#what-to-scale}

Embora o OpenTelemetry Collector processe todos os tipos de sinais de telemetria
em um único binário, a realidade é que cada tipo pode ter necessidades de escala
diferentes e pode exigir estratégias de escala distintas. Comece analisando a
sua carga de trabalho para determinar qual tipo de sinal deve representar a
maior parte da carga e quais formatos o Collector deve receber. Por exemplo,
escalar um cluster de extração (_scraping_) é bem diferente de escalar receivers
de logs. Pense também em quão elástica é a carga de trabalho: você tem picos em
horários específicos do dia ou a carga é semelhante ao longo das 24 horas?
Depois de reunir essas informações, você entenderá o que precisa ser escalado.

Por exemplo, suponha que você tenha centenas de rotas do Prometheus para extrair
métricas, um terabyte de logs chegando de instâncias do fluentd a cada minuto e
algumas métricas e rastros de aplicações chegando no formato OTLP dos seus
microsserviços mais recentes. Nesse cenário, você vai querer uma arquitetura
capaz de escalar cada sinal individualmente: escalar os receivers do Prometheus
exige coordenação entre os extratores (_scrapers_) para decidir qual extrator
vai para qual rota. Em contraste, podemos escalar horizontalmente os receivers
de logs sem estado (_stateless_) sob demanda. Ter o receiver OTLP para métricas
e rastros em um terceiro cluster de Collectors nos permitiria isolar falhas e
iterar mais rápido, sem medo de reiniciar um pipeline ocupado. Como o receiver
OTLP permite a ingestão de todos os tipos de telemetria, podemos manter as
métricas e os rastros da aplicação na mesma instância, escalando-os
horizontalmente quando necessário.

## Quando escalar {#when-to-scale}

Mais uma vez, devemos entender a nossa carga de trabalho para decidir quando é
hora de escalar para mais ou para menos, mas algumas métricas emitidas pelo
Collector podem dar boas pistas de quando agir.

Uma pista útil que o Collector pode dar quando o processor `memory_limiter` faz
parte do pipeline é a métrica `otelcol_processor_refused_spans`. Esse processor
permite restringir a quantidade de memória que o Collector pode usar. Embora o
Collector possa consumir um pouco mais do que o valor máximo configurado nesse
processor, novos dados serão eventualmente impedidos de passar pelo pipeline
pelo `memory_limiter`, que registrará o fato nessa métrica. A mesma métrica
existe para todos os outros tipos de dados de telemetria. Se os dados estiverem
sendo recusados na entrada do pipeline com muita frequência, você provavelmente
vai querer escalar o seu cluster de Collectors para mais. Você pode escalar para
menos quando o consumo de memória entre os nós estiver significativamente abaixo
do limite definido nesse processor.

Outro conjunto de métricas para ficar de olho são as relacionadas aos tamanhos
das filas dos exporters: `otelcol_exporter_queue_capacity` e
`otelcol_exporter_queue_size`. O Collector enfileira os dados em memória
enquanto aguarda um _worker_ ficar disponível para enviá-los. Se não houver
workers suficientes ou se o backend estiver muito lento, os dados começam a se
acumular na fila. Quando a fila atinge a sua capacidade
(`otelcol_exporter_queue_size` > `otelcol_exporter_queue_capacity`), ela rejeita
dados (`otelcol_exporter_enqueue_failed_spans`). Adicionar mais workers
geralmente faz o Collector exportar mais dados, o que pode não ser
necessariamente o que você quer (veja [Quando NÃO escalar](#when-not-to-scale)).
A orientação geral é monitorar o tamanho da fila e considerar escalar para mais
quando ela atingir 60-70% da capacidade, e escalar para menos se estiver
consistentemente baixa, mantendo um número mínimo de réplicas, por exemplo três,
para resiliência.

Também vale a pena se familiarizar com os componentes que você pretende usar,
pois componentes diferentes podem produzir outras métricas. Por exemplo, o
[exporter de balanceamento de carga registra informações de tempo sobre as operações de exportação](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter#metrics),
expondo-as como parte do histograma `otelcol_loadbalancer_backend_latency`. Você
pode extrair essas informações para determinar se todos os backends levam um
tempo semelhante para processar as requisições: um único backend lento pode
indicar problemas externos ao Collector.

Para receivers que fazem extração, como o receiver do Prometheus, a extração
deve ser escalada, ou fragmentada (_sharded_), quando o tempo necessário para
concluir a extração de todos os alvos frequentemente se aproxima de forma
crítica do intervalo de extração. Quando isso acontece, é hora de adicionar mais
extratores, geralmente novas instâncias do Collector.

### Quando NÃO escalar {#when-not-to-scale}

Talvez tão importante quanto saber quando escalar seja entender quais sinais
indicam que uma operação de escala não trará benefícios. Um exemplo é quando um
banco de dados de telemetria não consegue acompanhar a carga: adicionar
Collectors ao cluster não ajudará sem escalar o banco de dados. Da mesma forma,
quando a conexão de rede entre o Collector e o backend está saturada, adicionar
mais Collectors pode causar um efeito colateral prejudicial.

Novamente, uma forma de identificar essa situação é observando as métricas
`otelcol_exporter_queue_size` e `otelcol_exporter_queue_capacity`. Se o tamanho
da fila estiver constantemente próximo da capacidade da fila, é um sinal de que
a exportação de dados está mais lenta do que o recebimento. Você pode tentar
aumentar a capacidade da fila, o que fará o Collector consumir mais memória, mas
também dará algum fôlego para o backend sem descartar dados de telemetria
permanentemente. Mas se você continuar aumentando a capacidade da fila e o
tamanho dela continuar crescendo na mesma proporção, é um indício de que você
deve olhar para fora do Collector. Também é importante notar que adicionar mais
workers aqui não seria útil: você estaria apenas colocando mais pressão em um
sistema que já sofre com carga alta.

Outro sinal de que o backend pode estar com problemas é um aumento na métrica
`otelcol_exporter_send_failed_spans`: isso indica que o envio de dados ao
backend falhou permanentemente. Escalar o Collector para mais provavelmente só
piorará a situação quando isso estiver acontecendo de forma consistente.

## Como escalar {#how-to-scale}

Neste ponto, sabemos quais partes do nosso pipeline precisam de escala. Em
relação à escala, temos três tipos de componentes: stateless, extratores e
stateful.

A maioria dos componentes do Collector é stateless. Mesmo que mantenham algum
estado em memória, ele não é relevante para fins de escala.

Os extratores, como o receiver do Prometheus, são configurados para obter dados
de telemetria de fontes externas. O receiver então extrai alvo por alvo,
colocando os dados no pipeline.

Componentes como o processor de amostragem por cauda (_tail sampling_) não podem
ser escalados facilmente, pois mantêm em memória um estado relevante para o seu
funcionamento. Esses componentes exigem consideração cuidadosa antes de serem
escalados.

### Escalando Collectors stateless e usando load balancers {#scaling-stateless-collectors-and-using-load-balancers}

A boa notícia é que, na maioria das vezes, escalar o Collector é fácil, pois
basta adicionar novas réplicas e distribuir o tráfego entre elas usando um load
balancer.

Um load balancer é essencial quando você precisa:

- Distribuir o tráfego de telemetria de entrada entre várias instâncias de
  Collectors stateless para evitar que uma única instância fique sobrecarregada.
- Melhorar a disponibilidade e a tolerância a falhas do seu pipeline de coleta.
  Se uma instância do Collector falhar, o load balancer pode redirecionar o
  tráfego para instâncias saudáveis.
- Escalar horizontalmente a sua camada de Collectors com base na demanda.

Ao operar em ambientes Kubernetes, aproveite as soluções robustas e prontas de
balanceamento de carga e limitação de taxa (_rate limiting_) fornecidas por
service meshes, como Istio ou Linkerd, ou pelos load balancers dos provedores de
nuvem. Esses sistemas oferecem recursos maduros de gerenciamento de tráfego,
resiliência e observabilidade, que muitas vezes vão além da simples distribuição
de carga.

Quando gRPC é usado para receber os dados, um cenário comum com OTLP, use um
load balancer que entenda gRPC (load balancer L7). Load balancers L4 padrão
podem estabelecer uma conexão persistente com uma única instância de Collector
de backend, anulando os benefícios da escala, já que os clientes sempre
atingirão o mesmo Collector. Você ainda deve considerar dividir o seu pipeline
de coleta pensando em confiabilidade. Por exemplo, quando as suas cargas de
trabalho rodam no Kubernetes, você pode querer usar DaemonSets para ter um
Collector no mesmo nó físico das suas cargas de trabalho e um Collector central
remoto responsável pelo pré-processamento dos dados antes de enviá-los ao
armazenamento. Quando o número de nós é baixo e o número de pods é alto,
Sidecars podem fazer mais sentido, pois você obtém um balanceamento de carga
melhor para as conexões gRPC entre as camadas de Collectors sem precisar de um
load balancer específico para gRPC. Usar um Sidecar também faz sentido para
evitar derrubar um componente crucial para todos os pods de um nó quando um pod
do DaemonSet falha.

O padrão sidecar consiste em adicionar um contêiner ao pod da carga de trabalho.
O [OpenTelemetry Operator](/docs/platforms/kubernetes/operator/) pode adicionar
isso automaticamente para você. Para isso, você precisará de um CR OpenTelemetry
Collector e precisará anotar o seu PodSpec ou Pod, dizendo ao operator para
injetar um sidecar:

```yaml
---
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: sidecar-for-my-workload
spec:
  mode: sidecar
  config: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
    processors:

    exporters:
      # Note: Prior to v0.86.0 use the `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: []
          exporters: [debug]
---
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
  annotations:
    sidecar.opentelemetry.io/inject: 'true'
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
```

Caso você prefira dispensar o operator e adicionar um sidecar manualmente, aqui
está um exemplo:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-microservice
spec:
  containers:
    - name: my-microservice
      image: my-org/my-microservice:v0.0.0
      ports:
        - containerPort: 8080
          protocol: TCP
    - name: sidecar
      image: ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector:0.69.0
      ports:
        - containerPort: 8888
          name: metrics
          protocol: TCP
        - containerPort: 4317
          name: otlp-grpc
          protocol: TCP
      args:
        - --config=/conf/collector.yaml
      volumeMounts:
        - mountPath: /conf
          name: sidecar-conf
  volumes:
    - name: sidecar-conf
      configMap:
        name: sidecar-for-my-workload
        items:
          - key: collector.yaml
            path: collector.yaml
```

### Escalando os extratores {#scaling-the-scrapers}

Alguns receivers obtêm ativamente dados de telemetria para colocar no pipeline,
como os receivers host_metrics e prometheus. Embora obter métricas do host não
seja algo que normalmente escalaríamos, podemos precisar dividir o trabalho de
extrair milhares de rotas para o receiver do Prometheus. E não podemos
simplesmente adicionar mais instâncias com a mesma configuração, pois cada
Collector tentaria extrair as mesmas rotas de todos os outros Collectors do
cluster, causando ainda mais problemas, como amostras fora de ordem.

A solução é fragmentar as rotas entre as instâncias do Collector, de modo que,
se adicionarmos outra réplica do Collector, cada uma atuará em um conjunto
diferente de rotas.

Uma forma de fazer isso é ter um arquivo de configuração para cada Collector, de
modo que cada Collector descubra apenas as rotas relevantes para ele. Por
exemplo, cada Collector poderia ser responsável por um namespace do Kubernetes
ou por labels específicos nas cargas de trabalho.

Outra forma de escalar o receiver do Prometheus é usar o
[Target Allocator](/docs/platforms/kubernetes/operator/target-allocator/): é um
binário extra que pode ser implantado como parte do OpenTelemetry Operator e que
distribui os alvos de extração do Prometheus de uma determinada configuração
pelo cluster de Collectors. Você pode usar um Custom Resource (CR) como o
seguinte para fazer uso do Target Allocator:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector-with-ta
spec:
  mode: statefulset
  targetAllocator:
    enabled: true
  config: |
    receivers:
      prometheus:
        config:
          scrape_configs:
          - job_name: 'otel-collector'
            scrape_interval: 10s
            static_configs:
            - targets: [ '0.0.0.0:8888' ]

    exporters:
      # Note: Prior to v0.86.0 use the `logging` instead of `debug`.
      debug:

    service:
      pipelines:
        metrics:
          receivers: [prometheus]
          processors: []
          exporters: [debug]
```

Após a reconciliação, o OpenTelemetry Operator converterá a configuração do
Collector no seguinte:

```yaml
exporters:
   # Note: Prior to v0.86.0 use the `logging` instead of `debug`.
   debug: null
 receivers:
   prometheus:
     config:
       global:
         scrape_interval: 1m
         scrape_timeout: 10s
         evaluation_interval: 1m
       scrape_configs:
       - job_name: otel-collector
         honor_timestamps: true
         scrape_interval: 10s
         scrape_timeout: 10s
         metrics_path: /metrics
         scheme: http
         follow_redirects: true
         http_sd_configs:
         - follow_redirects: false
           url: http://collector-with-ta-targetallocator:80/jobs/otel-collector/targets?collector_id=$POD_NAME
service:
   pipelines:
     metrics:
       exporters:
       - debug
       processors: []
       receivers:
       - prometheus
```

Observe como o Operator adicionou uma seção `global` e um novo `http_sd_configs`
à configuração de extração do `otel-collector`, apontando para uma instância do
Target Allocator que ele provisionou. Agora, para escalar os Collectors, altere
o atributo "replicas" do CR e o Target Allocator distribuirá a carga
adequadamente, fornecendo um `http_sd_config` personalizado por instância do
Collector (pod).

### Escalando Collectors stateful {#scaling-stateful-collectors}

Certos componentes podem manter dados em memória, produzindo resultados
diferentes quando escalados. É o caso do processor de amostragem por cauda
(_tail-sampling_), que mantém trechos em memória por um determinado período,
avaliando a decisão de amostragem somente quando o rastro é considerado
completo. Escalar um cluster de Collectors adicionando mais réplicas significa
que Collectors diferentes receberão trechos de um mesmo rastro, fazendo com que
cada Collector avalie se aquele rastro deve ser amostrado, podendo chegar a
respostas diferentes. Esse comportamento resulta em rastros com trechos
faltando, deturpando o que aconteceu naquela transação.

Uma situação semelhante acontece ao usar o processor span-to-metrics para gerar
métricas de serviço. Quando Collectors diferentes recebem dados relacionados ao
mesmo serviço, as agregações baseadas no nome do serviço ficam imprecisas.

Para contornar isso, você pode implantar uma camada de Collectors contendo o
exporter de balanceamento de carga na frente dos seus Collectors que fazem a
amostragem por cauda ou o processamento span-to-metrics. O exporter de
balanceamento de carga calculará consistentemente um hash do ID do rastro ou do
nome do serviço e determinará qual Collector de backend deve receber os trechos
daquele rastro. Você pode configurar o exporter de balanceamento de carga para
usar a lista de hosts por trás de uma entrada DNS do tipo A, como um serviço
headless do Kubernetes. Quando a implantação por trás desse serviço for escalada
para mais ou para menos, o exporter de balanceamento de carga eventualmente verá
a lista de hosts atualizada. Como alternativa, você pode especificar uma lista
de hosts estáticos a serem usados pelo exporter de balanceamento de carga. Você
pode escalar a camada de Collectors configurados com o exporter de balanceamento
de carga aumentando o número de réplicas. Note que cada Collector pode executar
a consulta DNS em momentos diferentes, causando uma divergência na visão do
cluster por alguns instantes. Recomendamos reduzir o valor do intervalo para que
a visão do cluster seja divergente apenas por um curto período em ambientes
altamente elásticos.

Aqui está um exemplo de configuração usando um registro DNS do tipo A (serviço
Kubernetes otelcol no namespace observability) como entrada para as informações
de backend:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  loadbalancing:
    protocol:
      otlp:
    resolver:
      dns:
        hostname: otelcol.observability.svc.cluster.local

service:
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - loadbalancing
```
