---
title: Запуск OBI як самостійного процесу
linkTitle: Самостійний процес
description: Дізнайтеся, як налаштувати та запустити OBI як самостійний процес Linux.
weight: 5
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

OBI може працювати як самостійний процес ОС Linux з підвищеними привілеями, який може перевіряти інші процеси, що виконуються.

## Завантаження та встановлення {#download-and-install}

> [!NOTE]
>
> Ми працюємо над наданням самостійного бінарного дистрибутиву. Щоб відстежувати заплановані оновлення, див. [open-telemetry/opentelemetry-ebpf-instrumentation#13][#13].

[#13]: https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/issues/13

Ви можете отримати OBI, витягнувши необхідні файли з образу контейнера.

```sh
IMAGE=otel/ebpf-instrument:main
docker pull $IMAGE
ID=$(docker create $IMAGE)
docker cp $ID:ebpf-instrument .
docker cp $ID:obi-java-agent.jar .
docker rm -v $ID
```

Важливо, щоб обидва файли `ebpf-instrument` та `obi-java-agent.jar` знаходилися в одній теці.

## Налаштування OBI {#set-up-obi}

1. Створіть файл конфігурації відповідно до документації [параметрів конфігурації](../../configure/options/). Ви можете розпочати з [прикладу YAML конфігурації OBI](../../configure/example/).

2. Запустіть OBI як привілейований процес:

```bash
sudo ./ebpf-instrument --config=<path to config file>
```

## Дозволи {#permissions}

OBI вимагає підвищених привілеїв для належного функціонування. Для отримання додаткової інформації про конкретні можливості, які потрібні, дивіться [документацію безпеки](../../security/).
