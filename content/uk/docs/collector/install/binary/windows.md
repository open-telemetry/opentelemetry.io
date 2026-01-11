---
title: Встановлення Collector у Windows
linkTitle: Windows
weight: 300
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

## Windows

[Версії для Windows][releases] доступні у вигляді інсталяторів MSI та архівів tar з розширенням .tar.gz. MSI встановлює Collector як службу Windows з назвою, що відповідає дистрибутиву, з назвою для показу "OpenTelemetry Collector", та реєструє джерело журналу Application Event Log з назвою дистрибутиву.

### Встановлення MSI {#msi-installation}

```powershell
msiexec /i "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_x64.msi"
```

### Встановлення вручну {#manual-installation}

```powershell
Invoke-WebRequest -Uri "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_windows_amd64.tar.gz" -OutFile "otelcol_{{% param vers %}}_windows_amd64.tar.gz"
tar -xvzf otelcol_{{% param vers %}}_windows_amd64.tar.gz
```

Кожен випуск містить виконуваний файл Collector, який можна запустити після встановлення.

[releases]: https://github.com/open-telemetry/opentelemetry-collector-releases/releases
