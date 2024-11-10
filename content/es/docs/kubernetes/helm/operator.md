---
title: OpenTelemetry Operator Chart
linkTitle: Operator Chart
default_lang_commit: 737d66aba66ab76da5edf2573eee225a14bf7579
# prettier-ignore
cSpell:ignore: kubelet descomponerlos reinicios preajuste autofirmado
---

## Introducción

El [OpenTelemetry Operator](/docs/kubernetes/operator) es un operador de Kubernetes
que gestiona [OpenTelemetry Collectors](/docs/collector) y
la auto-instrumentación de cargas de trabajo. Una de las formas de instalar el OpenTelemetry
Operator es a través del
[OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator).

Para un uso detallado del OpenTelemetry Operator, visita su
[documentación](/docs/kubernetes/operator).

### Instalación del Chart

Para instalar el chart con el nombre de lanzamiento `my-opentelemetry-operator`, ejecuta los
siguientes comandos:

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s" \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
```

Esto instalará un OpenTelemetry Operator con un certificado autofirmado y un secreto.

Configuración
El values.yaml predeterminado del chart del Operator está listo para ser instalado, pero se espera que Cert Manager ya esté presente en el clúster.

En Kubernetes, para que el servidor API se comunique con el componente webhook, el webhook requiere un certificado TLS que el servidor API esté configurado para confiar. Hay varias formas diferentes que puedes usar para generar/configurar el certificado TLS requerido.

- El método más fácil y predeterminado es instalar el cert-manager y establecer admissionWebhooks.certManager.create en true. De esta manera, cert-manager generará un certificado autofirmado. Consulta instalación de cert-manager para más detalles.
- Puedes proporcionar tu propio Emisor configurando el valor admissionWebhooks.certManager.issuerRef. Necesitarás especificar el kind (Issuer o ClusterIssuer) y el name. Ten en cuenta que este método también requiere la instalación de cert-manager.
- Puedes usar un certificado autofirmado generado automáticamente estableciendo admissionWebhooks.certManager.enabled en false y admissionWebhooks.autoGenerateCert.enabled en true. Helm creará un certificado autofirmado y un secreto para ti.
- Puedes usar tu propio certificado autofirmado generado estableciendo ambos admissionWebhooks.certManager.enabled y admissionWebhooks.autoGenerateCert.enabled en false. Debes proporcionar los valores necesarios a admissionWebhooks.cert_file, admissionWebhooks.key_file y admissionWebhooks.ca_file.
- Puedes cargar webhooks y certificados personalizados desactivando .Values.admissionWebhooks.create y admissionWebhooks.certManager.enabled mientras estableces el nombre de tu secreto de certificado personalizado en admissionWebhooks.secretName.
- Puedes desactivar los webhooks por completo desactivando .Values.admissionWebhooks.create y estableciendo la variable de entorno .Values.manager.env.ENABLE_WEBHOOKS en false.
Todas las opciones de configuración (con comentarios) disponibles en el chart se pueden ver en su
[values.yaml file](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml).
