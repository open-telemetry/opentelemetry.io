---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

## Zipkin

### 后端设置 {#zipkin-setup}

{{% alert title=提示 %}}

如果你已经设置了 Zipkin 或兼容 Zipkin 的后端，可以跳过本节并直接为你的应用设置
[Zipkin 导出器依赖](#zipkin-dependencies)。

{{% /alert %}}

你可以通过执行以下命令，在 Docker 容器中运行 [Zipkin](https://zipkin.io/)：

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
