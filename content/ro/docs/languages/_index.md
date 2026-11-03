---
title: Limbaje, API-uri şi SDK-uri
description:
  Instrumentarea codului cu OpenTelemetry este acceptată pentru multe limbaje de
  programare populare.
weight: 250
aliases: [/docs/instrumentation]
redirects:
  - { from: /docs/instrumentation/*, to: ':splat' } # Only for `en`
  - { from: 'net/*', to: 'dotnet/:splat' }
default_lang_commit: c03c6396c60a28c9fd83931cf1c310b5cad360fb
---

[Instrumentarea][instrumentation] codului cu OpenTelemetry este disponibilă
pentru limbajele enumerate în tabelul [Stadii și versiuni](#status-and-releases)
de mai jos. Există, de asemenea, implementări neoficiale pentru
[alte limbaje](/docs/languages/other). Le poți găsi în
[registru](/ecosystem/registry/).

Pentru Go, .NET, PHP, Python, Java și JavaScript, poți folosi
[soluții fără modificări de cod (zero-code)](/docs/zero-code) pentru a
instrumenta aplicația, fără a fi necesară modificarea codului sursă.

Dacă foloseşti Kubernetes, poți utiliza [OpenTelemetry Operator pentru
Kubernetes][otel-op] pentru a [integra aceste soluții fără modificări de
cod][zero-code] în aplicația ta.

## Stadii și versiuni {#status-and-releases}

[Stadiul](/docs/specs/otel/versioning-and-stability/) actual al principalelor
componente funcționale ale OpenTelemetry este următorul:

> [!WARNING]
>
> Indiferent de stadiul unui API/SDK, dacă instrumentarea ta se bazează pe
> [convenții semantice][semconv] marcate ca fiind [experimentale][Experimental]
> în [specificația convențiilor semantice][semconv-spec], fluxul de date ar
> putea fi afectat de **modificări incompatibile**.
>
> [semconv]: /docs/concepts/semantic-conventions/
> [Experimental]: /docs/specs/otel/document-status/
> [semconv-spec]: /docs/specs/semconv/

{{% telemetry-support-table " " %}}

## Referințe API {#api-references}

Grupurile de interes special (SIG-uri) care implementează API-ul și SDK-ul
OpenTelemetry într-un anumit limbaj publică, de asemenea, documentație de
referință pentru API, destinată dezvoltatorilor. Sunt disponibile următoarele
resurse de referință:

{{% apidocs %}}

> [!NOTE]
>
> Lista de mai sus este disponibilă și prin intermediul aliasului
> [`/api`](/api).

[zero-code]: /docs/platforms/kubernetes/operator/automatic/
[instrumentation]: /docs/concepts/instrumentation/
[otel-op]: /docs/platforms/kubernetes/operator/
