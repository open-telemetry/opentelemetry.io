---
title: Blog
description: Află cum să trimiți o postare pe blog.
weight: 30
default_lang_commit: 09d3687760884bda721b6ddb9f3b91e2ddfb1021 #patched
---

[Blogul OpenTelemetry](/blog/) comunică noi funcții, rapoarte comunitare și
orice noutăți care ar putea fi relevante pentru comunitatea OpenTelemetry.
Aceasta include utilizatorii finali și dezvoltatorii. Oricine poate scrie o
postare pe blog, citește mai jos care sunt cerințele.

## Documentație sau postare pe blog?

Înainte de a scrie o postare pe blog, întreabă-te dacă și conținutul tău ar
putea fi o bună adăugare la documentație. Dacă răspunsul este „da”, creează o
nouă problemă sau un pull request (PR) cu conținutul tău pentru a-l adăuga în
documentație.

Reține că obiectivul administratorilor și al aprobatorilor site-ului web
OpenTelemetry este de a îmbunătăți documentația proiectului, astfel încât
postarea ta pe blog va avea o prioritate mai mică pentru revizuire.

## Cerere de conținut pentru rețelele sociale

Dacă dorești să soliciți publicarea de conținut pe canalele de socializare ale
proiectului OpenTelemetry, care nu este o postare pe blog,
[folosește acest formular](https://github.com/open-telemetry/community/issues/new?template=social-media-request.yml).

## Înainte de a trimite o postare pe blog

Postările pe blog nu trebuie să fie de natură comercială și trebuie să conțină
conținut original care se aplică în general comunității OpenTelemetry. Postările
pe blog trebuie să respecte politicile descrise în
[Ghidul pentru rețelele sociale](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).

### Legături către repertoriul GitHub

Postările pe blog sunt verificate de markdownlint (`gh-url-hash`) pentru a
preveni linkurile instabile `blob`/`tree` de pe GitHub.

Dacă verificarea raportează o problemă:

- Înlocuiește referințele implicite ale ramurii (de exemplu, `main`/`master`) cu
  o etichetă/release sau un hash de commit.

- Folosește un hash de commit complet de 40 de caractere (hash-urile scurte sunt
  semnalizate).

- Rulează `npm run fix:markdown` pentru a remedia automat ce poate, apoi
  remediază manual orice linkuri rămase raportate.

Verifică dacă conținutul dorit se aplică în general comunității OpenTelemetry .
Conținutul adecvat include:

- Noi capacități OpenTelemetry
- Actualizări ale proiectelor OpenTelemetry
- Actualizări de la grupuri de interese speciale
- Tutoriale și ghiduri practice
- Integrări OpenTelemetry
- [Apel pentru colaboratori](#call-for-contributors)

Conținutul neadecvat include:

- Prezentări de produse ale furnizorilor

Dacă postarea ta de pe blog se încadrează în lista de conținut adecvat,
[raportează o problemă](https://github.com/open-telemetry/opentelemetry.io/issues/new?title=New%20Blog%20Post:%20%3Ctitle%3E)
cu următoarele detalii:

- Titlul postării de pe blog
- Scurtă descriere și schiță a postării tale de pe blog
- Dacă este cazul, enumerează tehnologiile utilizate în postarea ta de pe blog.
  Asigură-te că toate sunt open source și preferă proiectele CNCF față de
  proiectele non-CNCF (de exemplu, utilizează Jaeger pentru vizualizarea urmelor
  și Prometheus pentru vizualizarea metricelor)

- Numele unui [SIG](https://github.com/open-telemetry/community/), care este
  legat de această postare pe blog
- Numele unui sponsor (întreținător sau aprobator) din acest SIG, care va ajuta
  la revizuirea acelui PR. În mod ideal, sponsorul respectiv ar trebui să fie
  dintr-o altă companie.

Întreținătorii comunicării SIG vor verifica dacă postarea dvs. pe blog
îndeplinește toate cerințele pentru a fi acceptată. Dacă nu poți numi un
SIG/sponsor în detaliile inițiale ale problemei, aceștia te vor îndruma, de
asemenea, către un SIG adecvat, pe care îl poți contacta pentru sponsorizare. A
avea un sponsor este opțional, dar a avea unul crește șansa ca postarea ta pe
blog să fie revizuită și aprobată mai rapid.

Dacă problema ta are tot ce este necesar, un administrator va verifica dacă poți
continua și trimite postarea pe blog.

### Apel pentru contribuitori {#call-for-contributors}

Dacă propui crearea unui nou proiect sau SIG sau dacă oferi o donație pentru
proiectul OpenTelemetry, vei avea nevoie de contribuitori suplimentari pentru ca
propunerea ta să aibă succes. Pentru a te ajuta în acest sens, poți propune o
postare pe blog care este un „Apel pentru contribuitori” (CfC).

Acest lucru necesită să urmezi procesele pentru
[proiecte noi](https://github.com/open-telemetry/community/blob/main/project-management.md)
și
[donații](https://github.com/open-telemetry/community/blob/main/guides/contributor/donations.md).

## Trimite o postare pe blog

Poți trimite o postare pe blog fie prin crearea unui fork în acest repertoriu și
scrierea acesteia local, fie utilizând interfața cu utilizatorul GitHub. În
ambele cazuri, te rugăm să urmezi instrucțiunile furnizate de
[șablonul de postare pe blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md).

### Crează un fork și scrie local

După ce ai configurat bifurcația locală, poți crea o postare pe blog folosind un
șablon. Urmează acești pași pentru a crea o postare din șablon:

1. Rulează următoarea comandă din rădăcina repertoriului:

```sh
npx hugo new content/en/blog/$(date +%Y)/short-name-for-post.md
```

Dacă postarea ta conține imagini sau alte resurse, rulează următoarea comandă:

```sh
npx hugo new content/en/blog/$(date +%Y)/short-name-for-post/index.md
```

1. Editează fișierul Markdown la calea pe care ai furnizat-o în comanda
   anterioară. Fișierul este inițializat din fișierul de pornire a articolelor
   de blog din
   [arhetipuri](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/).

2. Pune resursele, cum ar fi imagini sau alte fișiere, în folderul pe care l-ai
   creat.

3. Când postarea este gata, trimite-o printr-o solicitare de extragere.

### Utilizează interfața cu utilizatorul GitHub

Dacă preferi să nu creezi o ramură locală, poți utiliza interfața cu
utilizatorul GitHub pentru a crea o postare nouă. Urmează acești pași pentru a
adăuga o postare utilizând interfața cu utilizatorul:

1. Accesează
   [șablonul de postare pe blog](https://github.com/open-telemetry/opentelemetry.io/tree/main/archetypes/blog.md)
   și dă clic pe **Copiați conținutul brut** în partea dreaptă sus a meniului.

1. Selectează
   [Crează un fișier nou](https://github.com/open-telemetry/opentelemetry.io/new/main).

1. Lipește conținutul din șablonul pe care l-ai copiat în primul pas.

1. Denumește fișierul, de exemplu (`AAAA` este anul curent):

`content/ro/blog/AAAA/nume-prescurtat-pentru-postarea-pe-blog/index.md`.

1. Editează fișierul Markdown în GitHub.

1. Când postarea ta este gata, selectează **Propune modificări** și urmează
   instrucțiunile.

## Termene de publicare

Blogul OpenTelemetry nu respectă un termen strict de publicare, ceea ce
înseamnă:

- Postarea ta pe blog va fi publicată atunci când va avea toate aprobările
  necesare.

- Publicarea poate fi amânată dacă este necesar, dar administratorii nu pot
  garanta publicarea la o anumită dată sau înainte de aceasta.

- Anumite postări pe blog (anunțuri majore) au prioritate și pot fi publicate
  înainte de postarea ta pe blog.

## Postare încrucișată a conținutului blogului

Dacă dorești să partajezi postarea ta pe blogul OpenTelemetry pe o altă
platformă, ești binevenit(ă) să o faci. Reține următoarele:

- Decide care versiune va fi postarea canonică (de obicei, postarea originală de
  pe blogul OpenTelemetry).

- Alte versiuni ale postării ar trebui:

- Să menționeze clar că postarea originală a apărut pe blogul OpenTelemetry.

- Să includă un link către original în partea de sus sau de jos a paginii.

- Să seteze o etichetă URL canonică care să indice către postarea de pe blogul
  OpenTelemetry, dacă platforma o acceptă.

Acest lucru ajută la asigurarea unei atribuiri corecte, susține cele mai bune
practici SEO și evită duplicarea conținutului.

## Old blogs are not updated {#old-blogs-are-not-updated}

(Translation coming soon. In the meantime, see the [English
section](/en/docs/contributing/blog/#old-blogs-are-not-updated).)
