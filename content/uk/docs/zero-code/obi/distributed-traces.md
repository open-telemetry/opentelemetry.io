---
title: Розподілені трейси з OBI
linkTitle: Розподілені трейси
description: Дізнайтеся про підтримку розподілених трейсів в OBI.
weight: 22
default_lang_commit: 5b55172d51fb21f69c2f4fc9eb014f72a2b1c50a
---

## Вступ {#introduction}

OBI підтримує розподілені трейси для застосунків з деякими обмеженнями та обмеженнями версій ядра.

Розподілене трасування реалізується через поширення значення заголовка [W3C `traceparent`](https://www.w3.org/TR/trace-context/). Поширення контексту `traceparent` є автоматичним і не вимагає жодних дій або конфігурації.

OBI читає будь-які вхідні значення заголовка контексту трасування, відстежує потік виконання застосунків та поширює контекст трасування, автоматично додаючи поле `traceparent` у вихідні HTTP/gRPC запити. Якщо застосунок вже додав поле `traceparent` у вихідні запити, OBI використовує це значення для трасування замість свого власного згенерованого контексту трасування. Якщо OBI не може знайти вхідне значення контексту `traceparent`, він генерує його відповідно до специфікації W3C.

## Реалізація {#implementation}

Поширення контексту трасування реалізується двома різними способами:

1. Через запис інформації про вихідні заголовки на мережевому рівні
2. Через запис інформації про заголовки на рівні бібліотеки для Go

Залежно від мови програмування, якою написано ваш сервіс, OBI використовує один або обидва підходи до поширення контексту. Ми використовуємо ці кілька підходів для реалізації поширення контексту, оскільки запис памʼяті за допомогою eBPF залежить від конфігурації ядра та можливостей системи Linux, наданих OBI. Для отримання додаткової інформації про цю тему дивіться нашу доповідь на KubeCon NA 2024 [So You Want to Write Memory with eBPF?](https://www.youtube.com/watch?v=TUiVX-44S9s).

Поширення контексту на **мережевому рівні** стандартно **вимкнено** і може бути увімкнено шляхом встановлення змінної середовища `OTEL_EBPF_BPF_CONTEXT_PROPAGATION=all` або шляхом зміни файлу конфігурації OBI:

```yaml
ebpf:
  context_propagation: 'all'
```

### Поширення контексту на мережевому рівні {#context-propagation-at-network-level}

Поширення контексту на мережевому рівні реалізується шляхом запису інформації про контекст трасування у вихідні HTTP заголовки, а також на рівні TCP/IP пакетів. Поширення контексту HTTP повністю сумісне з будь-якою іншою бібліотекою трасування на базі OpenTelemetry. Це означає, що сервіси, інструментовані OBI, правильно передають інформацію про трасування, коли надсилають запити до та отримують відповіді від сервісів, інструментованих SDK OpenTelemetry. Ми використовуємо [Linux Traffic Control (TC)](<https://en.wikipedia.org/wiki/Tc_(Linux)>) для виконання коригування мережевих пакетів, що вимагає, щоб інші eBPF програми, які використовують Linux Traffic Control, правильно поєднувалися з OBI. Для спеціальних міркувань щодо Cilium CNI зверніться до нашого [Посібника з сумісності Cilium](../cilium-compatibility/).

Для трафіку, зашифрованого за допомогою TLS (HTTPS), OBI не може вставити інформацію про трасування у вихідні HTTP заголовки і натомість вставляє інформацію на рівні TCP/IP пакетів. Через це обмеження OBI може надсилати інформацію про трасування лише іншим сервісам, інструментованим OBI. Проксі L7 та балансувальники навантаження порушують поширення контексту TCP/IP, оскільки оригінальні пакети скидаються та відтворюються далі за течією. Парсинг вхідної інформації про контекст трасування з сервісів, інструментованих OpenTelemetry SDK, все ще працює.

gRPC та HTTP/2 наразі не підтримуються.

Цей тип поширення контексту працює для будь-якої мови програмування і не вимагає, щоб OBI працював у режимі `privileged` або мав надану можливість `CAP_SYS_ADMIN`. Для отримання додаткової інформації дивіться розділ [Розподілені трасування та поширення контексту](../configure/metrics-traces-attributes/) конфігурації.

#### Налаштування Kubernetes {#kubernetes-configuration}

Рекомендований спосіб розгортання OBI на Kubernetes з підтримкою розподілених трасувань на мережевому рівні - це `DaemonSet`.

Наступна конфігурація `Kubernetes` повинна бути використана:

- OBI повинен бути розгорнутий як `DaemonSet` з доступом до мережі хосту (`hostNetwork: true`).
- Шлях `/sys/fs/cgroup` з хосту повинен бути змонтований як локальний `/sys/fs/cgroup` шлях.
- Можливість `CAP_NET_ADMIN` повинна бути надана контейнеру OBI.

Наступний фрагмент YAML показує приклад конфігурації розгортання OBI:

```yaml
spec:
  serviceAccount: obi
  hostPID: true # <-- Важливо. Потрібно в режимі DaemonSet, щоб OBI міг виявити всі контрольовані процеси
  hostNetwork: true # <-- Важливо. Потрібно в режимі DaemonSet, щоб OBI міг бачити всі мережеві пакети
  dnsPolicy: ClusterFirstWithHostNet
  containers:
    - name: obi
      resources:
        limits:
          memory: 120Mi
      terminationMessagePolicy: FallbackToLogsOnError
      image: 'docker.io/otel/ebpf-instrument:main'
      imagePullPolicy: 'Always'
      env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: 'http://otelcol:4318'
        - name: OTEL_EBPF_KUBE_METADATA_ENABLE
          value: 'autodetect'
        - name: OTEL_EBPF_CONFIG_PATH
          value: '/config/obi-config.yml'
      securityContext:
        runAsUser: 0
        readOnlyRootFilesystem: true
        capabilities:
          add:
            - BPF # <-- Важливо. Потрібно для більшості eBPF проб, щоб вони працювали правильно.
            - SYS_PTRACE # <-- Важливо. Дозволяє OBI отримувати доступ до простору імен контейнера та перевіряти виконувані файли.
            - NET_RAW # <-- Важливо. Дозволяє OBI використовувати фільтри сокетів для http запитів.
            - CHECKPOINT_RESTORE # <-- Важливо. Дозволяє OBI відкривати ELF файли.
            - DAC_READ_SEARCH # <-- Важливо. Дозволяє OBI відкривати ELF файли.
            - PERFMON # <-- Важливо. Дозволяє OBI завантажувати BPF застосунки.
            - NET_ADMIN # <-- Важливо. Дозволяє OBI впроваджувати інформацію про контекст HTTP та TCP.
      volumeMounts:
        - name: cgroup
          mountPath: /sys/fs/cgroup # <-- Важливо. Дозволяє OBI моніторити всі нові сокети для відстеження вихідних запитів.
        - mountPath: /config
          name: obi-config
  tolerations:
    - effect: NoSchedule
      operator: Exists
    - effect: NoExecute
      operator: Exists
  volumes:
    - name: obi-config
      configMap:
        name: obi-config
    - name: cgroup
      hostPath:
        path: /sys/fs/cgroup
```

Якщо `/sys/fs/cgroup` не змонтовано як локальний шлях тому для OBI `DaemonSet`, деякі запити можуть не мати свого контексту. Ми використовуємо цей шлях тому, щоб слухати новостворені сокети.

#### Обмеження версії ядра {#kernel-version-limitations}

Поширення контексту на мережевому рівні та розбір вхідних заголовків зазвичай вимагає ядра 5.17 або новішого для додавання та використання BPF-циклів.

Деякі полатані ядра, такі як RHEL 9.2, можуть мати цю функціональність перенесену на старіші ядра. Встановлення OTEL_EBPF_OVERRIDE_BPF_LOOP_ENABLED пропускає перевірки ядра у випадку, якщо ваше ядро включає цю функціональність, але є нижчим за 5.17.

### Поширення контексту Go шляхом інструментування на рівні бібліотеки {#go-context-propagation-by-instrumenting-at-library-level}

Цей тип поширення контексту підтримується лише для Go-застосунків і використовує підтримку запису памʼяті користувача eBPF (`bpf_probe_write_user`). Перевагою цього підходу є те, що він працює для HTTP/HTTP2/HTTPS і gRPC з деякими обмеженнями, однак використання `bpf_probe_write_user` вимагає, щоб OBI було надано `CAP_SYS_ADMIN` або він був налаштований для роботи як `privileged` контейнер.

#### Integration with Go manual instrumentation {#integration-with-go-manual-instrumentation}

OBI автоматично інтегрується з ручними відрізками за допомогою [Auto SDK](/docs/zero-code/go/autosdk). Дивіться документацію по Auto SDK, щоб дізнатися більше.

#### Обмеження режиму цілісності ядра {#kernel-integrity-mode-limitations}

Для того, щоб записати значення `traceparent` у вихідні заголовки HTTP/gRPC запитів, OBI потрібно записати в памʼять процесу, використовуючи [**bpf_probe_write_user**](https://www.man7.org/linux/man-pages/man7/bpf-helpers.7.html) eBPF helper. Оскільки ядро 5.14 (з виправленнями, перенесеними на серію 5.10) цей helper захищений (і недоступний для BPF застосунків), якщо Linux Kernel працює в режимі `integrity` **lockdown**. Режим цілісності ядра зазвичай стандартно увімкнено, якщо ядро має [**Secure Boot**](https://wiki.debian.org/SecureBoot) увімкнено, але його також можна увімкнути вручну.

OBI автоматично перевіряє, чи може він використовувати helper `bpf_probe_write_user`, і активує поширення контексту лише в тому випадку, якщо це дозволено конфігурацією ядра. Перевірте режим **lockdown** ядра Linux, виконавши наступну команду:

```shell
cat /sys/kernel/security/lockdown
```

Якщо цей файл існує і режим є будь-яким іншим, ніж `[none]`, OBI не може виконати поширення контексту, і розподілене трасування вимкнено.

#### Розподілене трасування для Go в контейнеризованих середовищах (включаючи Kubernetes) {#distributed-tracing-for-go-in-containerized-environments-including-kubernetes}

Тому через обмеження режиму **lockdown** ядра, файли конфігурації Docker і Kubernetes повинні монтувати том `/sys/kernel/security/` для **контейнера OBI** з хост-системи. Таким чином OBI може правильно визначити режим **lockdown** ядра Linux. Ось приклад конфігурації Docker compose, яка забезпечує OBI достатньою інформацією для визначення режиму **lockdown**:

```yaml
services:
  ...
  obi:
    image: 'docker.io/otel/ebpf-instrument:main'
    environment:
      OTEL_EBPF_CONFIG_PATH: "/configs/obi-config.yml"
    volumes:
      - /sys/kernel/security:/sys/kernel/security
      - /sys/fs/cgroup:/sys/fs/cgroup
```

Якщо том `/sys/kernel/security/` не змонтовано, OBI вважає, що ядро Linux не працює в режимі підтримки цілісності.
