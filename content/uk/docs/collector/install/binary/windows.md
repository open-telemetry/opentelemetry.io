---
title: Встановлення Collector у Windows
linkTitle: Windows
weight: 300
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

[Версії для Windows][releases] доступні у вигляді інсталяторів MSI та архівів tar з розширенням `.tar.gz`.

## Встановлення MSI {#msi-installation}

MSI встановлює Collector як службу Windows з назвою, що відповідає дистрибутиву, з назвою для показу "OpenTelemetry Collector", та реєструє джерело журналу Application Event Log з назвою дистрибутиву.

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

## Встановлення вручну {#manual-installation}

Для розпакування архіву tar.gz виконайте наступну команду:

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

Кожен випуск колектора містить виконуваний файл, який можна запустити після встановлення.

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
