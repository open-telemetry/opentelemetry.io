---
title: Instalar o Collector no Linux
linkTitle: Linux
weight: 100
default_lang_commit: 9f912d59a165ded5dec82d0e1a94c2aef54e5c57
---

Cada versão do Collector inclui pacotes APK, DEB e RPM para sistemas Linux
amd64/arm64/i386. Após a instalação, a configuração padrão fica disponível em
`/etc/otelcol/config.yaml`.

> Observação: o `systemd` é necessário para a configuração automática do
> serviço.

## Instalação via DEB {#deb-installation}

Para começar em sistemas Debian, execute os seguintes comandos:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_amd64.deb
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_arm64.deb
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo apt-get update
sudo apt-get -y install wget
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.deb
sudo dpkg -i otelcol_{{% param vers %}}_linux_386.deb
```

{{% /tab %}} {{< /tabpane >}}

## Instalação via RPM {#rpm-installation}

Para começar em sistemas Red Hat, execute os seguintes comandos:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_amd64.rpm
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_arm64.rpm
```

{{% /tab %}} {{% tab i386 %}}

```sh
sudo yum update
sudo yum -y install wget systemctl
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.rpm
sudo rpm -ivh otelcol_{{% param vers %}}_linux_386.rpm
```

{{% /tab %}} {{< /tabpane >}}

## Instalação manual {#manual-installation}

As [versões][releases] para Linux estão disponíveis para diversas arquiteturas.
É possível baixar o arquivo binário e instalá-lo manualmente na sua máquina:

{{< tabpane text=true >}} {{% tab AMD64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_amd64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_amd64.tar.gz
```

{{% /tab %}} {{% tab ARM64 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_arm64.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_arm64.tar.gz
```

{{% /tab %}} {{% tab i386 %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_386.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_386.tar.gz
```

{{% /tab %}} {{% tab ppc64le %}}

```sh
curl --proto '=https' --tlsv1.2 -fOL https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v{{% param vers %}}/otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
tar -xvf otelcol_{{% param vers %}}_linux_ppc64le.tar.gz
```

{{% /tab %}} {{< /tabpane >}}

## Configuração automática do serviço {#automatic-service-configuration}

Quando o OpenTelemetry Collector é executado como um serviço do `systemd`, ele
inicia por padrão com o arquivo de configuração `/etc/otelcol/config.yaml`.

Caso queira alterar essa configuração, você pode editar a variável
`OTELCOL_OPTIONS` no arquivo de ambiente do `systemd`,
`/etc/otelcol/otelcol.conf`. Também é possível definir variáveis de ambiente
adicionais para o serviço `otelcol` no mesmo arquivo. Para obter a lista
completa de opções suportadas, execute o seguinte comando:

```sh
/usr/bin/otelcol --help
```

Se você modificar o arquivo de configuração do Collector (`config.yaml`) ou o
arquivo de ambiente (`otelcol.conf`), é necessário reiniciar o serviço para
aplicar as alterações:

```sh
sudo systemctl restart otelcol
```

Para verificar a saída de logs do serviço `otelcol`, execute:

```sh
sudo journalctl -u otelcol
```

[releases]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
