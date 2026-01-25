---
title: Distribuții
description: >-
  O distribuție, care nu trebuie confundată cu o ramificație, este o versiune
  personalizată a unei componente OpenTelemetry.
weight: 190
default_lang_commit: a1dda51143cfbdf26cd320bea7ae43569c585cb3
---

Proiectele OpenTelemetry constau din mai multe [componente](../components) care
suportă mai multe [semnale](../signals). Implementarea de referință a
OpenTelemetry este disponibilă ca:

- [Biblioteci de instrumentație specifice limbajului](../instrumentation)
- Un [Colector binar](/docs/concepts/components/#collector)

Orice implementare de referință poate fi personalizată ca o distribuție.

## Ce este o distribuție? {#what-is-a-distribution}

O distribuție este o versiune personalizată a unei componente OpenTelemetry. O
distribuție este un wrapper în jurul unui repertoriu OpenTelemetry din amonte cu
unele personalizări. Distribuțiile nu trebuie confundate cu ramificațiile.

Personalizările dintr-o distribuție pot include:

- Scripturi pentru a facilita utilizarea sau a personaliza utilizarea pentru un
  anumit backend sau furnizor
- Modificări ale setărilor implicite necesare pentru un backend, furnizor sau
  utilizator final
- Opțiuni suplimentare de ambalare care pot fi specifice furnizorului sau
  utilizatorului final
- Acoperire de testare, performanță și securitate dincolo de ceea ce oferă
  OpenTelemetry
- Capacități suplimentare dincolo de ceea ce oferă OpenTelemetry
- Mai puține capacități față de ceea ce oferă OpenTelemetry

Distribuțiile se încadrează, în general, în următoarele categorii:

- **„Pure”:** Aceste distribuții oferă aceleași funcționalități ca și cele din
  amonte și sunt 100% compatibile. Personalizările îmbunătățesc de obicei
  ușurința în utilizare sau împachetarea. Aceste personalizări pot fi specifice
  backend-ului, furnizorului sau utilizatorului final.

- **„Plus”:** Aceste distribuții oferă funcționalități suplimentare pe lângă
  amonte prin componente suplimentare. Exemplele includ biblioteci de
  instrumentație sau exportatori de furnizori care nu sunt conectați la
  proiectul OpenTelemetry.

- **„Minus”:** Aceste distribuții oferă un subset de funcționalități din amonte.
  Exemple în acest sens includ eliminarea bibliotecilor de instrumentație sau a
  receptoarelor, procesoarelor, exportatorilor sau extensiilor găsite în
  proiectul OpenTelemetry Colector. Aceste distribuții pot fi furnizate pentru a
  crește suportabilitatea și considerațiile de securitate.

## Cine poate crea o distribuție? {#who-can-create-a-distribution}

Oricine poate crea o distribuție. Astăzi, mai mulți
[furnizori](/ecosystem/vendors/) oferă [distribuții](/ecosystem/distributions/).
În plus, utilizatorii finali pot lua în considerare crearea unei distribuții
dacă doresc să utilizeze componente din [registru](/ecosystem/registry/) care nu
sunt conectate în amonte la proiectul OpenTelemetry.

## Contribuție sau distribuție? {#contribution-or-distribution}

Înainte de a continua să citești și să afli cum poți crea propria distribuție,
întrebă-te dacă adăugările tale peste o componentă OpenTelemetry ar fi benefice
pentru toată lumea și, prin urmare, ar trebui incluse în implementările de
referință:

- Pot fi generalizate scripturile tale pentru „ușurință în utilizare”?
- Pot fi modificările aduse setărilor implicite o opțiune mai bună pentru toată
  lumea?
- Sunt opțiunile tale suplimentare de ambalare cu adevărat specifice?
- Ar putea acoperirea ta de testare, performanță și securitate să funcționeze și
  cu implementarea de referință?
- Ai verificat cu comunitatea dacă capabilitățile tale suplimentare ar putea
  face parte din standard?

## A crea propria ta distribuție {#creating-your-own-distribution}

### Colector {#collector}

Un ghid despre cum să îți creezi propria distribuție este disponibil în această
postare pe blog:
[„Construirea propriei distribuții OpenTelemetry Colector”](https://medium.com/p/42337e994b63)

Dacă îți construiești propria distribuție,
[constructorul de colector OpenTelemetry](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)
ar putea fi un bun punct de plecare.

### Biblioteci de instrumentație specifice limbajului {#language-specific-instrumentation-libraries}

Există mecanisme de extensibilitate specifice limbajului pentru a personaliza
bibliotecile de instrumentație:

- [Agent Java](/docs/zero-code/java/agent/extensions)

## Urmărește instrucțiunile {#follow-the-guidelines}

Când utilizezi materiale promoționale ale proiectului OpenTelemetry, cum ar fi
sigla și numele pentru distribuția ta, asigură-te că respecți [Orientările de
marketing OpenTelemetry pentru organizațiile contribuitoare][îndrumări].

Proiectul OpenTelemetry nu certifică distribuții în acest moment. În viitor,
OpenTelemetry poate certifica distribuții și parteneri similar cu proiectul
Kubernetes. Atunci când evaluezi o distribuție, asigură-te că utilizarea
distribuției nu duce la blocarea furnizorului.

> Orice suport pentru o distribuție provine de la autorii distribuției și nu de
> la autorii OpenTelemetry.

[îndrumări]:
  https://github.com/open-telemetry/community/blob/main/marketing-guidelines.md
