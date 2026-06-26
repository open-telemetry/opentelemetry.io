---
title: OpenTelemetry Operator Chart
linkTitle: Operator Chart
default_lang_commit: 924424b3aad888ee3ddb745eaed063021a5ef8d9
---

## Introdução

O [OpenTelemetry Operator](/docs/platforms/kubernetes/operator) é um Kubernetes
operador que gerencia [OpenTelemetry Collectors](/docs/collector) e
auto-instrumentação de _workloads_. Uma das formas de instalar o OpenTelemetry
Operator é por meio do
[OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator).

Para uso detalhado do OpenTelemetry Operator, acesse sua
[documentação](/docs/platforms/kubernetes/operator).

### Instalando o Chart

Para instalar o chart com o nome de versão `my-opentelemetry-operator`, execute
os seguintes comandos:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

```shell
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s" \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
```

Isso instalará um OpenTelemetry Operator com um certificado autoassinado e
_secret_.

### Configuração

O `values.yaml` padrão do chart do Operator está pronto para ser instalado, mas
espera que o Cert Manager já esteja presente no _cluster_.

No Kubernetes, para que o servidor de API se comunique com o componente _webhook_,
o _webhook_ requer um certificado TLS no qual o servidor de API esteja configurado
para confiar. Existem algumas formas diferentes de gerar/configurar o
certificado TLS necessário.

- O método mais simples e padrão é instalar o
  [cert-manager](https://cert-manager.io/docs/) e definir
  `admissionWebhooks.certManager.enabled` como `true`. Dessa forma, o
  cert-manager gerará um certificado autoassinado. Consulte a
  [instalação do cert-manager](https://cert-manager.io/docs/installation/kubernetes/)
  para mais detalhes.
- É possível fornecer um Issuer próprio configurando o valor
  `admissionWebhooks.certManager.issuerRef`. É necessário especificar o `kind`
  (Issuer ou ClusterIssuer) e o `name`. Note que esse método também requer a
  instalação do cert-manager.
- É possível usar um certificado autoassinado gerado automaticamente definindo
  `admissionWebhooks.certManager.enabled` como `false` e
  `admissionWebhooks.autoGenerateCert.enabled` como `true`. O Helm criará um
  cert autoassinado e um _secret_.
- É possível usar um certificado autoassinado gerado manualmente definindo tanto
  `admissionWebhooks.certManager.enabled` quanto
  `admissionWebhooks.autoGenerateCert.enabled` como `false`. Os valores
  necessários para `admissionWebhooks.cert_file`,
  `admissionWebhooks.key_file` e `admissionWebhooks.ca_file` devem ser fornecidos.
- É possível carregar _webhooks_ e certificados personalizados desabilitando
  `.Values.admissionWebhooks.create` e `admissionWebhooks.certManager.enabled`
  enquanto define o nome do _secret_ do cert personalizado em
  `admissionWebhooks.secretName`.
- É possível desabilitar _webhooks_ completamente desabilitando
  `.Values.admissionWebhooks.create` e definindo a variável de ambiente
  `.Values.manager.env.ENABLE_WEBHOOKS` como `false`.

Todas as opções de configuração (com comentários) disponíveis no chart podem ser
visualizadas no seu
[arquivo values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml).
