---
title: Запуск OBI як самостійного процесу
linkTitle: Самостійний процес
description: Дізнайтеся, як налаштувати та запустити OBI як самостійний процес Linux.
weight: 5
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

OBI може працювати як самостійний процес ОС Linux з підвищеними привілеями, який може перевіряти інші процеси, що виконуються.

## Завантаження та перевірка {#download-and-verify}

OBI надає скомпільовані двійкові файли для Linux (amd64 і arm64). Завантажте останню версію можна з [сторінки випусків OBI на GitHub](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases). Кожен випуск містить:

- `obi-v<version>-linux-amd64.tar.gz` — архів Linux AMD64/x86_64
- `obi-v<version>-linux-arm64.tar.gz` — архів Linux ARM64
- `SHA256SUMS` — файл контрольних сум для перевірки цілісності завантажених файлів

Встановіть потрібну вам версію для вашої архітектури:

```sh
# Вкажіть потрібну версію (дивіться останню версію на
# https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)
VERSION=0.5.0

# Визначте вашу архітектуру
# Для Intel/AMD 64-bit: amd64
# Для ARM 64-bit: arm64
ARCH=amd64

# Завантажте архів для вашої архітектури
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.tar.gz

# Завантажте файл контрольних сум
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/SHA256SUMS

# Перевірте архів
sha256sum -c SHA256SUMS --ignore-missing

# Розпакуйте архів
tar -xzf obi-v${VERSION}-linux-${ARCH}.tar.gz
```

Архів містить:

- `obi` — основний виконуваний файл OBI
- `k8s-cache` — двійковий файл для кешу Kubernetes
- `obi-java-agent.jar` — агент інструментування Java
- `LICENSE` — ліцензія проєкта
- `NOTICE` — інформація про юридичні аспекти
- `NOTICES/` — ліцензії та визнання третіх осіб

> [!IMPORTANT]
>
> Файл `obi-java-agent.jar` має залишатися в тій самій теці, що і двійковий файл `obi`. Це необхідно для правильного функціонування інструментування Java.

## Встановити в систему {#install-to-system}

Після розпакування архіву ви можете встановити бінарні файли в теку, що знаходиться у вашому PATH, щоб їх можна було використовувати з будь-якої теки.

У наведеному нижче прикладі встановлюється в `/usr/local/bin`, що є стандартним місцем розташування в більшості дистрибутивів Linux. Ви можете встановити в будь-яку іншу теку у вашому PATH:

```bash
# Перенесення бінарних файлів у теку у вашому PATH
sudo cp obi /usr/local/bin/

# Агент Java ПОВИНЕН бути в тій самій теці, що і двійковий файл OBI
sudo cp obi-java-agent.jar /usr/local/bin/

# Перевірка встановлення
obi --version
```

## Налаштування OBI {#set-up-obi}

1. Створіть файл конфігурації відповідно до документації [параметрів конфігурації](../../configure/options/). Ви можете розпочати з [прикладу YAML конфігурації OBI](../../configure/example/).

2. Запустіть OBI як привілейований процес:

   ```bash
   sudo obi --config=<path to config file>
   ```

   Якщо ви встановили OBI в теку, що відсутня у вашому PATH, ви можете запустити його з розпакованої теки:

   ```bash
   sudo ./obi --config=<path to config file>
   ```

## Дозволи {#permissions}

OBI вимагає підвищених привілеїв для належного функціонування. Для отримання додаткової інформації про конкретні можливості, які потрібні, дивіться [документацію безпеки](../../security/).
