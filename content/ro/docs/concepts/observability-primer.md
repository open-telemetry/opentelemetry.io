---
title: Introducere în observabilitate
description: Concepte de bază despre observabilitate.
default_lang_commit: 2f34c456ab38b4d3502cd07bc36fa1455d4ef875
weight: 9
---

## Ce este observabilitatea? {#what-is-observability}

Observabilitatea îți permite să înțelegi un sistem din exterior, oferindu-ți
posibilitatea de a pune întrebări despre acel sistem fără a îi cunoaște
funcționarea internă. Mai mult, aceasta îți permite să depanezi și să gestionezi
cu ușurință probleme noi, adică „necunoscutele necunoscute” ("unknown
unknowns"). De asemenea, te ajută să răspunzi la întrebarea „De ce se întâmplă
acest lucru?”.

Pentru a putea adresa aceste întrebări despre sistemul tău, aplicația trebuie să
fie instrumentată corespunzător. Adică, codul aplicației trebuie să emită
[semnale](/docs/concepts/signals/) precum
[urme (traces)](/docs/concepts/signals/traces/),
[metrici](/docs/concepts/signals/metrics/) și
[jurnale (logs)](/docs/concepts/signals/logs/). O aplicație este instrumentată
corespunzător atunci când dezvoltatorii nu mai trebuie să adauge instrumentare
suplimentară pentru a depana o problemă, deoarece au deja toate informațiile
necesare.

[OpenTelemetry](/docs/what-is-opentelemetry/) este mecanismul prin care codul
aplicației este instrumentat pentru a ajuta la obținerea observabilității unui
sistem.

## Fiabilitate și metrici

**Telemetria** se referă la datele emise de un sistem și de comportamentul său.
Aceste date pot lua forma de [urme (traces)](/docs/concepts/signals/traces/),
[metrici](/docs/concepts/signals/metrics/) și
[jurnale (logs)](/docs/concepts/signals/logs/).

**Fiabilitatea** răspunde la întrebarea: „Face serviciul ceea ce se așteaptă
utilizatorii să facă?”. Un sistem poate fi disponibil 100% din timp, dar dacă,
atunci când un utilizator apasă „Adaugă în Coș” pentru a adăuga o pereche de
pantofi negri în coșul de cumpărături, sistemul nu adaugă întotdeauna pantofi
negri, atunci sistemul poate fi **ne**fiabil.

**Metricile** sunt agregări, pe o anumită perioadă, ale unor date numerice
despre infrastructura sau aplicația ta. Exemple includ: rata de erori a
sistemului, utilizarea CPU și rata de cereri pentru un anumit serviciu. Pentru
mai multe informații despre metrici și relația lor cu OpenTelemetry, vezi
[Metrici](/docs/concepts/signals/metrics/).

**SLI** (Service Level Indicator – Indicator de Nivel al Serviciului) reprezintă
o măsurătoare a comportamentului unui serviciu. Un SLI bun măsoară serviciul din
perspectiva utilizatorilor. Un exemplu de SLI este viteza cu care se încarcă o
pagină web.

**SLO** (Service Level Objective – Obiectiv de Nivel al Serviciului) reprezintă
modul prin care fiabilitatea este comunicată într-o organizație sau către alte
echipe. Acest lucru se realizează prin asocierea unuia sau mai multor SLI-uri cu
valoarea de business.

## Înțelegerea urmăririi distribuite

Urmărirea distribuită îți permite să observi cererile pe măsură ce acestea se
propagă prin sisteme distribuite complexe. Urmărirea distribuită îmbunătățește
vizibilitatea stării de sănătate a aplicației sau a sistemului și îți permite să
depanezi comportamente care sunt dificil de reprodus local. Este esențială
pentru sistemele distribuite, care au frecvent probleme nedeterministe sau sunt
prea complexe pentru a fi reproduse local.

Pentru a înțelege urmărirea distribuită, trebuie să înțelegi rolul fiecărei
componente: jurnale, intervale și urme.

### Jurnale

Un **jurnal (log)** este un mesaj cu marcaj temporal emis de servicii sau alte
componente. Spre deosebire de [urme](#urme-distribuite), acestea nu sunt
neapărat asociate cu o anumită cerere sau tranzacție a utilizatorului. Jurnalele
pot fi găsite aproape peste tot în software. Ele au fost utilizate intens, în
trecut, atât de dezvoltatori, cât și de operatori, pentru a înțelege
comportamentul sistemului.

Exemplu de jurnal:

```text
I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
```

Jurnalele nu sunt suficiente pentru urmărirea execuției codului, deoarece, de
obicei, le lipsesc informațiile contextuale, cum ar fi locul din care au fost
apelate.

Ele devin mult mai utile atunci când sunt incluse ca parte a unui
[interval](#intervale) sau atunci când sunt corelate cu o urmă și un interval.

Pentru mai multe informații despre jurnale și modul în care acestea se
raportează la OpenTelemetry, vezi [Jurnale](/docs/concepts/signals/logs/).

### Intervale

Un **interval** (span) reprezintă o unitate de lucru sau o operațiune.
Intervalele urmăresc operațiuni specifice pe care le efectuează o cerere,
construind o imagine a ceea ce s-a întâmplat în intervalul de timp în care acea
operațiune a fost executată.

Un interval conține un nume, date legate de timp,
[mesaje de jurnal structurate](/docs/concepts/signals/traces/#span-events) și
[alte metadate (adică atribute)](/docs/concepts/signals/traces/#attributes),
pentru a furniza informații despre operațiunea pe care o urmărește.

#### Atributele unui interval

Atributele unui interval sunt metadate atașate unui interval.

Tabelul următor conține exemple de atribute de interval:

| Key                         | Value                                                                              |
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
| `client.socket.address`     | `"192.0.2.5"` (clientul trece printr-un proxy)                                     |
| `user_agent.original`       | `"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"` |

Pentru mai multe informații despre intervale și modul în care acestea se
raportează la OpenTelemetry, vezi
[Intervale](/docs/concepts/signals/traces/#spans).

### Urme distribuite

O **urmă distribuită**, cunoscută mai frecvent ca **urmă (trace)**,
înregistrează traseele parcurse de cereri (inițiate de o aplicație sau de un
utilizator final) pe măsură ce acestea se propagă prin arhitecturi cu mai multe
servicii, precum aplicațiile bazate pe micro-servicii sau serverless.

O urmă este alcătuită din unul sau mai multe intervale. Primul interval
reprezintă intervalul rădăcină (root span). Fiecare interval rădăcină reprezintă
o cerere de la început până la sfârșit. Intervalele aflate sub acesta oferă un
context mai detaliat despre ceea ce se întâmplă în timpul unei cereri (sau
despre pașii care alcătuiesc o cerere).

Fără urmărire, identificarea cauzei principale a problemelor de performanță
într-un sistem distribuit poate fi dificilă. Urmărirea face depanarea și
înțelegerea sistemelor distribuite mai puțin descurajante, prin descompunerea a
ceea ce se întâmplă într-o cerere pe măsură ce aceasta circulă printr-un sistem
distribuit.

Multe backend-uri de observabilitate vizualizează urmele sub formă de diagrame
„în cascadă” (waterfall), care arată astfel:

![Exemplu de urmă](/img/waterfall-trace.svg 'Diagramă „în cascadă” pentru o urmă')

Diagramele „în cascadă” arată relația părinte–copil dintre un interval rădăcină
și intervalele sale copil. Atunci când un interval încapsulează un alt interval,
acest lucru reprezintă, de asemenea, o relație imbricată.

Pentru mai multe informații despre urme și modul în care acestea se raportează
la OpenTelemetry, vezi [Urme](/docs/concepts/signals/traces/).
