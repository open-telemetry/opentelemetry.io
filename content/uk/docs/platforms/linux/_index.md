---
title: OpenTelemetry на Linux-хостах
linkTitle: Linux
description: Встановіть OpenTelemetry як системний пакунок для автоматичного інструментування застосунків, що працюють на Linux-хості.
weight: 250
cSpell:ignore: metapackage метапакунку метапакунком лінкер
default_lang_commit: edb244ceebdcbbb33c640eaac8d218dbc480e4c0
---

Налаштування OpenTelemetry зазвичай залежить від того, де запущені ваші застосунки. Деякі середовища високоавтоматизовані, такі як [Kubernetes](/docs/platforms/kubernetes/), завдяки OpenTelemetry Operator, або [Functions as a Service](/docs/platforms/faas/) з OpenTelemetry Lambda шарами. Але багато Java, .NET, Node.js та Python застосунків запускаються безпосередньо на Linux-хостах, де їх інструментування традиційно означало ручне завантаження агентів та налаштування змінних середовища.

[OpenTelemetry Packaging SIG](https://github.com/open-telemetry/opentelemetry-packaging) надає **системні пакунки**, які роблять OpenTelemetry залежністю самого хосту. Після встановлення єдиного пакунка та перезапуску ваших застосунків, Java, .NET, Node.js та Python процеси на хості автоматично інструментуються і починають надавати телеметрію.

## Як це працює {#how-it-works}

Пакунок `opentelemetry` є метапакунком, що залежить від:

- [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector), який налаштовує динамічний лінкер так, щоб підтримувані середовища виконання завантажували відповідне автоінструментування при запуску процесу.
- Мовно-специфічні пакунки автоінструментування для Java, .NET, Node.js та Python.

Після встановлення, інжектор приєднується до кожного щойно запущеного, динамічно приєднуваного процесу на хості. Він має видимий ефект лише на процеси підтримуваних середовищ виконання, завантажуючи для них відповідне автоінструментування; процеси середовищ виконання без OpenTelemetry SDK залишаються незмінними. Застосунки, що вже запущені, інструментуються після перезапуску. Стандартно, телеметрія експортується через OTLP на `localhost` портах `4317` (gRPC) та `4318` (HTTP), тому зазвичай ви запускаєте локальний [OpenTelemetry Collector](/docs/collector/) для приймання та пересилання. Collector сам розповсюджується як системні пакунки проєктом [OpenTelemetry Collector Releases](https://github.com/open-telemetry/opentelemetry-collector-releases); інтеграція його в цей репозиторій системних пакунків відстежується в [opentelemetry-collector-releases#1561](https://github.com/open-telemetry/opentelemetry-collector-releases/issues/1561).

Packaging та OBI SIG також планують поставляти [OpenTelemetry eBPF Instrumentation](/docs/zero-code/obi/) як системний пакунок, розширюючи інструментування без коду до додаткових середовищ виконання, таких як Go, Rust та C++.

## Початок роботи {#get-started}

- [Встановлення](installation/): додайте репозиторій та встановіть пакунок в Debian, Ubuntu, Fedora, або RHEL та похідні дистрибутиви.
- [Конфігурація](configuration/): вкажіть інжектор на ваш Collector або бекенд і налаштуйте, що інструментується.

## Статус та обмеження {#status-and-limitations}

> [!WARNING]
>
> Системні пакунки перебувають на початковому етапі і **ще не призначені для операційного використання на робочих навантаженнях**. Очікуйте змін по мірі зрілості історії пакування.
>
> Зокрема:
>
> - APT та YUM репозиторії наразі розміщені на GitHub Pages, що **не є їхнім фінальним місцем**.
> - Пакунки **ще не підписані**, тому інструкції встановлення вимикають перевірку підпису.
> - [OpenTelemetry Collector](/docs/collector/) ще не входить до базового метапакунку; ви встановите та запустите його окремо зараз.
>
> Packaging SIG активно шукає відгуки від кінцевих користувачів. Будь ласка, спробуйте пакунки і створюйте тікети в репозиторії [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging).

## Дізнайтеся більше {#learn-more}

- Блог-пост: [One-command OpenTelemetry setup on Linux hosts](/blog/2026/packaging-first-repo/)
- Репозиторій [opentelemetry-packaging](https://github.com/open-telemetry/opentelemetry-packaging) та його щотижнева зустріч SIG.
