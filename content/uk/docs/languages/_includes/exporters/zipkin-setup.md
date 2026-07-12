---
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

## Zipkin

### Налаштування бекенду {#zipkin-setup}

> [!NOTE]
>
> Якщо у вас вже налаштований Zipkin або сумісний з Zipkin бекенд, ви можете пропустити цей розділ і налаштувати [залежності експортера Zipkin](#zipkin-dependencies) для вашого застосунку.

Ви можете запустити [Zipkin](https://zipkin.io/) у Docker контейнері, виконавши наступну команду:

```shell
docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
```
