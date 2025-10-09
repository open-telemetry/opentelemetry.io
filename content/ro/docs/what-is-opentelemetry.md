---
title: Ce este OpenTelemetry?
description: O scurtă explicație despre ce este și ce nu este OpenTelemetry.
aliases: [/about, /docs/concepts/what-is-opentelemetry, /otel]
weight: 150
default_lang_commit: abb36857b0a8c6b09e379a96bf26d08af8d8f99c
cSpell:ignore: youtube
---

OpenTelemetry este:

- Un **cadru și un set de instrumente [de observabilitate]** concepute pentru a
  facilita
  - [Generarea][instr]
  - Exportarea
  - [Colectarea](../concepts/components/#collector)

  de [date de telemetrie][] cum ar fi [urme], [metrici], și [jurnale].

- **Open source**, precum și **agnostic față de furnizor și instrument**, ceea
  ce înseamnă că poate fi utilizat cu o gamă largă de backend-uri de
  observabilitate, inclusiv instrumente open source precum [Jaeger] și
  [Prometheus], ​​precum și oferte comerciale. OpenTelemetry **nu** este un
  backend de observabilitate în sine.

Un obiectiv important al OpenTelemetry este de a permite o instrumentare ușoară
a aplicațiilor și sistemelor tale, indiferent de limbajul de programare,
infrastructura și mediile de execuție utilizate.

Backend-ul (stocarea) și frontend-ul (vizualizarea) datelor de telemetrie sunt
lăsate în mod intenționat altor instrumente.

<div class="td-max-width-on-larger-screens">
{{< youtube iEEIabOha8U >}}
</div>

Pentru mai multe videoclipuri din această serie și resurse suplimentare, vezi
[Ce urmează?](#what-next)

## Ce este observabilitatea?

[Observabilitatea] este abilitatea de a înțelege starea internă a unui sistem
prin examinarea ieșirilor sale. În contextul software-ului, aceasta înseamnă a
fi capabil să înțelegi starea internă a unui sistem prin examinarea datelor sale
de telemetrie, care includ urme, metrici și jurnale.

Pentru a face un sistem observabil, acesta trebuie să fie [instrumentat][instr].
Adică, codul trebuie să emită [urme], [metrici] sau [jurnale]. Datele
instrumentate trebuie apoi trimise către un backend de observabilitate.

## De ce OpenTelemetry?

Odată cu creșterea cloud computing-ului, a arhitecturilor de microservicii și a
cerințelor de afaceri din ce în ce mai complexe, nevoia de software și
infrastructură [observabilitate] este mai mare ca niciodată.

OpenTelemetry satisface nevoia de observabilitate, respectând în același timp
două principii cheie:

1. Deții datele pe care le generezi. Nu există nicio legătură cu furnizorul.
2. Trebuie doar să înveți un singur set de API-uri și convenții.

Ambele principii combinate oferă echipelor și organizațiilor flexibilitatea de
care au nevoie în lumea informatică modernă de astăzi.

Dacă dorești să afli mai multe, consultă
[misiunea, viziunea și valorile](/community/mission/) OpenTelemetry.

## Componentele principale OpenTelemetry

OpenTelemetry constă din următoarele componente principale:

- O [specificație](/docs/specs/otel) pentru toate componentele
- Un protocol standard (/docs/specs/otlp/) care definește forma datelor de
  telemetrie
- [Convenții semantice](/docs/specs/semconv/) care definesc o schemă standard de
  denumire pentru tipurile comune de date de telemetrie
- API-uri care definesc modul de generare a datelor de telemetrie
- [SDK-uri lingvistice](../languages) care implementează specificațiile,
  API-urile și exportul datelor de telemetrie
- Un [ecosistem de biblioteci](/ecosystem/registry) care implementează
  instrumentație pentru biblioteci și framework-uri comune
- Componente de instrumentație automată care generează date de telemetrie fără a
  necesita modificări de cod
- [Colectorul OpenTelemetry](../collector), un proxy care primește, procesează
  și exportă date de telemetrie
- Diverse alte instrumente, cum ar fi
  [Operatorul OpenTelemetry pentru Kubernetes](../platforms/kubernetes/operator/),
  [Diagramele OpenTelemetry Helm](../platforms/kubernetes/helm/) și
  [resursele comunității pentru FaaS](../platforms/faas/)

OpenTelemetry este utilizat de o gamă largă de
[biblioteci, servicii și aplicații](/ecosystem/integrations/) care au
OpenTelemetry integrat pentru a oferi observabilitate în mod implicit.

OpenTelemetry este susținut de numeroși [furnizori](/ecosystem/vendors/), mulți
dintre ei oferind suport comercial pentru OpenTelemetry și contribuind direct la
proiect.

## Extensibilitate

OpenTelemetry este conceput pentru a fi extensibil. Câteva exemple despre cum
poate fi extins includ:

- Adăugarea unui receptor la OpenTelemetry Collector pentru a accepta date de
  telemetrie dintr-o sursă personalizată
- Încărcarea bibliotecilor de instrumentație personalizate într-un SDK
- Crearea unei [distribuții](../concepts/distributions/) a unui SDK sau a
  Colectorului adaptată unui caz de utilizare specific
- Crearea unui nou exportator pentru un backend personalizat care nu acceptă
  încă protocolul OpenTelemetry (OTLP)
- Crearea unui propagator personalizat pentru un format de propagare a
  contextului nestandard

Deși majoritatea utilizatorilor s-ar putea să nu aibă nevoie să extindă
OpenTelemetry, proiectul este conceput pentru a face acest lucru posibil la
aproape orice nivel.

## Istorie {#history}

OpenTelemetry este un proiect al [Cloud Native Computing Foundation][] (CNCF)
care este rezultatul unei [fuziuni] între două proiecte anterioare,
[OpenTracing](https://opentracing.io) și [OpenCensus](https://opencensus.io).
Ambele proiecte au fost create pentru a rezolva aceeași problemă: lipsa unui
standard pentru instrumentarea codului și trimiterea datelor de telemetrie către
un backend Observability. Întrucât niciunul dintre proiecte nu a reușit să
rezolve problema independent, ele au fuzionat pentru a forma OpenTelemetry și
a-își combina punctele forte, oferind în același timp o soluție unică.

Dacă utilizezi în prezent OpenTracing sau OpenCensus, poți afla cum să migrezi
la OpenTelemetry în [Ghidul de migrare](../migration/).

[fuziuni]:
  https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/

## Ce urmează? {#what-next}

- [Începe](../getting-started/) &mdash; treci la acțiune!
- Învață despre [conceptele OpenTelemetry](../concepts/).
- [Urmărește videoclipuri][] din [OTel pentru începători][] sau alte [liste de
  redare].
- Înscrie-te la [training](/training), inclusiv la **cursul gratuit**
  [Începe cu OpenTelemetry](/training/#courses).

[Cloud Native Computing Foundation]: https://www.cncf.io
[instr]: ../concepts/instrumentation
[Jaeger]: https://www.jaegertracing.io/
[jurnale]: ../concepts/signals/logs/
[metrici]: ../concepts/signals/metrics/
[observabilitate]: ../concepts/observability-primer/#what-is-observability
[OTel pentru începători]:
  https://www.youtube.com/playlist?list=PLVYDBkQ1TdyyWjeWJSjXYUaJFVhplRtvN
[liste de redare]: https://www.youtube.com/@otel-official/playlists
[Prometheus]: https://prometheus.io/
[date de telemetrie]: ../concepts/signals/
[urme]: ../concepts/signals/traces/
[Urmărește videoclipuri]: https://www.youtube.com/@otel-official
