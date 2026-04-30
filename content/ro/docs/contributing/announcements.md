---
title: Anunțuri
description: Creează anunțuri sau bannere pentru evenimente speciale.
weight: 50
default_lang_commit: 774549b0f6181e901fa28f61672c0b0099cbdbda
---

Un anunț este o _pagină Hugo obișnuită_ conținută în secțiunea „anunțuri” a unei
setări regionale. Aceasta înseamnă că folosim gestionarea încorporată a datelor
paginilor (viitoare sau expirate), internaționalizării și a altor funcții în
Hugo pentru a afișa automat sau ascunde bannerele în funcție de data
construirii, a determina ordinea bannerelor, a gestiona revenirea la bannerele
în limba engleză etc.

> Anunțurile sunt folosite în prezent doar ca bannere. _S-ar putea_ să acceptăm
> în cele din urmă și anunțuri puțin mai generale.

## Crearea unui anunț {#creating-an-announcement}

Pentru a adăuga un anunț nou, creează un fișier Markdown pentru anunțuri în
folderul `anunțuri` al localizării tale folosind următoarea comandă:

```sh
hugo new --kind announcement content/YOUR-LOCALE/announcements/announcement-file-name.md
```

Ajustează în funcție de setările regionale și de numele fișierului dorite.
Adăugă textul anunțului ca corp al paginii.

> Pentru bannere, corpul anunțului ar trebui să fie o frază scurtă.

<!-- markdownlint-disable no-blanks-blockquote -->

> [!NOTE] Pentru localizări Dacă creezi o **suprascriere a anunțului specifică
> setărilor regionale**, asigură-te că utilizezi **același nume de fișier** ca
> anunțul >în limba engleză.

## Lista anunțurilor {#announcement-list}

Orice anunț dat va apărea într-o construcție a site-ului atunci când data
construcției se încadrează între câmpurile `date` și `expiryDate` ale anunțului.
Când aceste câmpuri lipsesc, se presupune că sunt „acum” și respectiv „pentru
totdeauna”.

Anunțurile vor apărea în ordinea standard a paginilor, determinată folosind
funcția Hugo [Pagini obișnuite](https://gohugo.io/methods/site/regularpages/).
Adică, cele mai „ușoare” anunțuri (după `greutate`) vor apărea primele; când
ponderile sunt aceleași sau nespecificate, cele mai recente anunțuri (după
`data`) vor apărea primele etc.

Așadar, dacă dorești să forțezi un anunț în partea de sus, utilizează o
`greutate` negativă în prima pagină.

Dacă găsești o eroare sau o problemă cu conținutul acestui depozit sau dacă
dorești să soliciți o îmbunătățire, [creează o problemă][problemă-nouă].

Dacă descoperi o problemă de securitate, citește
[Politica de securitate](https://github.com/open-telemetry/opentelemetry.io/security/policy)
înainte de a deschide o problemă.

Înainte de a raporta o problemă nouă, asigură-te că problema nu a fost deja
raportată sau remediată căutând în
[lista de probleme](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

Când creezi o problemă nouă, include un titlu scurt și semnificativ și o
descriere clară. Adaugă cât mai multe informații relevante și, dacă este
posibil, un caz de testare.

[problemă-nouă]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
