---
title: Glosar
description:
  Definiții și convenții pentru termenii de telemetrie așa cum sunt utilizați în
  OpenTelemetry.
weight: 200
default_lang_commit: af966c967003c6dcee2ea5dfe23ce5831fcb5019
---

Acest glosar definește termenii și [conceptele](/docs/concepts/) noi din cadrul
proiectului OpenTelemetry și clarifică utilizările specifice OpenTelemetry ale
termenilor comuni din domeniul observabilității.

De asemenea, oferim comentarii privind ortografia și scrierea cu majuscule
atunci când este util. De exemplu, vezi [OpenTelemetry](#opentelemetry) și
[OTel](#otel).

## Termeni {#terms}

### Agregare {#aggregation}

Procesul de combinare a mai multor măsurători în statistici exacte sau estimate
referitoare la măsurătorile care au avut loc într-un interval de timp, în timpul
execuției programului. Utilizat de [Metrică](#metric)
[Sursa de date](#data-source).

### API

Interfață de programare a aplicațiilor. În proiectul OpenTelemetry, utilizată
pentru a defini modul în care datele de telemetrie sunt generate per
[Sursă de date](#data-source).

### Aplicație {#application}

Unul sau mai multe [Servicii](#service) concepute pentru utilizatori finali sau
alte aplicații.

### APM

Monitorizarea performanței aplicațiilor se referă la monitorizarea aplicațiilor
software, a performanței acestora (viteză, fiabilitate, disponibilitate etc.)
pentru a detecta problemele, emiterea alertelor și a instrumentelor pentru
găsirea cauzei principale.

### Atribut {#attribute}

Termen OpenTelemetry pentru [Metadate](#metadata). Adaugă informații
cheie-valoare la entitatea care produce telemetria. Se utilizează în
[Semnale](#signal) și [Resurse](#resource). Vezi [specificațiile
atributului][attribute].

### Instrumentare automatică {#automatic-instrumentation}

Se referă la metodele de colectare a datelor de telemetrie care nu necesită ca
utilizatorul final să modifice codul sursă al aplicației. Metodele variază în
funcție de limbajul de programare, iar exemplele includ injecția de bytecode sau
aplicarea de corecții de tip „monkey patching”.

### Bagaj {#baggage}

Un mecanism pentru propagarea [Metadatelor](#metadata) pentru a ajuta la
stabilirea unei relații cauzale între evenimente și servicii. Vezi
[specificațiile bagajului][baggage].

### Cardinalitate {#cardinality}

Numărul de valori unice pentru un anumit [Atribut](#attribute) sau set de
atribute. Cardinalitatea ridicată înseamnă multe valori unice, care pot afecta
cerințele de performanță și stocare ale backend-urilor de telemetrie. De
exemplu, un atribut `user_id` ar avea cardinalitate ridicată, în timp ce un
atribut `status_code` cu valori precum „200”, „404”, „500” ar avea cardinalitate
scăzută.

### Biblioteca client {#client-library}

Vezi [biblioteca instrumentată](#instrumented-library).

### Aplicația client-side {#client-side-app}

O componentă a unei [Aplicații](#application) care nu rulează într-o
infrastructură privată și este de obicei utilizată direct de utilizatorii
finali. Exemple de aplicații client-side sunt aplicațiile de browser,
aplicațiile mobile și aplicațiile care rulează pe dispozitive IoT.

### Colector {#collector}

[Colectorul OpenTelemetry][OpenTelemetry Collector] sau pe scurt Colector, este
o implementare agnostică față de furnizor, despre cum se primește, se procesează
și se exportă date de telemetrie. Un singur fișier binar care poate fi
implementat ca agent sau gateway.

> **Ortografie**: Când se face referire la [Colectorul
> OpenTelemetry][OpenTelemetry Collector], scrie întotdeauna cu majusculă
> Colector. Folosește doar „Colector” dacă folosești Colector ca substantiv
> &mdash; de exemplu, „Configurația colectorului”.

[OpenTelemetry Collector]: /docs/collector/

### Contrib

Mai multe [Biblioteci de instrumentație](#instrumentation-library) și
[Colectorul](#collector) oferă un set de capabilități de bază, precum și un
depozit dedicat contrib pentru capabilități non-esențiale, inclusiv
„Exportatori” de la furnizori.

### Propagarea contextului {#context-propagation}

Permite tuturor [Surselor de date](#data-source) să partajeze un mecanism
contextual subiacent pentru stocarea stării și accesarea datelor pe durata de
viață a unei [Tranzacții](#transaction). Vezi [specificațiile de propagare a
contextului][context propagation].

### DAG

[Graf aciclic direcționat][dag].

### Sursa de date {#data-source}

Vezi [Semnal](#signal)

### Dimensiune {#dimension}

Un termen folosit în mod specific de [Metrici](#metric). Vezi
[Atribut](#attribute).

### Urmă distribuită {#distributed-tracing}

Urmărește progresia unei singure [Cereri](#request), numită [Urmă](#trace), așa
cum este gestionată de [Servicii](#service) care alcătuiesc o
[Aplicație](#application). O [Urmărire distribuită](#distributed-tracing)
traversează limitele de proces, rețea și securitate.

Vezi [Urmărire distribuită][distributed tracing].

### Distribuție {#distribution}

O distribuție este un wrapper în jurul unui depozit OpenTelemetry din amonte cu
anumite personalizări. Consultă [Distribuții][distributions].

### Eveniment {#event}

Un eveniment este o [înregistrare de jurnal](#log-record) cu un nume de
eveniment și o structură binecunoscută. De exemplu, evenimentele browserului din
OpenTelemetry respectă o anumită convenție de denumire și transportă anumite
date într-o structură comună.

### Exportator {#exporter}

Oferă funcționalitate pentru emiterea de telemetrie către consumatori.
Exportatorii pot fi bazați pe push sau pull.

### Câmp {#field}

Un termen folosit în mod specific de [Înregistrări în jurnal](#log-record).
[Metadate](#metadata) pot fi adăugate prin câmpuri definite, inclusiv
[Atribute](#attribute) și [Resurse](#resource). Alte câmpuri pot fi, de
asemenea, considerate `Metadate`, inclusiv informații despre severitate și urme.
Vezi [specificațiile câmpului][field].

### gRPC

Un framework universal [RPC](#rpc) de înaltă performanță, open source. Vezi
[gRPC](https://grpc.io).

### HTTP

Prescurtare de la [Protocol de transfer hipertext][http].

### Bibliotecă instrumentată {#instrumented-library}

Indică [Biblioteca](#library) pentru care sunt colectate semnalele de telemetrie
([Urme](#trace), [Metrici](#metric), [Jurnale](#log)). Vezi [Biblioteca
instrumentată][instrumented library].

### Biblioteca de instrumente {#instrumentation-library}

Indică [Biblioteca](#library) care furnizează instrumentația pentru o anumită
[Biblioteca instrumentată](#instrumented-library).
[Biblioteca instrumentată](#instrumented-library) și
[Biblioteca de instrumentație](#instrumentation-library) pot fi aceeași
[Bibliotecă](#library) dacă are instrumentație OpenTelemetry încorporată. Vezi
[specificația lib][spec-instrumentation-lib].

### JSON

Prescurtare pentru [JavaScript Object Notation][json].

### Etichetă {#label}

Un termen folosit în mod specific de [Metrici](#metric). Vezi
[Metadate](#metadata).

### Limbaj {#language}

Limbaj de programare.

### Bibliotecă {#library}

O colecție specifică limbajului de comportamente invocate de o interfață.

### Jurnal {#log}

Uneori folosit pentru a se referi la o colecție de
[Înregistrări jurnal](#log-record). Poate fi ambiguu, deoarece uneori se
folosește [Jurnal](#log) și pentru a se referi la o singură
[Înregistrare jurnal](#log-record). Unde ambiguitatea este posibilă, se
utilizează calificatori suplimentari, de exemplu, `Înregistrare jurnal`. Vezi
[Jurnal][log].

### Înregistrare în jurnal {#log-record}

O înregistrare a datelor cu o marcă temporală și o severitate. Poate avea și un
[ID de urmărire](#trace) și un [ID de interval](#span) atunci când este corelată
cu o urmă. Vezi [Înregistrare în jurnal][log record].

### Metadate {#metadata}

O pereche cheie-valoare, de exemplu `foo="bar"`, adăugată la o entitate care
produce telemetrie. OpenTelemetry numește aceste perechi [Atribute](#attribute).
În plus, [Metricile](#metric) au [Dimensiuni](#dimension) și [Etichete](#label),
în timp ce [Jurnalele](#log) au [Câmpuri](#field).

### Metrică {#metric}

Înregistrează un punct de date, fie măsurători brute, fie o agregare
predefinită, ca serie temporală cu [Metadate](#metadata). Vezi
[Metrică][metric].

### OC

Prescurtare pentru [OpenCensus](#opencensus).

### Backend de observabilitate {#observability-backend}

Componenta unei platforme de observabilitate care este responsabilă pentru
primirea, procesarea, stocarea și interogarea datelor de telemetrie. Se pot
enumera, de exemplu, instrumente open source cum ar fi [Jaeger] și [Prometheus],
​​precum și oferte comerciale. OpenTelemetry nu este un backend de
observabilitate.

### Frontend de observabilitate {#observability-frontend}

Componenta unei platforme de observabilitate care oferă interfețe utilizator
pentru vizualizarea și analiza datelor de telemetrie. Poate fi adesea o parte a
unui backend de observabilitate, în special atunci când se iau în considerare
ofertele comerciale.

### OpAMP

Abreviere pentru
[Protocolul deschis de gestionare a agenților](/docs/collector/management/#opamp).

> **Ortografie**: Scrie OpAMP, nu `OPAMP` sau `opamp` în descrieri sau
> instrucțiuni.

### OpenCensus

Precursorul OpenTelemetry. Pentru mai multe detalii, vezi
[Istorie](/docs/what-is-opentelemetry/#history).

### OpenTelemetry

Format printr-o [fuziune] a proiectelor [OpenTracing](#opentracing) și
[OpenCensus](#opencensus), OpenTelemetry &mdash; subiectul acestui site web
&mdash; este o colecție de [API-uri](#api), [SDK-uri](#sdk) și instrumente pe
care le poți utiliza pentru a [instrumenta](/docs/concepts/instrumentation/),
genera, [colecta](/docs/concepts/components/#collector) și
[exporta](/docs/concepts/components/#exporters)
[date de telemetrie](/docs/concepts/signals/), cum ar fi [metrici](#metric),
[jurnale](#log) și [urme](#trace).

> **Ortografie**: OpenTelemetry ar trebui să fie întotdeauna un singur cuvânt
> fără cratimă și scris cu majusculă, așa cum se arată.

[fuziune]: /docs/what-is-opentelemetry/#history

### OpenTracing

Precursorul OpenTelemetry. Pentru mai multe detalii, vezi
[Istorie](/docs/what-is-opentelemetry/#history).

### OT

Prescurtare pentru [OpenTracing](#opentracing).

### OTel

Prescurtare pentru [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Ortografie**: Scrie OTel, nu `OTEL`.

### OTelCol

Prescurtare pentru [Colector OpenTelemetry](#collector).

### OTEP

Un acronim pentru [Propunere de îmbunătățire OpenTelemetry].

> **Ortografie**: Scrie „OTEPs” la plural. Nu scrie `OTep` sau `otep` în
> descrieri.

[Propunere de îmbunătățire OpenTelemetry]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP

Prescurtare pentru [Protocolul OpenTelemetry](/docs/specs/otlp/).

### Propagatori {#propagators}

Folosit pentru serializarea și deserializarea părților specifice ale datelor de
telemetrie, cum ar fi contextul intervalului și [Bagajul](#baggage) din
[Intervaluri](#span). Vezi [Propagatori][propagators].

### Proto

Tipuri de interfețe independente de limbă. Vezi [opentelemetry-proto].

### Receptor {#receiver}

Termenul folosit de [Colector](/docs/collector/configuration/#receivers) pentru
a defini modul în care sunt recepționate datele de telemetrie. Receptoarele pot
fi bazate pe push sau pull. Vezi [Receptor][receiver].

### Cerere {#request}

Vezi [Urmărire distribuită](#distributed-tracing).

### Resursă {#resource}

Capturează informații despre entitatea care produce telemetrie sub forma unor
[Atribute](#attribute). De exemplu, un proces care produce telemetrie și care
rulează într-un container pe Kubernetes are un nume de proces, un nume de pod,
un namespace și, eventual, un nume de implementare. Toate aceste atribute pot fi
incluse în `Resursă`.

### REST

Prescurtare pentru [Transfer de stat reprezentativ][rest].

### RPC

Prescurtare pentru [Apel de procedură la distanță][rpc].

### Eșantionare {#sampling}

Un mecanism pentru controlul cantității de date exportate. Cel mai frecvent
utilizat cu [Trasarea](#trace) [Sursei de date](#data-source). Vezi
[Eșantionare][sampling].

### SDK

Prescurtare pentru kit de dezvoltare software. Se referă la un SDK de telemetrie
care denotă o [Bibliotecă](#library) care implementează OpenTelemetry
[API](#api).

### Convenții semantice {#semantic-conventions}

Definește numele și valorile standard ale [Metadatelor](#metadata) pentru a
oferi date de telemetrie agnostice față de furnizor.

### Serviciu {#service}

O componentă a unei [Aplicații](#application). De obicei, se implementează mai
multe instanțe ale unui [Serviciu](#service) pentru disponibilitate și
scalabilitate ridicate. Un [Serviciu](#service) poate fi implementat în mai
multe locații.

### Semnal {#signal}

Unul dintre [Urme](#trace), [Metrici](#metric) sau [Jurnale](#log). Vezi
[Semnale][signals].

### Interval {#span}

Reprezintă o singură operațiune din cadrul unei [Urme](#trace). Vezi
[Interval][span].

### Legătură între intervale {#span-link}

O legătură între intervale (span link) este o legătură între intervale (spans)
legate cauzal. Pentru detalii, vezi
[Legături între intervale](/docs/specs/otel/overview#links-between-spans) și
[Specificarea legăturilor](/docs/specs/otel/trace/api#specifying-links).

### Specificație {#specification}

Descrie cerințele și așteptările interlingvistice pentru toate implementările.
Vezi [Specificație][specification].

### Stare {#status}

Rezultatul operației. De obicei, se folosește pentru a indica dacă a apărut o
eroare. Vezi [Stare][status].

### Tag

Vezi [Metadate](#metadata).

### Urmă {#trace}

Un [DAG](#dag) din [Intervaluri](#span), unde punctele extreme dintre
[Intervaluri](#span) sunt definite ca relație părinte-copil. Vezi
[Urme][traces].

### Tracer

Responsabil cu crearea [Intervalurilor](#span). Vezi [Tracer].

### Tranzacţie {#transaction}

Vezi [Urmărire distribuită](#distributed-tracing).

### zPages

O alternativă în proces la exportatorii externi. Atunci când sunt incluși,
aceștia colectează și agregă informații de urmărire și metrică în fundal; aceste
date sunt furnizate pe paginile web atunci când sunt solicitate. Vezi [zPages].

[attribute]: /docs/specs/otel/common/#attributes
[baggage]: /docs/specs/otel/baggage/api/
[context propagation]: /docs/specs/otel/overview#context-propagation
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[distributed tracing]: ../signals/traces/
[distributions]: ../distributions/
[field]: /docs/specs/otel/logs/data-model#field-kinds
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[Jaeger]: https://www.jaegertracing.io/
[json]: https://en.wikipedia.org/wiki/JSON
[log]: /docs/specs/otel/glossary#log
[log record]: /docs/specs/otel/glossary#log-record
[metric]: ../signals/metrics/
[opentelemetry-proto]: https://github.com/open-telemetry/opentelemetry-proto
[propagators]: /docs/languages/go/instrumentation/#propagators-and-context
[Prometheus]: https://prometheus.io/
[receiver]: /docs/collector/configuration/#receivers
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rpc]: https://en.wikipedia.org/wiki/Remote_procedure_call
[sampling]: /docs/specs/otel/trace/sdk#sampling
[signals]: ../signals/
[span]: /docs/specs/otel/trace/api#span
[spec-instrumentation-lib]: /docs/specs/otel/glossary/#instrumentation-library
[specification]: ../components/#specification
[status]: /docs/specs/otel/trace/api#set-status
[tracer]: /docs/specs/otel/trace/api#tracer
[traces]: /docs/specs/otel/overview#traces
[zpages]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/development/trace/zpages.md
