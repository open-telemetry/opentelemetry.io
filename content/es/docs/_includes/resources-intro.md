---
params:
  aResource: un proceso
default_lang_commit: 788277e362bc602b72a90aa9191f9c05c403458e
---

Un [recurso]({{ $resourceHRef }}) representa la entidad que produce telemetría
como atributos de recurso. Por ejemplo, {{ $aResource }} que produce telemetría
y que se está ejecutando en un contenedor en Kubernetes tiene un nombre de
{{ $aResource }}, un nombre de pod, un namespace y, posiblemente, un nombre de
despliegue. Los cuatro atributos pueden incluirse en el recurso.

En tu backend de observabilidad, puedes usar la información del recurso para
investigar mejor un comportamiento interesante. Por ejemplo, si tus datos de
trazas o métricas indican latencia en tu sistema, puedes reducirla a un
contenedor, pod o despliegue de Kubernetes específico.
