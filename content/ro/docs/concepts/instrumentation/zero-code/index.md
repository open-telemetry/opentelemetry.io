---
title: Fără cod
description: >-
  Află cum să adaugi observabilitate la o aplicație fără a fi nevoie să scrii
  cod
weight: 10
aliases: [automatic]
default_lang_commit: 276d3d198a0363b9cd3ecfa480261feaa3a279ef
---

În calitate de [ops](/docs/getting-started/ops/), s-ar putea să dorești să
adaugi capacități de observabilitate uneia sau mai multor aplicații, fără a fi
nevoie să modifici codul sursă. OpenTelemetry îți permite să obții rapid un
anumit nivel de observabilitate pentru un serviciu, fără a fi necesară
utilizarea API-ului și SDK-ului OpenTelemetry pentru
[instrumentarea bazată pe cod](/docs/concepts/instrumentation/code-based).

![Zero Code](./zero-code.svg)

Instrumentarea de tip fără cod adaugă capabilitățile API-ului și SDK-ului
OpenTelemetry în aplicația ta, de obicei sub forma unui agent sau a unei
instalări similare unui agent. Mecanismele specifice implicate pot varia în
funcție de limbajul de programare – de la manipularea bytecode-ului, „monkey
patching” sau eBPF – fiind utilizate pentru a insera apeluri către API-ul și
SDK-ul OpenTelemetry în cadrul aplicației ta.

De regulă, instrumentarea de tip fără cod adaugă instrumentare pentru
bibliotecile pe care le utilizezi. Aceasta înseamnă că sunt instrumentate
elemente precum cererile și răspunsurile, apelurile către baze de date,
interacțiunile cu cozile de mesaje și altele similare. Codul propriu-zis al
aplicației tale, însă, nu este, de obicei, instrumentat. Pentru a instrumenta
codul aplicației, va trebui să utilizezi
[instrumentarea bazată pe cod](/docs/concepts/instrumentation/code-based).

În plus, instrumentarea de tip fără cod îți permite să configurezi
[bibliotecile de instrumentare](/docs/concepts/instrumentation/libraries) și
[exportatoarele](/docs/concepts/components/#exporters) încărcate.

Poți configura instrumentarea de tip fără cod prin intermediul variabilelor de
mediu și al altor mecanisme specifice limbajului de programare, cum ar fi
proprietățile de sistem sau argumentele transmise metodelor de inițializare.
Pentru a începe, este suficient să configurezi un nume de serviciu, astfel încât
să poți identifica serviciul în platforma de observabilitate pe care ai ales-o.

Sunt disponibile și alte opțiuni de configurare, inclusiv:

- Configurarea specifică sursei de date
- Configurarea exportatoarelor
- Configurarea propagatoarelor
- Configurarea resurselor

Instrumentarea automată este disponibilă pentru următoarele limbaje de
programare:

- [.NET](/docs/zero-code/dotnet/)
- [Go](/docs/zero-code/go)
- [Java](/docs/zero-code/java/)
- [JavaScript](/docs/zero-code/js/)
- [PHP](/docs/zero-code/php/)
- [Python](/docs/zero-code/python/)
