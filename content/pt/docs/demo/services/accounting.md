---
title: Serviço de Contabilidade
linkTitle: Contabilidade
aliases: [accountingservice]
---

Este serviço calcula o valor total dos produtos vendidos. Isso é apenas simulado
e os pedidos recebidos são impressos.

[Serviço de Contabilidade](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/accounting/)

## Auto-instrumentação

Este serviço depende da Instrumentação Automática do OpenTelemetry .NET para
instrumentar automaticamente bibliotecas como Kafka e configurar o
SDK do OpenTelemetry. A instrumentação é adicionada via pacote Nuget
[OpenTelemetry.AutoInstrumentation](https://www.nuget.org/packages/OpenTelemetry.AutoInstrumentation)
e ativada usando variáveis de ambiente que são obtidas de `instrument.sh`.
Usar essa abordagem de instalação também garante que todas as dependências de
instrumentação estejam adequadamente alinhadas com a aplicação.

## Publicação

Adicione `--use-current-runtime` ao comando `dotnet publish` para distribuir
componentes de runtime nativo apropriados.

```sh
dotnet publish "./AccountingService.csproj" --use-current-runtime -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
