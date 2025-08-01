---
title: 自适应性
description: 如何配置一个具有自适应性的 OTel Collector 数据管道
default_lang_commit: 6eddc725571667e112a41aa7422bcd4c69764503
---

OpenTelemetry Collector 通过组件和配置设计，旨在尽可能减少遥测数据在处理和导出过程中的丢失。
然而，理解可能导致数据丢失的场景及其应对措施，对于构建一个具有自适应性的可观测性数据管道至关重要。

## 理解 Collector 的自适应性 {#understanding-collector-resilience}

一个具有自适应性的 Collector 能够在面临不利条件时依然保持遥测数据的流动和处理能力，确保整体的可观测性管道仍然可用。

Collector 的自适应性主要体现在以下场景：当配置的终端（即链路、指标或日志的目标接收方）不可用，或者
Collector 实例本身发生崩溃等问题时，它是如何处理数据的。

## 发送队列（内存缓冲） {#sending-queue-in-memory-buffering}

Collector 导出器中内建的最基本的自适应性机制是发送队列。

- 工作原理：当配置一个导出器时，通常会包含一个发送队列，它在将数据发送到下游终端前，
  会先在内存中进行缓冲。如果终端是可用的，数据会快速通过。
- 处理终端不可用情况：如果终端不可用（如网络问题或后端重启），导出器无法立即发送数据。
  此时，它不会丢弃数据，而是将其加入内存中的发送队列。
- 重试机制：Collector 会使用带指数退避和抖动的重试机制。在等待一段时间后，
  它会重复尝试发送缓冲数据。默认情况下，它最多重试 5 分钟。
- 数据丢失场景：
  - 队列满：内存队列的大小是可配置的（默认通常为 1000 批/请求）。如果终端持续不可用且持续有新数据进入，
    队列可能会被填满。一旦队列满，为防止 Collector 内存耗尽，新的数据将被丢弃。
  - 重试超时：如果终端不可用时间超过配置的最大重试时长（默认 5 分钟），Collector
    会停止重试队列中最早的数据并将其丢弃。

- 配置方式：你可以在导出器设置中配置队列大小和重试行为：

  ```yaml
  exporters:
    otlp:
      endpoint: otlp.example.com:4317
      sending_queue:
        storage: file_storage
        queue_size: 5_000 # 增大队列容量（默认是 1000）
      retry_on_failure:
        initial_interval: 5s
        max_interval: 30s
        max_elapsed_time: 10m # 增大最大重试时长（默认是 300 秒）
  ```

{{% alert title="提示：为远程导出器启用发送队列" %}}
为通过网络发送数据的任何导出器启用发送队列。根据预期的数据量、Collector 可用内存和终端的可接受宕机时间，调整 `queue_size`
和 `max_elapsed_time`。监控以下队列指标：`otelcol_exporter_queue_size` 和 `otelcol_exporter_queue_capacity`。
{{% /alert %}}

## 持久化存储（预写日志 - WAL） {#persistent-storage-write-ahead-log-wal}

为了在 Collector 实例本身崩溃或重启时防止数据丢失，可以为发送队列启用持久化存储，使用 `file_storage` 扩展。

- 工作原理：发送队列不仅在内存中缓冲数据，还会在尝试导出前将数据写入磁盘上的预写日志（WAL）。
- 处理 Collector 崩溃：如果 Collector 在数据仍在队列中时崩溃，数据会被保存在磁盘上。当
  Collector 重启后，它会从 WAL 读取数据并继续尝试将其发送到终端。
- 数据丢失场景：如果磁盘发生故障、空间不足，或 Collector 重启后终端仍然长时间不可用，
  仍可能导致数据丢失。其可靠性不如专门的消息队列。
- 配置方式：
  1. 定义 `file_storage` 扩展。
  2. 在导出器的 `sending_queue` 配置中引用该存储 ID。

  ```yaml
  extensions:
    file_storage: # 定义扩展实例
      directory: /var/lib/otelcol/storage # 选择一个持久目录

  exporters:
    otlp:
      endpoint: otlp.example.com:4317
      sending_queue:
        storage: file_storage # 引用该存储扩展实例

  service:
    extensions: [file_storage] # 在 service 配置中启用扩展
    pipelines:
      traces:
        receivers: [otlp]
        exporters: [otlp]
  ```

{{% alert title="提示：为关键 Collector 启用 WAL" %}}
对于关键的 Collector（如 Gateway 实例或负责采集关键数据的 Agent），在无法接受 Collector
崩溃导致数据丢失的情况下，使用持久化存储。确保所选目录拥有足够的磁盘空间和正确权限。
{{% /alert %}}

## 消息队列 {#message-queues}

在 Collector 层之间（例如 Agent 到 Gateway）或 Collector 到供应商后端之间，
为实现最高级别的自适应性，可以引入像 Kafka 这样的专用消息队列。

- 工作原理：一个 Collector 实例（Agent）使用 Kafka 导出器将数据发送到 Kafka 主题，另一个
  Collector 实例（Gateway）使用 Kafka 接收器从该主题中消费数据。
- 处理终端/Collector 不可用的情况：
  - 如果消费方 Collector（Gateway）宕机，消息会积压在 Kafka 主题中（直到 Kafka 的保留时间达到）。
    只要 Kafka 正常，生产方 Collector（Agent）不会受影响。
  - 如果生产方 Collector（Agent）宕机，队列中不会有新数据，但消费方可以继续处理已有消息。
  - 如果 Kafka 本身宕机，生产方 Collector 需要使用自身的自适应性机制（如发送队列 + WAL）对发送到 Kafka 的数据进行缓冲。

- 数据丢失场景：数据丢失主要发生在 Kafka 本身（集群故障、主题配置错误、数据过期）或生产方
  Collector 无足够本地缓冲而发送失败的情况下。
- 配置方式：
  - **Agent Collector 配置（生产方）：**

    ```yaml
    exporters:
      kafka:
        brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
        topic: otlp_traces

    receivers:
      otlp:
        protocols:
          grpc:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [kafka]
    ```

  - **Gateway Collector 配置（消费方）：**

    ```yaml
    receivers:
      kafka:
        brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
        topic: otlp_traces
        initial_offset: earliest # 处理积压数据

    exporters:
      otlp:
        endpoint: otlp.example.com:4317
        # 可考虑为 Gateway 到后端的导出也配置队列/重试

    service:
      pipelines:
        traces:
          receivers: [kafka]
          exporters: [otlp]
    ```

{{% alert title="提示：为关键路径使用消息队列" %}}
对于要求高可靠性的数据路径，特别是跨网络边界（如数据中心间、可用区间、或发送到云供应商）使用消息队列。
Kafka 等系统具有内建的强大自适应性，但也会增加运维复杂度，并需要具备管理消息系统的经验。
{{% /alert %}}

## 数据丢失的可能场景 {#circumstances-of-data-loss}

以下情况可能导致数据丢失：

1. **网络不可用 + 超时**：下游终端不可用时间超过 `retry_on_failure` 设置中的 `max_elapsed_time`。
2. **网络不可用 + 队列溢出**：下游终端不可用，且发送队列（内存或持久）被填满，在终端恢复前产生的新数据被丢弃。
3. **Collector 崩溃（未使用持久化）**：Collector 实例崩溃或被终止，且仅使用了内存发送队列，内存中的数据将丢失。
4. **持久存储故障**：`file_storage` 使用的磁盘发生故障或空间不足。
5. **消息队列故障**：外部消息队列（如 Kafka）发生故障或数据丢失事件，且生产方 Collector 未配置足够的本地缓冲。
6. **配置错误**：导出器或接收器配置错误，阻止数据流动。
7. **自适应性机制被禁用**：配置中显式禁用了发送队列或重试机制。

## 预防数据丢失的建议 {#recommendations-for-preventing-data-loss}

遵循以下建议以最小化数据丢失并确保遥测数据采集的可靠性：

1. **始终使用发送队列**：为通过网络发送数据的导出器启用 `sending_queue`。
2. **监控 Collector 指标**：主动监控 `otelcol_exporter_queue_size`、`otelcol_exporter_queue_capacity`、
   `otelcol_exporter_send_failed_spans`（以及指标/日志的等价对象）以早期发现问题。
3. **调整队列大小与重试参数**：根据预期负载、内存/磁盘资源和可接受的终端宕机时间调整 `queue_size` 和 `retry_on_failure` 参数。
4. **使用持久化存储（WAL）**：对于不允许 Collector 重启导致数据丢失的 Agent 或 Gateway，配置 `file_storage` 扩展。
5. **考虑使用消息队列**：若跨网络段或 Collector 层解耦需要最大持久性，并且能接受运维开销，可以使用 Kafka 等托管消息队列。
6. **采用合适的部署模式**：
   - 使用 Agent + Gateway 架构。Agent 负责本地采集，Gateway 负责处理、批量化和自适应性导出。
   - 将自适应性机制（队列、WAL、Kafka）集中用于网络跳点：Agent -> Gateway，Gateway -> 后端。
   - 应用程序（SDK）与本地代理 Agent（边车/DaemonSet）之间通常网络可靠，
     此处添加队列有时可能适得其反，若 Agent 不可用，反而影响应用程序。

通过理解这些机制并合理配置，可以显著增强你的 OpenTelemetry Collector 部署的自适应性，最大限度减少数据丢失。
