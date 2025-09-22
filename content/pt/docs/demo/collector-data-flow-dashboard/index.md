---
title: Dashboard de Fluxo de Dados do Coletor
---

Monitorar o fluxo de dados através do OpenTelemetry Collector é crucial por várias
razões. Obter uma perspectiva de nível macro sobre dados recebidos, como contagens de
amostras e cardinalidade, é essencial para compreender a dinâmica interna do
coletor. No entanto, ao se aprofundar nos detalhes, as interconexões podem
se tornar complexas. O Dashboard de Fluxo de Dados do Coletor visa demonstrar as
capacidades da aplicação demo do OpenTelemetry, oferecendo uma base sólida
para os usuários construírem. O Dashboard de Fluxo de Dados do Coletor fornece
orientação valiosa sobre quais métricas monitorar. Os usuários podem adaptar suas próprias variações de dashboard
adicionando métricas necessárias específicas aos seus casos de uso, como
processador memory_delimiter ou outros indicadores de fluxo de dados. Este dashboard demo
serve como ponto de partida, permitindo que os usuários explorem cenários de uso diversos
e adaptem a ferramenta às suas necessidades únicas de monitoramento.

## Visão Geral do Fluxo de Dados

O diagrama abaixo fornece uma visão geral dos componentes do sistema, mostrando a
configuração derivada do arquivo de configuração do OpenTelemetry Collector (otelcol)
utilizado pela aplicação demo do OpenTelemetry. Além disso, destaca
o fluxo de dados de observabilidade (rastreamentos e métricas) dentro do sistema.

![Visão Geral do Fluxo de Dados do OpenTelemetry Collector](otelcol-data-flow-overview.png)

## Métricas de Entrada/Saída

As métricas mostradas no diagrama abaixo são empregadas para monitorar fluxos de dados de
saída e entrada. Essas métricas são geradas pelo processo otelcol,
exportadas na porta 8888, e subsequentemente coletadas pelo Prometheus. O namespace
associado a essas métricas é "otelcol," e o nome do job é rotulado como
`otel.`

![Métricas de Entrada e Saída do OpenTelemetry Collector](otelcol-data-flow-metrics.png)

Labels servem como uma ferramenta valiosa para identificar conjuntos de métricas específicos (como
exportador, receptor ou job), permitindo diferenciação entre conjuntos de métricas dentro
do namespace geral. É importante notar que você só encontrará
métricas recusadas se os limites de memória, conforme definidos no processador
delimitador de memória, forem excedidos.

### Pipeline de Rastreamentos de Entrada

- `otelcol_receiver_accepted_spans`
- `otelcol_receiver_refused_spans`
- `by (receiver,transport)`

### Pipeline de Métricas de Entrada

- `otelcol_receiver_accepted_metric_points`
- `otelcol_receiver_refused_metric_points`
- `by (receiver,transport)`

### Processador

Atualmente, o único processador presente na aplicação demo é um processador
em lote, que é usado por ambos os pipelines de rastreamentos e métricas.

- `otelcol_processor_batch_batch_send_size_sum`

### Pipeline de Rastreamentos de Saída

- `otelcol_exporter_sent_spans`
- `otelcol_exporter_send_failed_spans`
- `by (exporter)`

### Pipeline de Métricas de Saída

- `otelcol_exporter_sent_metric_points`
- `otelcol_exporter_send_failed_metric_points`
- `by (exporter)`

### Coleta do Prometheus

- `scrape_samples_scraped`
- `by (job)`

## Dashboard

Você pode acessar o dashboard navegando para a interface do Grafana, selecionando o
dashboard **OpenTelemetry Collector Data Flow** sob o ícone de navegação no
lado esquerdo da tela.

![Dashboard de Fluxo de Dados do OpenTelemetry Collector](otelcol-data-flow-dashboard.png)

O dashboard tem quatro seções principais:

1. Métricas de Processo
2. Pipeline de Rastreamentos
3. Pipeline de Métricas
4. Coleta do Prometheus

As seções 2, 3 e 4 representam o fluxo de dados geral usando as métricas mencionadas
acima. Além disso, a taxa de exportação é calculada para cada pipeline para entender
o fluxo de dados.

### Taxa de Exportação

A taxa de exportação é basicamente a razão entre as métricas de receptor e exportador. Você
pode notar na captura de tela do dashboard acima que a taxa de exportação nas métricas
é muito maior que as métricas recebidas. Isso é porque a aplicação demo
está configurada para gerar métricas de span que é um processador que gera
métricas a partir de spans dentro do coletor conforme ilustrado no diagrama de visão geral.

### Métricas de Processo

Métricas de processo muito limitadas mas informativas são adicionadas ao dashboard. Por
exemplo, você pode observar mais de uma instância do otelcol executando no
sistema durante reinicializações ou similar. Isso pode ser útil para entender picos
no fluxo de dados.

![Métricas de Processo do OpenTelemetry Collector](otelcol-dashboard-process-metrics.png)
