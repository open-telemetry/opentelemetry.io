---
title: Urme
weight: 1
description: Traseul unei cereri prin aplicația ta.
cSpell:ignore: Guten
default_lang_commit: 6f2f46d66353b05e205f4fd74964c84a797e9dbe
---

**Urmele** ne oferă imaginea de ansamblu a ceea ce se întâmplă când o cerere
este trimisă către o aplicație. Fie că aplicația ta este un monolit cu o singură
bază de date sau o rețea sofisticată de servicii, urmele sunt esențiale pentru
înțelegerea întregului "traseu" pe care îl parcurge o cerere în aplicația ta.

Să explorăm asta cu trei unități de lucru, reprezentate ca [intervale](#spans):

> [!NOTE]
>
> Următoarele exemple JSON nu reprezintă un format specific, și în mod special
> nu reprezintă [OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding), care este
> mult mai explicit.

Intervalul `hello`:

```json
{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Acesta este intervalul rădăcină, care denotă începutul și sfârșitul întregii
operații. Observă că are un câmp `trace_id` care indică urma, dar nu are niciun
câmp `parent_id`. Așa știi că este intervalul rădăcină.

Intervalul `hello-greetings`:

```json
{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Acest interval încapsulează sarcini specifice, precum a transmite salutări, iar
părintele său este intervalul `hello`. Observă că împarte același `trace_id` ca
și intervalul rădăcină, indicând că este parte din aceeași urmă. În plus, are un
câmp `parent_id` cu aceeași valoare ca și câmpul `span_id` al intervalului
`hello`.

Intervalul `hello-salutations`:

```json
{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
```

Acest interval reprezintă a treia operație din această urmă și precum cea
precedentă, este un copil al intervalului `hello`. Asta îl face de asemenea să
fie frate cu intervalul `hello-greetings`.

Toate aceste trei blocuri JSON împart același `trace_id`, iar câmpul `parent_id`
reprezintă o ierarhie. Asta le face să fie o urmă!

Un alt lucru pe care-l vei observa este că fiecare interval arată ca un jurnal
structurat. Asta pentru că, într-un fel, chiar este! Un mod de a ne gândi la
urme este ca la o colecție de jurnale structurate, cu context, corelare,
ierarhie și alte date deja integrate. În schimb, aceste "jurnale structurate"
pot proveni din diverse procese, servicii, mașini virtuale, centre de date, și
așa mai departe. Asta permite urmelor să ilustreze o imagine completă a oricărui
sistem.

Pentru a înțelege cum funcționează urmele în OpenTelemetry, să ne uităm la lista
de componente care vor juca un rol în instrumentarea codului nostru.

## Furnizor de tracer {#tracer-provider}

Un furnizor de tracer (uneori numit `TracerProvider`) este o fabrică de obiecte
`Tracer`. În majoritatea aplicațiilor, un furnizor de tracer este inițializat o
singură dată, iar durata sa de viață coincide cu cea a aplicației. Inițializarea
furnizorului de tracer include și inițializarea resursei și a exportatorului. De
obicei, este primul pas în urmărirea cu OpenTelemetry. În unele SDK-uri pentru
limbaj, un furnizor de tracer global este deja inițializat pentru tine.

## Tracer {#tracer}

Un tracer creează intervale care conțin mai multe informații despre ce se
întâmplă în cadrul unei anumite operații, cum ar fi o cerere într-un serviciu.
Obiectele tracer sunt create de furnizorii de tracer.

## Exportatori de urme {#trace-exporters}

Exportatorii de urme trimit urmele către un consumator. Acest consumator poate
fi ieșirea standard, în timpul depanării și dezvoltării, Colectorul
OpenTelemetry sau orice backend open source sau comercial la alegere.

## Propagarea contextului {#context-propagation}

Propagarea contextului este conceptul de bază care permite urmărirea
distribuită. Cu propagarea contextului, intervalele pot fi corelate între ele și
asamblate într-o urmă, indiferent de unde sunt generate. Pentru a afla mai multe
despre acest subiect, vezi [propagarea contextului](../../context-propagation).

## Intervale {#spans}

Un **interval** reprezintă o unitate de lucru sau o operație. Intervalele sunt
elementele de bază ale urmelor. În OpenTelemetry, acestea includ următoarele
informații:

- Nume
- ID-ul intervalului părinte (gol pentru intervalele rădăcină)
- Marcaje temporale de început și de sfârșit
- [Contextul intervalului](#span-context)
- [Atribute](#attributes)
- [Evenimentele intervalului](#span-events)
- [Legături între intervale](#span-links)
- [Starea intervalului](#span-status)

Exemplu de interval:

```json
{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
```

Intervalele pot fi imbricate, așa cum sugerează prezența unui ID de interval
părinte: intervalele copil reprezintă suboperații. Acest lucru le permite
intervalelor să captureze cu mai multă acuratețe munca efectuată într-o
aplicație.

### Contextul intervalului {#span-context}

Contextul intervalului este un obiect imuabil, prezent în fiecare interval, care
conține următoarele:

- ID-ul urmei (trace ID), care reprezintă urma din care face parte intervalul
- ID-ul intervalului (span ID)
- Trace Flags, o codificare binară care conține informații despre urmă
- Trace State, o listă de perechi cheie-valoare care pot transporta informații
  despre urmă specifice furnizorului

Contextul intervalului este partea unui interval care este serializată și
propagată împreună cu [contextul distribuit](#context-propagation) și
[bagajul](../baggage).

Deoarece contextul intervalului conține ID-ul urmei, este folosit la crearea
[legăturilor între intervale](#span-links).

### Atribute {#attributes}

Atributele sunt perechi cheie-valoare care conțin metadate pe care le poți
folosi pentru adnotarea unui interval cu scopul de a transporta informații
despre operația pe care o urmărește.

De exemplu, dacă un interval urmărește o operație care adaugă un produs în coșul
de cumpărături al unui utilizator într-un sistem eCommerce, poți captura ID-ul
utilizatorului, ID-ul produsului de adăugat în coș și ID-ul coșului.

Poți adăuga atribute intervalelor în momentul creării acestora sau ulterior.
Este de preferat să adaugi atributele la crearea intervalului, pentru ca acestea
să fie disponibile pentru eșantionarea din SDK. Dacă trebuie să adaugi o valoare
după crearea intervalului, actualizează intervalul cu valoarea respectivă.

Atributele au următoarele reguli, implementate de fiecare SDK pentru limbaj:

- Cheile trebuie să fie șiruri de caractere (string) nenule
- Valorile trebuie să fie nenule și de tip șir de caractere, boolean, virgulă
  mobilă, întreg sau tablou de astfel de valori

În plus, există [atribute semantice](/docs/specs/semconv/general/trace/), care
sunt convenții de denumire cunoscute pentru metadatele prezente de obicei în
operațiile comune. Este util să folosești denumiri semantice pentru atribute ori
de câte ori este posibil, astfel încât tipurile comune de metadate să fie
standardizate între sisteme.

### Evenimentele intervalului {#span-events}

Un eveniment al intervalului poate fi văzut ca un mesaj de jurnal structurat
(sau o adnotare) atașat unui interval, folosit de obicei pentru a marca un
anumit moment relevant din durata intervalului.

De exemplu, consideră următoarele două scenarii într-un browser web:

1. Urmărirea încărcării unei pagini
2. Marcarea momentului în care o pagină devine interactivă

Un interval este cel mai potrivit pentru a urmări primul scenariu, deoarece este
o operație cu un început și un sfârșit.

Un eveniment al intervalului este cel mai potrivit pentru a urmări al doilea
scenariu, deoarece reprezintă un anumit moment relevant.

#### Când să folosești evenimentele intervalului versus atributele intervalului {#when-to-use-span-events-versus-span-attributes}

Deoarece evenimentele intervalului conțin și atribute, s-ar putea ca întrebarea
când să folosești evenimente în loc de atribute să nu aibă întotdeauna un
răspuns evident. Pentru a lua o decizie informată, ia în considerare dacă un
anumit marcaj temporal are o semnificație.

De exemplu, atunci când urmărești o operație cu un interval și operația se
încheie, s-ar putea să dorești să adaugi date din operație la telemetria ta.

- Dacă momentul în timp la care se încheie operația are o semnificație sau este
  relevant, atașează datele unui eveniment al intervalului.
- Dacă momentul în timp nu are nicio semnificație, atașează datele ca atribute
  ale intervalului.

### Legături între intervale {#span-links}

Legăturile există pentru a putea asocia un interval cu unul sau mai multe
intervale, ceea ce implică o relație cauzală. De exemplu, să presupunem că avem
un sistem distribuit în care unele operații sunt urmărite printr-o urmă.

Ca răspuns la unele dintre aceste operații, o operație suplimentară este pusă
într-o coadă pentru a fi executată, dar execuția ei este asincronă. Putem urmări
și această operație ulterioară printr-o urmă.

Am vrea să asociem urma operațiilor ulterioare cu prima urmă, dar nu putem
prezice când vor începe operațiile ulterioare. Trebuie să asociem aceste două
urme, așa că vom folosi o legătură între intervale.

Poți lega ultimul interval din prima urmă de primul interval din a doua urmă.
Acum, acestea sunt asociate cauzal între ele.

Legăturile sunt opționale, dar reprezintă o modalitate bună de a asocia
intervale între ele.

Pentru mai multe informații, vezi
[legături între intervale](/docs/specs/otel/trace/api/#link).

### Starea intervalului {#span-status}

Fiecare interval are o stare. Cele trei valori posibile sunt:

- `Unset`
- `Error`
- `Ok`

Valoarea implicită este `Unset`. Starea `Unset` a unui interval înseamnă că
operația pe care a urmărit-o s-a finalizat cu succes, fără erori.

Când starea unui interval este `Error`, înseamnă că a apărut o eroare în
operația pe care o urmărește. De exemplu, aceasta poate fi cauzată de o eroare
HTTP 500 pe un server care procesează o cerere.

Când starea unui interval este `Ok`, înseamnă că intervalul a fost marcat
explicit ca fiind fără erori de către dezvoltatorul unei aplicații. Deși este
contraintuitiv, nu este obligatoriu să setezi starea unui interval la `Ok` când
se știe că intervalul s-a finalizat fără erori, deoarece acest caz este acoperit
de `Unset`. Rolul lui `Ok` este de a reprezenta o "decizie finală" neambiguă
asupra stării unui interval, setată explicit de un utilizator. Acest lucru este
util în orice situație în care un dezvoltator dorește ca un interval să nu poată
fi interpretat altfel decât "finalizat cu succes".

Pentru a reitera: `Unset` reprezintă un interval care s-a finalizat fără erori.
`Ok` reprezintă situația în care un dezvoltator marchează explicit un interval
ca finalizat cu succes. În majoritatea cazurilor, nu este necesar să marchezi
explicit un interval ca `Ok`.

### Tipul intervalului {#span-kind}

Când un interval este creat, acesta are unul dintre tipurile `Client`, `Server`,
`Internal`, `Producer` sau `Consumer`. Acest tip oferă un indiciu backend-ului
de urmărire despre cum ar trebui asamblată urma. Conform specificației
OpenTelemetry, părintele unui interval de tip server este adesea un interval de
tip client aflat la distanță, iar copilul unui interval de tip client este de
obicei un interval de tip server. În mod similar, părintele unui interval de tip
consumator este întotdeauna un producător, iar copilul unui interval de tip
producător este întotdeauna un consumator. Dacă nu este specificat, tipul
intervalului este considerat intern.

Pentru mai multe informații despre tipul intervalului, vezi
[SpanKind](/docs/specs/otel/trace/api/#spankind).

#### Client {#client}

Un interval de tip client reprezintă un apel la distanță sincron de ieșire, cum
ar fi o cerere HTTP de ieșire sau un apel către o bază de date. Reține că, în
acest context, "sincron" nu se referă la `async/await`, ci la faptul că nu este
pus într-o coadă pentru a fi procesat ulterior.

#### Server {#server}

Un interval de tip server reprezintă un apel la distanță sincron de intrare, cum
ar fi o cerere HTTP de intrare sau un apel de procedură la distanță.

#### Intern {#internal}

Intervalele de tip intern reprezintă operații care nu traversează limitele unui
proces. Lucruri precum instrumentarea unui apel de funcție sau a unui middleware
Express pot folosi intervale de tip intern.

#### Producător {#producer}

Intervalele de tip producător reprezintă crearea unei sarcini care poate fi
procesată asincron ulterior. Poate fi o sarcină la distanță, cum ar fi una
inserată într-o coadă de sarcini, sau o sarcină locală gestionată de un
ascultător de evenimente.

#### Consumator {#consumer}

Intervalele de tip consumator reprezintă procesarea unei sarcini create de un
producător și pot începe mult după ce intervalul de tip producător s-a încheiat
deja.

## Specificație {#specification}

Pentru mai multe informații, vezi
[specificația urmelor](/docs/specs/otel/overview/#tracing-signal).
