---
params:
  aResource: proces
default_lang_commit: f5b3c44e7ed3e98a7307379e8c867750dd2f1dea
---

O [resursă]({{ $resourceHRef }}) reprezintă entitatea care produce telemetrie,
descrisă prin intermediul atributelor de resursă. De exemplu, un
{{ $aResource }} care produce telemetrie și rulează într-un container în
Kubernetes are un nume de {{ $aResource }}, un nume de pod, un namespace și,
eventual, un nume de Kubernetes deployment. Toate cele patru atribute pot fi
incluse în resursă.

În backend-ul tău de observabilitate, poți utiliza informațiile despre resursă
pentru a investiga mai bine comportamentele relevante. De exemplu, dacă datele
de tracing sau metricile indică o latență ridicată în sistem, poți restrânge
investigația la un anumit container, pod sau Kubernetes deployment.
