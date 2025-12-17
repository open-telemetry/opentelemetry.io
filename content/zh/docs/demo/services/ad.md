---
title: 广告服务
linkTitle: 广告
aliases: [adservice]
default_lang_commit: 6588437286e916c2eb44a721161ce46c21f1706b
---

此服务根据上下文关键词为用户提供合适的广告。广告内容为商店中可用的商品。

[广告服务源码](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## 自动插桩 {#auto-instrumentation}

此服务依赖 OpenTelemetry Java 代理来自动插桩对 gRPC 等库的观测，并配置 OpenTelemetry SDK。
此代理通过 `-javaagent` 命令行参数传递到进程中。在 `Dockerfile` 中通过 `JAVA_TOOL_OPTIONS`
添加命令行参数，并在自动生成的 Gradle 启动脚本中使用。

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## 链路 {#traces}

### 向自动插桩的 Span 添加属性 {#add-attributes-to-auto-instrumented-spans}

在自动插桩的代码执行过程中，可以通过上下文获取当前的 Span：

```java
Span span = Span.current();
```

通过 `setAttribute` 方法可以向 Span 添加属性。在 `getAds` 函数中添加多个属性：

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### 添加 Span 事件 {#add-span-events}

可以使用 `addEvent` 方法向 Span 添加事件。在 `getAds` 函数中，当捕获异常时添加带属性的事件：

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### 设置 Span 状态 {#setting-span-status}

当操作结果为错误时，应使用 `setStatus` 方法相应地设置 Span 的状态。
在 `getAds` 函数中，当捕获异常时设置 Span 状态：

```java
span.setStatus(StatusCode.ERROR);
```

### 新建 Span {#create-new-spans}

可以通过 `Tracer.spanBuilder("spanName").startSpan()` 创建并启动新的 Span。
新建的 Span 应通过 `Span.makeCurrent()` 设置到上下文中。在 `getRandomAds` 函数中，
将创建一个新的 Span，设置到上下文中，执行操作，最后结束此 Span：

```java
// 手动创建并启动一个新的 Span
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// 将 Span 设置到上下文中，这样子 Span 启动时父 Span 会被正确设置
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## 指标 {#metrics}

### 初始化指标 {#initializing-metrics}

创建指标的第一步类似于创建 Span，需要初始化一个 `Meter` 实例，例如 `GlobalOpenTelemetry.getMeter("ad")`。
然后可以使用此 `Meter` 实例提供的构建方法来创建所需的指标工具，例如：

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Counts ad requests by request and response type")
  .build();
```

### 当前生成的指标 {#current-metrics-produced}

注意：以下所有指标名称在 Prometheus/Grafana 中将 `.` 字符转换为 `_`。

#### 自定义指标 {#custom-metrics}

当前可用的自定义指标包括：

- `app.ads.ad_requests`：广告请求计数器，包含维度以描述请求是否使用上下文关键词、响应是否为定向广告或随机广告。

#### 自动插桩指标 {#auto-instrumented-metrics}

应用中还提供以下自动插桩的指标：

- [JVM 运行时指标](/docs/specs/semconv/runtime/jvm-metrics/)
- [RPC 延迟指标](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## 日志 {#logs}

广告服务使用 Log4J 进行日志记录，此日志系统由 OpenTelemetry Java 代理自动配置。

它会在日志记录中包含链路上下文，从而支持日志与链路的关联。
