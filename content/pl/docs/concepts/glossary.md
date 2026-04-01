---
title: Glosariusz
description:
  Definicje i konwencje dotyczące terminów stosowanych w OpenTelemetry.
weight: 200
default_lang_commit: 0cbe6d7a9d94ab78637023f0d31119fa7ac7ebe1
---

Ten słownik definiuje terminologię i [pojęcia](/docs/concepts/) specyficzne dla
projektu OpenTelemetry oraz wyjaśnia, jak używać terminów z dziedziny
obserwowalności w kontekście OpenTelemetry.

Dokumentujemy również pisownię, także dotyczącą wielkości liter, gdy jest to
pomocne. Przykłady: [OpenTelemetry](#opentelemetry) i [OTel](#otel).

## Terminy {#terms}

### Agregacja {#aggregation}

Proces łączenia wielu pomiarów w dokładne lub szacunkowe statystyki dotyczące
pomiarów wykonanych w określonym przedziale czasowym podczas działania programu.
Stosowana przez [źródło danych](#data-source) typu [metryka](#metric).

### API {#api}

Application Programming Interface. W projekcie OpenTelemetry używane do
definiowania sposobu generowania danych telemetrycznych dla każdego
[źródła danych](#data-source).

### Aplikacja {#application}

Jedna lub więcej [usług](#service) zaprojektowanych dla użytkowników końcowych
lub dla innych aplikacji.

### APM {#apm}

Application Performance Monitoring — monitorowanie aplikacji, ich wydajności
(szybkość, niezawodność, dostępność itp.) w celu wykrywania problemów,
ostrzeganie oraz narzędzia do znajdowania przyczyny źródłowej.

### Atrybut {#attribute}

Termin OpenTelemetry oznaczający [metadane](#metadata). Dodaje pary
klucz-wartość do encji wytwarzającej telemetrię. Stosowany we wszystkich
[sygnałach](#signal) i [zasobach](#resource). Zobacz [specyfikację
atrybutów][attribute].

### Automatyczna instrumentacja {#automatic-instrumentation}

Odnosi się do metod zbierania telemetrii, które nie wymagają od użytkownika
końcowego modyfikacji kodu źródłowego aplikacji. Metody różnią się w zależności
od języka programowania; przykłady obejmują wstrzykiwanie kodu bajtowego lub
dynamiczną modyfikację kodu wykonywanego, tzw. "monkey patching".

### Bagaż {#baggage}

Mechanizm propagacji [metadanych](#metadata) ułatwiający ustalenie związku
przyczynowego między zdarzeniami i usługami. Zobacz [specyfikację
bagażu][baggage].

### Kardynalność {#cardinality}

Liczba unikalnych wartości dla danego [atrybutu](#attribute) lub zestawu
atrybutów. Wysoka kardynalność oznacza wiele unikalnych wartości, co może
wpływać na wydajność i wymagania magazynowe backendów telemetrii. Na przykład
atrybut `user_id` miałby wysoką kardynalność, natomiast atrybut `status_code` z
wartościami takimi jak "200", "404", "500" miałby niską kardynalność.

### Biblioteka kliencka {#client-library}

Zobacz [bibliotekę instrumentowaną](#instrumented-library).

### Aplikacja po stronie klienta {#client-side-app}

Komponent [aplikacji](#application), który nie działa wewnątrz prywatnej
infrastruktury i jest zazwyczaj używany bezpośrednio przez użytkowników
końcowych. Przykłady: aplikacje przeglądarkowe, aplikacje mobilne oraz aplikacje
działające na urządzeniach IoT.

### Kolektor {#collector}

[OpenTelemetry Collector][] (w skrócie: Kolektor) to implementacja niezależna od
dostawcy, która odbiera, przetwarza i eksportuje dane telemetryczne. Pojedynczy
plik binarny, który można wdrożyć jako agenta lub bramę.

> **Pisownia**: Odnosząc się do [OpenTelemetry Collector][], zawsze pisz
> Kolektor z wielkiej litery. Używaj samego "Kolektor", gdy używasz go jako
> przymiotnika &mdash; np. "konfiguracja Kolektora".

[OpenTelemetry Collector]: /docs/collector/

### Contrib {#contrib}

[Biblioteki instrumentacji](#instrumentation-library) oraz
[Kolektor](#collector) oferują zestaw podstawowych funkcji, a także dedykowane
repozytorium contrib z funkcjami dodatkowymi, w tym `Eksportery` dostawców.

### Propagacja kontekstu {#context-propagation}

Umożliwia wszystkim [źródłom danych](#data-source) współdzielenie mechanizmu
kontekstu do przechowywania stanu i dostępu do danych w całym cyklu życia
[transakcji](#transaction). Zobacz [specyfikację propagacji
kontekstu][context propagation].

### DAG {#dag}

[Directed Acyclic Graph][dag] - skierowany graf acykliczny.

### Źródło danych {#data-source}

Zobacz [Sygnał](#signal).

### Wymiar {#dimension}

Termin używany specyficznie przez [metryki](#metric). Zobacz
[Atrybut](#attribute).

### Śledzenie rozproszone {#distributed-tracing}

Śledzenie rozproszone śledzi przebieg pojedynczego [żądania](#request), zwanego
[śladem](#trace), w miarę jak jest obsługiwane przez [usługi](#service)
składające się na [aplikację](#application). Przekracza granice procesów, sieci
i zabezpieczeń.

Zobacz [Śledzenie rozproszone][distributed tracing].

### Dystrybucja {#distribution}

Dystrybucja to opakowanie wokół repozytorium źródłowego OpenTelemetry z pewnymi
dostosowaniami. Zobacz [Dystrybucje][distributions].

### Encja {#entity}

Zbiór [atrybutów](#attribute) identyfikujących i opisujących obiekt fizyczny lub
logiczny. Encje są zazwyczaj powiązane z telemetrią. Na przykład encja CPU
opisuje fizyczny procesor, podczas gdy encja usługi opisuje logiczną grupę
procesów składających się na usługę HTTP lub inną.

### Zdarzenie {#event}

Zdarzenie to [rekord logu](#log-record) z nazwą zdarzenia i dobrze znaną
strukturą. Na przykład zdarzenia przeglądarki w OpenTelemetry stosują określoną
konwencję nazewnictwa i są nośnikiem zestawu danych w określonej strukturze.

### Eksporter {#exporter}

Zapewnia funkcjonalność wysyłania telemetrii do odbiorców. Eksportery mogą
działać w trybie wysyłania (push) lub udostępniania (pull).

### Pole {#field}

Termin używany specyficznie przez [rekordy logów](#log-record).
[Metadane](#metadata) można dodać przez zdefiniowane pola, w tym
[atrybuty](#attribute) i [zasób](#resource). Inne pola również mogą być
traktowane jako metadane, w tym stopień ważności i informacje o śladzie. Zobacz
[specyfikację pól][field].

### gRPC {#grpc}

Wydajny, otwartoźródłowy uniwersalny framework [RPC](#rpc). Zobacz
[gRPC](https://grpc.io).

### HTTP {#http}

Skrót od [Hypertext Transfer Protocol][http].

### Biblioteka instrumentowana {#instrumented-library}

Oznacza [bibliotekę](#library), dla której zbierane są sygnały telemetryczne
([ślady](#trace), [metryki](#metric), [logi](#log)). Zobacz [bibliotekę
instrumentowaną][instrumented library].

### Biblioteka instrumentacji {#instrumentation-library}

Oznacza [bibliotekę](#library), która dostarcza instrumentację dla danej
[biblioteki instrumentowanej](#instrumented-library).
[Biblioteka instrumentowana](#instrumented-library) i
[biblioteka instrumentacji](#instrumentation-library) mogą być tą samą
[biblioteką](#library), jeśli ma wbudowaną instrumentację OpenTelemetry. Zobacz
[specyfikację biblioteki][spec-instrumentation-lib].

### JSON {#json}

Skrót od [JavaScript Object Notation][json].

### Etykieta {#label}

Termin używany specyficznie przez [metryki](#metric). Zobacz
[Metadane](#metadata).

### Język {#language}

Język programowania.

### Biblioteka {#library}

Specyficzna dla języka kolekcja zachowań wywoływanych przez interfejs.

### Log {#log}

Czasami używany w odniesieniu do zbioru [rekordów logów](#log-record). Może być
niejednoznaczny, ponieważ ludzie czasami używają [Log](#log) także w odniesieniu
do pojedynczego [rekordu logu](#log-record). Gdy możliwa jest niejednoznaczność,
użyj dodatkowych określeń, na przykład `rekord logu`. Zobacz [Log][].

### Rekord logu {#log-record}

Zapis danych ze znacznikiem czasu i stopniem ważności. Może również zawierać
[Trace ID](#trace) i [Span ID](#span), gdy jest skorelowany ze śladem. Zobacz
[rekord logu][log record].

### Metadane {#metadata}

Para klucz-wartość, na przykład `foo="bar"`, dodana do encji wytwarzającej
telemetrię. OpenTelemetry nazywa te pary [atrybutami](#attribute). Ponadto
[metryki](#metric) mają [wymiary](#dimension) i [etykiety](#label), a
[logi](#log) mają [pola](#field).

### Metryka {#metric}

Rejestruje punkt danych — surowe pomiary lub wstępnie zdefiniowaną agregację —
jako szereg czasowy z [metadanymi](#metadata). Zobacz [Metryka][metric].

### OC {#oc}

Skrót od [OpenCensus](#opencensus).

### Backend obserwowalności {#observability-backend}

Komponent platformy obserwowalności odpowiedzialny za odbieranie, przetwarzanie,
przechowywanie i wykonywanie zapytań na danych telemetrycznych. Przykłady
obejmują narzędzia otwartoźródłowe takie jak [Jaeger][] i [Prometheus][], a
także rozwiązania komercyjne. OpenTelemetry nie jest backendem obserwowalności.

### Frontend obserwowalności {#observability-frontend}

Komponent platformy obserwowalności dostarczający interfejsy użytkownika do
wizualizacji i analizy danych telemetrycznych. Często może być częścią backendu
obserwowalności, szczególnie w przypadku rozwiązań komercyjnych.

### OpAMP {#opamp}

Skrót od [Open Agent Management Protocol](/docs/collector/management/#opamp).

> **Pisownia**: Pisz OpAMP, nie `OPAMP` ani `opamp` w opisach lub instrukcjach.

### OpenCensus {#opencensus}

Poprzednik OpenTelemetry. Szczegóły w sekcji
[Historia](/docs/what-is-opentelemetry/#history).

### OpenTelemetry {#opentelemetry}

Projekt OpenTelemetry, powstały w wyniku [połączenia][merger] projektów
[OpenTracing](#opentracing) i [OpenCensus](#opencensus) &mdash; tematyka tej
witryny &mdash; to zbiór [API](#api), [SDK](#sdk) i narzędzi, których można użyć
do [instrumentacji](/docs/concepts/instrumentation/), generowania,
[zbierania](/docs/concepts/components/#collector) i
[eksportowania](/docs/concepts/components/#exporters)
[danych telemetrycznych](/docs/concepts/signals/) takich jak [metryki](#metric),
[logi](#log) i [ślady](#trace).

> **Pisownia**: OpenTelemetry powinno być zawsze jednym słowem bez łącznika i
> pisane z wielkiej litery jak pokazano.

[merger]: /docs/what-is-opentelemetry/#history

### OpenTracing {#opentracing}

Poprzednik OpenTelemetry. Szczegóły w sekcji
[Historia](/docs/what-is-opentelemetry/#history).

### OT {#ot}

Skrót od [OpenTracing](#opentracing).

### OTel {#otel}

Skrót od [OpenTelemetry](/docs/what-is-opentelemetry/).

> **Pisownia**: Pisz OTel, nie `OTEL`.

### OTelCol {#otelcol}

Skrót od [OpenTelemetry Collector](#collector).

### OTEP {#otep}

Skrót od [OpenTelemetry Enhancement Proposal][].

> **Pisownia**: Pisz "OTEPy" w liczbie mnogiej. Nie pisz `OTep` ani `otep` w
> opisach.

[OpenTelemetry Enhancement Proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/README.md

### OTLP {#otlp}

Skrót od [OpenTelemetry Protocol](/docs/specs/otlp/).

### Propagatory {#propagators}

Służą do serializacji i deserializacji określonych części danych
telemetrycznych, takich jak kontekst spana i [bagaż](#baggage) w
[spanach](#span). Zobacz [Propagators][propagators].

### Proto {#proto}

Niezależne od języka typy interfejsów. Zobacz [opentelemetry-proto][].

### Receiver {#receiver}

Termin używany przez [Kolektor](/docs/collector/configuration/#receivers) do
określenia sposobu odbierania danych telemetrycznych. Receivery mogą działać w
trybie push lub pull. Zobacz [Receiver][].

### Żądanie {#request}

Zobacz [Śledzenie rozproszone](#distributed-tracing).

### Zasób {#resource}

Zbiór [encji](#entity) lub [atrybutów](#attribute) identyfikujących lub
opisujących obiekt fizyczny lub logiczny wytwarzający telemetrię.

### REST {#rest}

Skrót od [Representational State Transfer][rest].

### RPC {#rpc}

Skrót od [Remote Procedure Call][rpc].

### Próbkowanie {#sampling}

Mechanizm kontroli ilości eksportowanych danych. Najczęściej używany ze
[źródłem danych](#data-source) typu [ślad](#trace). Zobacz
[Próbkowanie][sampling].

### SDK {#sdk}

Skrót od Software Development Kit. Oznacza SDK telemetrii —
[bibliotekę](#library) implementującą API OpenTelemetry.

### Konwencje semantyczne {#semantic-conventions}

Definiują standardowe nazwy i wartości [metadanych](#metadata) w celu
dostarczenia danych telemetrycznych niezależnych od dostawcy.

### Usługa {#service}

Komponent [aplikacji](#application). Zazwyczaj wdraża się wiele instancji
[usługi](#service) dla wysokiej dostępności i skalowalności. [Usługa](#service)
może być wdrożona w wielu lokalizacjach.

### Sygnał {#signal}

Jeden z [śladów](#trace), [metryk](#metric) lub [logów](#log). Zobacz
[Sygnały][signals].

### Span {#span}

Reprezentuje pojedynczą operację w ramach [śladu](#trace). Zobacz [Span][].

### Span link {#span-link}

Span link to powiązanie między przyczynowo związanymi spanami. Szczegóły w
[Linkach między spanami](/docs/specs/otel/overview#links-between-spans) oraz
[Określaniu linków](/docs/specs/otel/trace/api#specifying-links).

### Specyfikacja {#specification}

Opisuje wymagania i oczekiwania międzyjęzykowe dla wszystkich implementacji.
Zobacz [Specyfikacja][specification].

### Status {#status}

Wynik operacji. Zazwyczaj używany do wskazania, czy wystąpił błąd. Zobacz
[Status][].

### Tag {#tag}

Zobacz [Metadane](#metadata).

### Ślad {#trace}

[DAG](#dag) [spanów](#span), gdzie krawędzie między [spanami](#span) są
zdefiniowane jako relacja rodzic-dziecko. Zobacz [Ślady][traces].

### Tracer {#tracer}

Odpowiedzialny za tworzenie [spanów](#span). Zobacz [Tracer][].

### Transakcja {#transaction}

Zobacz [Śledzenie rozproszone](#distributed-tracing).

### zPages {#zpages}

Alternatywa wewnątrzprocesowa dla zewnętrznych Eksporterów. Po dołączeniu
zbierają i agregują informacje o śledzeniu i metrykach w tle; dane te są
serwowane na stronach internetowych na żądanie. Zobacz [zPages][].

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
[log record]: /docs/specs/otel/glossary#log-record
[log]: /docs/specs/otel/glossary#log
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
