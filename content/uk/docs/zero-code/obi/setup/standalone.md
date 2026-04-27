---
title: Запуск OBI як самостійного процесу
linkTitle: Самостійний процес
description: Дізнайтеся, як налаштувати та запустити OBI як самостійний процес Linux.
weight: 5
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
cSpell:ignore: cyclonedx
---

OBI може працювати як самостійний процес ОС Linux з підвищеними привілеями, який може перевіряти інші процеси, що виконуються.

## Завантаження та перевірка {#download-and-verify}

OBI надає скомпільовані двійкові файли для Linux (amd64 і arm64). Завантажте останню версію можна з [сторінки випусків OBI на GitHub](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases). Кожен випуск містить:

- `obi-v<version>-linux-amd64.tar.gz` — архів Linux AMD64/x86_64
- `obi-v<version>-linux-arm64.tar.gz` — архів Linux ARM64
- `obi-v<version>-linux-amd64.cyclonedx.json` — CycloneDX SBOM для архіву AMD64
- `obi-v<version>-linux-arm64.cyclonedx.json` — CycloneDX SBOM для архіву ARM64
- `obi-v<version>-source-generated.cyclonedx.json` — CycloneDX SBOM для архіву згенерованого з вихідного коду
- `obi-java-agent-v<version>.cyclonedx.json` — CycloneDX SBOM для вбудованого Java-агента та його залежностей
- `SHA256SUMS` — Контрольні суми для перевірки архівів випуску та SBOM активів

Образи контейнерів для того ж випуску також публікуються. Для інструкцій щодо завантаження образу та перевірки підпису дивіться [Запуск OBI як контейнера Docker](../docker/).

Встановіть потрібну вам версію для вашої архітектури:

```sh
# Вкажіть потрібну версію (дивіться останню версію на
# https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)
VERSION=0.6.0

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

Успішна перевірка повідомляє, що вимоги Cosign були підтверджені, і показує підписаний дайджест образу:

```text
obi-v${VERSION}-linux-${ARCH}.tar.gz: OK
```

Якщо перевірка не вдалася, `sha256sum` повідомляє `FAILED`. У такому випадку:

- переконайтеся, що `VERSION` відповідає архіву та файлу `SHA256SUMS`, які ви завантажили
- видаліть будь-які частково завантажені файли та завантажте їх знову
- перевіряйте лише ті файли, які ви фактично завантажили з цього випуску

Архів містить:

- `obi` — основний виконуваний файл OBI
- `k8s-cache` — двійковий файл для кешу Kubernetes
- `LICENSE` — ліцензія проєкта
- `NOTICE` — інформація про юридичні аспекти
- `NOTICES/` — ліцензії та визнання третіх осіб

> [!IMPORTANT]
>
> Починаючи з OBI v0.6.0, агент Java вбудований у двійковий файл `obi`. Окремий файл `obi-java-agent.jar` не потрібен. Під час виконання OBI витягує та кешує вбудований агент Java у `$XDG_CACHE_HOME/obi/java` (або `~/.cache/obi/java`).
>
> Тека кешу визначається обліковим записом користувача, який запускає `obi`. Коли ви використовуєте `sudo`, кеш зазвичай створюється в теці кешу користувача root (наприклад, `/root/.cache/obi/java`), якщо ви не перевизначите його. Для системних або сервісних розгортань встановіть `XDG_CACHE_HOME` у відповідне місце (наприклад, `XDG_CACHE_HOME=/var/cache/obi sudo -E obi ...`) або налаштуйте явний шлях до кешу відповідно до вашого середовища.

## SBOMs

Файли CycloneDX SBOM є необов'язковими метаданими для перевірки ланцюга постачання та автоматизації. Вони не потрібні для встановлення або запуску OBI.

Опубліковані SBOM описують вміст бінарних архівів та вбудованих компонентів у форматі [CycloneDX JSON](https://cyclonedx.org/). Вони можуть використовуватися зі стандартними інструментами SBOM для перевірки залежностей, ліцензій та компонентів без виконання бінарних файлів.

Завантажте SBOM, які ви хочете перевірити:

```sh
# SBOM для завантаженого бінарного архіву
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# SBOM для вбудованого Java-агента та його залежностей Java
wget https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases/download/v${VERSION}/obi-java-agent-v${VERSION}.cyclonedx.json

# Необов'язково: перевірте завантажені файли SBOM за допомогою SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing
```

Приклади команд для перевірки:

```sh
# Перелік імен компонентів та версій з архівного SBOM
jq '.components[] | {name, version}' obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Перевірка SBOM за допомогою Grype
grype sbom:obi-v${VERSION}-linux-${ARCH}.cyclonedx.json

# Перегляд графу залежностей Java-агента
jq '.components[] | {name, version}' obi-java-agent-v${VERSION}.cyclonedx.json
```

## Встановлення в систему {#install-to-system}

Після розпакування архіву ви можете встановити бінарні файли в теку, що знаходиться у вашому PATH, щоб їх можна було використовувати з будь-якої теки.

У наведеному нижче прикладі встановлюється в `/usr/local/bin`, що є стандартним місцем розташування в більшості дистрибутивів Linux. Ви можете встановити в будь-яку іншу теку у вашому PATH:

```bash
# Перенесення бінарних файлів у теку у вашому PATH
sudo cp obi /usr/local/bin/

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
