---
default_lang_commit: 7d0c3f247ee77671d1135b0af535a2aca05fe359
---

## Zipkin

### Configuração do Backend {#zipkin-setup}

{{% alert-md title=Nota color=info %}}

Caso já possua o Zipkin ou um _backend_ compatível com Zipkin configurado,
poderá pular esta seção e configurar as
[dependências do exportador Zipkin](#zipkin-dependencies) para a sua aplicação.

{{% /alert-md %}}

É possível executar o [Zipkin][Zipkin](https://zipkin.io/) em um contêiner
Docker através do seguinte comando:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
