---
title: Запустіть OBI як контейнер Docker
linkTitle: Docker
description: Дізнайтеся, як налаштувати та запустити OBI як окремий контейнер Docker, який інструментує інший контейнер.
weight: 2
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
cSpell:ignore: goblog
---

OBI може запускати автономний контейнер Docker, який може інструментувати процес, що виконується в іншому контейнері.

Знайдіть останній образ OBI на [Docker Hub](https://hub.docker.com/r/otel/ebpf-instrument) з наступною назвою:

```text
ebpf-instrument:main
```

Контейнер OBI повинен бути налаштований наступним чином:

- запустіть як **привілейований** контейнер або як контейнер з можливістю `SYS_ADMIN` (але цей останній варіант може не працювати в деяких середовищах контейнерів)
- Використовуйте простір імен PID `host`, щоб дозволити доступ до процесів в інших контейнерах.

## Приклад Docker CLI {#docker-cli-example}

Для цього прикладу вам потрібен контейнер, що виконує HTTP/S або gRPC сервіс. Якщо у вас його немає, ви можете використовувати цей [простий рушій для блогів, написаний на Go](https://macias.info):

```sh
docker run -p 18443:8443 --name goblog mariomac/goblog:dev
```

Наведена команда запускає простий HTTPS-застосунок. Процес відкриває внутрішній порт контейнера `8443`, який потім експонується на рівні хосту як порт `18443`.

Встановіть змінні середовища, щоб налаштувати OBI для виводу в stdout і прослуховування порту (контейнера) для перевірки виконуваного файлу:

```sh
export OTEL_EBPF_TRACE_PRINTER=text
export OTEL_EBPF_OPEN_PORT=8443
```

OBI потрібно запускати з наступними налаштуваннями:

- в режимі `--privileged` або з можливістю `SYS_ADMIN` (хоча `SYS_ADMIN` може не бути достатньо в деяких середовищах контейнерів)
- простір імен PID `host`, з опцією `--pid=host`.

```sh
docker run --rm \
  -e OTEL_EBPF_OPEN_PORT=8443 \
  -e OTEL_EBPF_TRACE_PRINTER=text \
  --pid=host \
  --privileged \
  docker.io/otel/ebpf-instrument:main
```

Після запуску OBI відкрийте `https://localhost:18443` в вебоглядачі, скористайтеся застосунком для генерації тестових даних і переконайтеся, що OBI виводить запити на відстеження у stdout, подібні до:

```sh
time=2023-05-22T14:03:42.402Z level=INFO msg="creating instrumentation pipeline"
time=2023-05-22T14:03:42.526Z level=INFO msg="Starting main node"
2023-05-22 14:03:53.5222353 (19.066625ms[942.583µs]) 200 GET / [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (355.792µs[321.75µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:03:53.5222353 (170.958µs[142.916µs]) 200 GET /static/img.png [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (7.243667ms[295.292µs]) 200 GET /entry/201710281345_instructions.md [172.17.0.1]->[localhost:18443] size:0B
2023-05-22 14:13:47.52221347 (115µs[75.625µs]) 200 GET /static/style.css [172.17.0.1]->[localhost:18443] size:0B
```

Тепер, коли OBI відстежує цільовий HTTP-сервіс, налаштуйте його для надсилання метрик і трейсів до точки доступу OpenTelemetry або налаштуйте збір метрик за допомогою Prometheus.

Для отримання інформації про те, як експортувати трейси та метрики, зверніться до документації [параметри конфігурації](../../configure/options/).

## Приклад Docker Compose {#docker-compose-example}

Наступний файл Docker Compose відтворює таку ж функціональність, як і приклад Docker CLI:

```yaml
version: '3.8'

services:
  # Сервіс для інструментування. Змініть його на будь-який
  # інший контейнер, який ви хочете інструментувати.
  goblog:
    image: mariomac/goblog:dev
    ports:
      # Експонує порт 18843, перенаправляючи його на порт 8443 контейнера
      - '18443:8443'

  autoinstrumenter:
    image: docker.io/otel/ebpf-instrument:latest
    pid: 'host'
    privileged: true
    environment:
      OTEL_EBPF_TRACE_PRINTER: text
      OTEL_EBPF_OPEN_PORT: 8443
```

Запустіть файл Docker Compose за допомогою наступної команди та скористайтеся застосунком для генерації трейсів:

```sh
docker compose -f compose-example.yml up
```
