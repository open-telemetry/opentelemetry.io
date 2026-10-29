---
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

## Zipkin

### Configuração do Backend {#zipkin-setup}

> [!NOTE]
>
> Caso já possua o Zipkin ou um _backend_ compatível com Zipkin configurado,
> poderá pular esta seção e configurar as
> [dependências do exportador Zipkin](#zipkin-dependencies) para a sua
> aplicação.

É possível executar o [Zipkin](https://zipkin.io/) em um contêiner Docker
através do seguinte comando:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
