---
default_lang_commit: 8e37b19820e9ffded066ccfc5b5e282c896db362
---

## Zipkin

### 后端设置 {#zipkin-setup}

{{% alert title=提示 %}}

如果你已经设置了 Zipkin 或兼容 Zipkin 的后端，可以跳过本节并直接为你的应用设置 [Zipkin exporter dependencies](#zipkin-dependencies)

{{% /alert %}}

你可以通过执行以下命令，在 Docker 容器中运行 [Zipkin](https://zipkin.io/)：

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
