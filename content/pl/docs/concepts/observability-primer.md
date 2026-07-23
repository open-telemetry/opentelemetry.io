---
title: Podstawy obserwowalności
description: Podstawowe koncepcje obserwowalności.
weight: 9
cSpell:ignore: webshop
default_lang_commit: 0ef7c639162832ada8e2021d9b1883546976066c
---

## Czym jest obserwowalność?

Obserwowalność pozwala zrozumieć system z zewnątrz, umożliwiając zadawanie
pytań o ten system bez znajomości jego wewnętrznego działania. Ponadto pozwala
łatwo diagnozować i rozwiązywać nowe problemy, czyli tzw. "nieznane niewiadome"
(ang. _unknown unknowns_). Pomaga również odpowiedzieć na pytanie "Dlaczego to
się dzieje?"

Aby móc zadawać takie pytania o swój system, aplikacja musi być odpowiednio
zinstrumentowana. Oznacza to, że kod aplikacji musi emitować
[sygnały](/docs/concepts/signals/) takie jak
[ślady (traces)](/docs/concepts/signals/traces/),
[metryki](/docs/concepts/signals/metrics/), i
[logi](/docs/concepts/signals/logs/). Aplikacja jest odpowiednio
zinstrumentowana, gdy deweloperzy nie muszą dodawać kolejnej instrumentacji,
aby zdiagnozować problem, ponieważ mają wszystkie potrzebne informacje.

[OpenTelemetry](/docs/what-is-opentelemetry/) jest mechanizmem, dzięki któremu
kod aplikacji jest instrumentowany, aby uczynić system obserwowalnym.

## Niezawodność i metryki

**Telemetria** odnosi się do danych emitowanych przez system i opisujących jego
zachowanie. Dane mogą przyjmować postać [śladów (traces)](/docs/concepts/signals/traces/),
[metryk](/docs/concepts/signals/metrics/), i
[logów](/docs/concepts/signals/logs/).

**Niezawodność** odpowiada na pytanie: "Czy usługa robi to, czego oczekują
użytkownicy?" System może działać przez 100% czasu, ale jeśli użytkownik kliknie
"Dodaj do koszyka", aby dodać czarne buty, a system nie zawsze dodaje czarne
buty — system można uznać za **nie**niezawodny.

**Metryki** to agregacje danych liczbowych o Twojej infrastrukturze lub
aplikacji zbierane w określonym czasie. Przykłady obejmują: współczynnik błędów
systemu, wykorzystanie procesora (CPU) oraz współczynnik żądań dla danej usługi.
Więcej informacji o metrykach i ich związku z OpenTelemetry znajdziesz
w sekcji [Metryki](/docs/concepts/signals/metrics/).

**SLI**, czyli wskaźnik poziomu usług (ang. _Service Level Indicator_),
reprezentuje pomiar zachowania usługi. Dobry SLI mierzy usługę z perspektywy
użytkownika. Przykładem SLI może być szybkość ładowania strony internetowej.

**SLO**, czyli cel poziomu usług (ang. _Service Level Objective_), reprezentuje
sposób komunikowania niezawodności w organizacji lub między zespołami. Osiąga
się to przez powiązanie jednego lub więcej SLI z wartością biznesową.

## Wprowadzenie do śledzenia rozproszonego

Śledzenie rozproszone pozwala obserwować żądania w miarę ich propagacji przez
złożone systemy rozproszone. Poprawia widoczność kondycji aplikacji lub systemu
i umożliwia debugowanie zachowań trudnych do odtworzenia lokalnie. Jest
niezbędne w systemach rozproszonych, które często mają niedeterministyczne
problemy lub są zbyt złożone, aby odtworzyć je lokalnie.

Aby zrozumieć śledzenie rozproszone, należy poznać rolę każdego z jego
komponentów: logów, zakresów i śladów.

### Logi

**Log** to opatrzona znacznikiem czasu wiadomość emitowana przez usługi lub
inne komponenty. W przeciwieństwie do [śladów](#distributed-traces), nie są one
koniecznie powiązane z konkretnym żądaniem użytkownika lub transakcją. Logi
można znaleźć niemal wszędzie w oprogramowaniu. Zarówno deweloperzy, jak i
operatorzy od dawna polegają na logach, aby zrozumieć zachowanie systemu.

Przykładowy log:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Same logi nie wystarczą do śledzenia wykonania kodu, ponieważ zazwyczaj
brakuje im informacji kontekstowych, np. skąd zostały wywołane.


Stają się znacznie bardziej użyteczne, gdy są dołączone do [zakresów](#zakresy),
lub gdy są skorelowane ze śladem i zakresem.

Więcej informacji o logach i ich związku z OpenTelemetry znajdziesz w sekcji
[Logi](/docs/concepts/signals/logs/).

### Zakresy

**Zakres** reprezentuje pojedynczą jednostkę pracy lub operację. Zakresy śledzą
konkretne operacje wykonywane w ramach żądania, tworząc obraz tego, co działo
się podczas wykonywania danej operacji.

Zakres zawiera nazwę, dane czasowe,
[ustrukturyzowane komunikaty logów](/docs/concepts/signals/traces/#span-events)
oraz [inne metadane (czyli Atrybuty)](/docs/concepts/signals/traces/#attributes)
dostarczające informacji o śledzonej operacji.

#### Atrybuty zakresu

Atrybuty zakresu to metadane dołączone do zakresu.

Poniższa tabela zawiera przykłady atrybutów zakresu:

| Klucz                         | Wartość                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `http.request.method`       | `"GET"`                                                                            |
| `network.protocol.version`  | `"1.1"`                                                                            |
| `url.path`                  | `"/webshop/articles/4"`                                                            |
| `url.query`                 | `"?s=1"`                                                                           |
| `server.address`            | `"example.com"`                                                                    |
| `server.port`               | `8080`                                                                             |
| `url.scheme`                | `"https"`                                                                          |
| `http.route`                | `"/webshop/articles/:article_id"`                                                  |
| `http.response.status_code` | `200`                                                                              |
| `client.address`            | `"192.0.2.4"`                                                                      |
| `client.socket.address`     | `"192.0.2.5"` (the client goes through a proxy)                                    |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

Więcej informacji o zakresach i ich związku z OpenTelemetry znajdziesz w sekcji
[Zakresy](/docs/concepts/signals/traces/#spans).

### Ślady rozproszone

**Ślad rozproszony**, powszechniej znany jako **ślad**, rejestruje ścieżkę
przebytą przez pojedyncze żądanie (wykonane przez aplikację lub użytkownika
końcowego) w miarę jego propagacji przez wiele usług w architekturze, takiej
jak aplikacje mikroserwisowe lub bezserwerowe (ang. _serverless_).

Ślad składa się z jednego lub więcej zakresów. Pierwszy zakres reprezentuje
zakres główny (ang. _root span_). Każdy zakres główny reprezentuje żądanie od
początku do końca. Zakresy podrzędne względem rodzica dostarczają głębszego
kontekstu tego, co dzieje się podczas żądania (lub jakie kroki się na nie
składają).

Na przykład, gdy użytkownik ładuje stronę internetową, początkowe żądanie HTTP
może przejść przez bramę API, usługę backendową i bazę danych. Każdy z tych
kroków jest reprezentowany przez zakres, a razem tworzą pojedynczy ślad
pokazujący pełną drogę żądania od początku do końca.

Bez śledzenia znalezienie głównej przyczyny problemów z wydajnością w systemie
rozproszonym może być trudne. Śledzenie sprawia, że debugowanie i rozumienie
systemów rozproszonych jest mniej zniechęcające, rozkładając na części to, co
dzieje się z żądaniem przepływającym przez system rozproszony.

Wiele backendów obserwowalności wizualizuje ślady jako diagramy kaskadowe
(ang. _waterfall diagrams_) wyglądające następująco:

![Przykładowy ślad](/img/waterfall-trace.svg 'Diagram kaskadowy śladu')

Diagramy kaskadowe pokazują relację rodzic-dziecko między zakresem głównym a jego
zakresami podrzędnymi. Gdy zakres obejmuje inny zakres, reprezentuje to również
relację zagnieżdżenia.

Więcej informacji o śladach i ich związku z OpenTelemetry znajdziesz w sekcji
[Ślady](/docs/concepts/signals/traces/).
