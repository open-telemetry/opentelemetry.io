---
title: Domeniul de instrumentare
weight: 80
default_lang_commit: afdb399124597db22441a6ac1d84f82f5c97ea60
---

[Domeniul de instrumentare](/docs/specs/otel/common/instrumentation-scope/) este
o unitate logică de software cu care sunt asociate datele de telemetrie emise.
Acesta poate reprezenta un modul, un pachet, o clasă, o bibliotecă sau un
framework — orice delimitare semnificativă pe care un dezvoltator o alege pentru
a distinge o sursă de telemetrie de alta.

## Cum se definește un domeniu {#how-a-scope-is-defined}

Un domeniu este identificat printr-un tuplu
`(name, version, schema_url, attributes)`, unde `version`, `schema_url` și
`attributes` sunt opționale. Câmpul `name` ar trebui să identifice în mod unic
unitatea logică de software — de exemplu, numele complet calificat al unei
biblioteci, clase sau al unui modul.

Specifici domeniul atunci când obții un _tracer_, un _meter_ sau un _logger_ de
la un furnizor (_provider_). Fiecare _span_, metrică și înregistrare de jurnal
produsă de acea instanță este apoi marcată cu domeniul respectiv:

- **Pentru biblioteci și framework-uri**: utilizează numele complet calificat și
  versiunea bibliotecii ca domeniu. Dacă scrii o bibliotecă de instrumentare
  pentru o bibliotecă ce nu dispune de suport nativ OpenTelemetry, utilizează
  numele și versiunea bibliotecii de instrumentare însăși.

- **Pentru codul aplicației**: o alegere comună este numele clasei sau al
  modulului, cum ar fi `CheckoutService`.

## De ce sunt importante domeniile {#why-scopes-matter}

În sistemul _backend_ de observabilitate, poți filtra, grupa și compara datele
de telemetrie în funcție de domeniu. Acest lucru permite identificarea versiunii
unei biblioteci care cauzează latență, izolarea semnalelor provenite de la un
anumit modul sau compararea comportamentului între versiuni diferite ale
aceleiași componente.

## Domenii într-o urmă {#scopes-in-a-trace}

Diagrama următoare prezintă o urmă (_trace_) care conține _span_-uri din șase
domenii de instrumentare diferite, marcate prin culori și identificate în
legendă:

- Domeniul `http-framework` generează _span_-ul rădăcină `/api/placeOrder`.
- Domeniul `CheckoutService` generează `CheckoutService::placeOrder`,
  `CheckoutService::prepareOrderItems` și `CheckoutService::checkout`. Toate
  cele trei _span_-uri partajează același domeniu de instrumentare deoarece sunt
  create de aceeași instanță de _tracer_, obținută cu numele `CheckoutService`.
- Domeniile `CartService` și `ProductService` generează fiecare câte un span din
  componentele respective ale aplicației.
- Domeniile `Cache library` și `DB library` generează span-uri din codul
  bibliotecilor, grupate în funcție de numele și versiunea bibliotecii.

![Diagramă de tip cascadă a urmăririi, cu span-uri colorate în funcție de domeniul de instrumentare. O legendă din partea de jos asociază fiecare culoare cu numele domeniului corespunzător.](ro-spans-with-instrumentation-scope.svg)
