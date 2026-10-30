---
title: Instrumentare
description: Cum facilitează OpenTelemetry instrumentarea
aliases: [instrumenting]
weight: 15
default_lang_commit: 8ed9f745d6252000e153fae8c1913dc15a03b5cd
---

Pentru ca un sistem să fie [observabil][observable], acesta trebuie să fie
**instrumentat**: adică, codul componentelor sistemului trebuie să emită
[semnale][signals], cum ar fi [urme][traces], [metrici][metrics] și
[jurnale][logs].

Folosind OpenTelemetry, poți instrumenta codul în două moduri principale:

1. [Soluții bazate pe cod](code-based/), prin intermediul
   [API-urilor și SDK-urilor oficiale pentru majoritatea limbajelor de programare](/docs/languages/)
2. [Soluții fără cod](zero-code/)

Soluțiile **bazate pe cod** îți permit să obții o perspectivă mai profundă și
date de telemetrie bogate, direct din aplicația ta. Acestea îți permit să
folosești API-ul OpenTelemetry pentru a genera date de telemetrie din aplicație,
ceea ce constituie o completare esențială a datelor generate prin soluțiile fără
cod.

Soluțiile **fără cod** sunt excelente pentru a începe, sau în situațiile în care
nu poți modifica aplicația din care dorești să extragi date de telemetrie.
Acestea oferă date bogate provenite din bibliotecile pe care le utilizezi și/sau
din mediul în care rulează aplicația. O altă modalitate de a privi lucrurile
este că acestea oferă informații despre ceea ce se întâmplă _la periferia_
aplicației tale.

Poți folosi ambele tipuri de soluții simultan.

## Beneficii suplimentare ale OpenTelemetry {#additional-OpenTelemetry-benefits}

OpenTelemetry oferă mai mult decât simple soluții de telemetrie bazate pe cod
sau fără cod. Următoarele aspecte fac, de asemenea, parte din OpenTelemetry:

- Bibliotecile pot utiliza API-ul OpenTelemetry ca dependență, fără a avea vreun
  impact asupra aplicațiilor care folosesc acea bibliotecă, cu excepția cazului
  în care SDK-ul OpenTelemetry este importat.
- Pentru fiecare dintre [semnale][signals], ai la dispoziție mai multe metode
  pentru a le crea, procesa și exporta.
- Datorită [propagării contextului](../context-propagation/), integrată în
  implementări, poți corela semnalele indiferent de locul în care sunt generate.
- [Resursele](../resources/) și
  [Domeniile de instrumentare](../instrumentation-scope/) permit gruparea
  semnalelor în funcție de diferite entități, precum
  [gazda](/docs/specs/semconv/resource/host/),
  [sistemul de operare](/docs/specs/semconv/resource/os/) sau
  [clusterul K8s](/docs/specs/semconv/resource/k8s/#cluster).
- Fiecare implementare a API-ului și a SDK-ului, specifică unui anumit limbaj de
  programare, respectă cerințele și așteptările definite în
  [specificația OpenTelemetry](/docs/specs/otel/).
- [Convențiile semantice](../semantic-conventions/) oferă o schemă comună de
  denumire, care poate fi utilizată pentru standardizare la nivelul bazelor de
  cod și al platformelor.

[logs]: ../signals/logs/
[metrics]: ../signals/metrics/
[observable]: ../observability-primer/#what-is-observability
[signals]: ../signals/
[traces]: ../signals/traces/
