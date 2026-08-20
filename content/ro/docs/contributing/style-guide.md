---
title: Ghid de stil al documentației
description: Terminologie și stil în scrierea documentelor OpenTelemetry.
linkTitle: Stil al documentației
weight: 20
params:
  alertExamples: |
    > [!TIP]
    >
    > Dacă scrii conținut nou, în general, preferă folosirea acestei sintaxe de alertă cu citate bloc
    > în loc de sintaxa Docsy
    > [alert shortcode](https://www.docsy.dev/docs/content/shortcodes/#alert).

    > [!WARNING] :warning: Este necesară o linie goală!
    >
    > Acest site folosește formatorul [Prettier] și necesită o linie goală care să separe eticheta/titlul alertei de corpul alertei.

default_lang_commit: a952eff2a2324c36e48dd9465407074886e22b91
cSpell:ignore: postgre
---

We don't have an official style guide yet, but the current OpenTelemetry
documentation style is inspired by the following style guides:

- [Ghid de stil al documentației Google Developer](https://developers.google.com/style)
- [Stil al documentației Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

Următoarele secțiuni conțin îndrumări specifice proiectului OpenTelemetry.

> [!NOTE]
>
> Multe cerințe ale ghidului nostru de stil pot fi aplicate prin rularea
> automatizării: înainte de a trimite un [pull request][] (PR), rulează
> `npm run fix:all` pe mașina ta locală și confirmă modificările.
>
> Dacă întâmpini erori sau [verificări de PR eșuate](../pr-checks), citește
> despre ghidul nostru de stil și află ce poți face pentru a remedia anumite
> probleme comune.

[pull request]:
  https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request

## Listă de cuvinte OpenTelemetry.io {#openTelemetry.io-word-list}

O listă de termeni și cuvinte specifice OpenTelemetry care trebuie utilizate în
mod consecvent pe tot site-ul:

- [OpenTelemetry](/docs/concepts/glossary/#opentelemetry) și
  [OTel](/docs/concepts/glossary/#otel)
- [Collector](/docs/concepts/glossary/#collector)
- [OTEP](/docs/concepts/glossary/#otep)
- [OpAMP](/docs/concepts/glossary/#opamp)

Pentru o listă completă a termenilor OpenTelemetry și definiția acestora, vezi
[Glosar](/docs/concepts/glossary/).

Asigură-te că substantivele proprii, cum ar fi alte proiecte CNCF sau
instrumente terțe, sunt scrise corect și folosesc majusculele originale. De
exemplu, scrie „PostgreSQL” în loc de „postgre”. Pentru o listă completă,
verifică fișierul
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml).

## Markdown

Paginile site-ului sunt scrise în sintaxa Markdown acceptată de programul de
randare Markdown [Goldmark][]. Pentru lista completă a extensiilor Markdown
acceptate, vezi [Goldmark][].

De asemenea, poți utiliza următoarele extensii Markdown:

- [Alerte](#alerts)
- [Emoji][]: pentru lista completă a emojiilor disponibile, vezi [Emoji][] din
  documentele Hugo.

[Emoji]: https://gohugo.io/quick-reference/emojis/

### Alerte {#alerts}

Poți scrie alerte folosind următoarea sintaxă extinsă:

- [Markdown cu stil GitHub][GFM] (GFM) [alerts][gfm-alerts]
- Sintaxa [Obsidian callout][] pentru titluri de alerte personalizate

Iată un exemplu pentru fiecare:

```markdown
{{% _param alertExamples %}}
```

Acestea se redau astfel:

{{% _param alertExamples %}}

Pentru detalii despre sintaxa alertelor pentru citate bloc, consultă
[Alerts][docsy-alerts] din documentația Docsy.

[gfm-alerts]:
  https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[docsy-alerts]: https://www.docsy.dev/docs/content/adding-content/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### Referințe de link {#link-references}

Când utilizezi Markdown [linkuri de referință][], preferă forma _restrânsă_
`[text][]` în locul formei _shortcut_ `[text]`. Deși ambele sunt valide
[CommonMark][], forma shortcut nu este recunoscută în mod constant de toate
instrumentele Markdown. În special, dacă scrii `[exemplu]` și uiți definiția,
linter-ul [markdownlint][] nu te va avertiza[^md052] -- textul este redat
silențios ca literal `[exemplu]` în loc de link. Cu forma restrânsă
`[exemplu][]`, linter-ul surprinde imediat definiția lipsă.

[^md052]:
    Mai exact, regula încorporată [MD052][] (`reference-links-images`) verifică
    implicit doar formularele de referință restrânse și complete. Opțiunea sa
    `shortcut_syntax` poate include referințe de scurtături, dar nu funcționează
    bine în practică.

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

Acest lucru este impus de regula personalizată `no-shortcut-ref-link`. Rulează
`npm run fix:markdown` pentru a converti automat referințele la comenzi rapide.

[CommonMark]: https://spec.commonmark.org/0.31.2/#reference-link
[linkuri de referință]: https://spec.commonmark.org/0.31.2/#reference-link

### Verificări Markdown {#markdown-standards}

Pentru a aplica standarde și consecvență pentru fișierele Markdown, toate
fișierele ar trebui să respecte anumite reguli, impuse de [markdownlint][].
Pentru o listă completă, consultă fișierele [.markdownlint.yaml][] și
[.markdownlint-cli2.yaml][].

Când există excepții legitime de la o regulă, utilizează directiva
`markdownlint-disable` pentru a suprima avertismentele privind regula. Pentru
detalii, vezi
[documentația markdownlint](https://github.com/DavidAnson/markdownlint#configuration).

De asemenea, aplicăm Markdown [format fișier](#file-format) și eliminăm spațiile
albe de la sfârșit din fișiere. Acest lucru exclude [sintaxa de sfârșit de
linie][] de peste 2 spații; utilizează `<br>` în schimb sau reformează textul.

## Verificarea ortografiei {#spell-checking}

Folosește [CSpell](https://github.com/streetsidesoftware/cspell) pentru a te
asigura că tot textul tău este scris corect.

Dacă `cspell` raportează un „Cuvânt necunoscut”, verifică dacă ai scris cuvântul
corect. Dacă da, adaugă cuvântul într-una dintre aceste locații:

- O listă `cSpell:ignore` locală în pagina principală. Pentru detalii, vezi mai
  jos.

- Fișierul tău cu lista de cuvinte specifică setărilor regionale
- Lista generală de cuvinte [all-words.txt][]

[all-words.txt]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/all-words.txt

### Lista `cSpell:ignore` locală a paginii {#page-local-`cSpell:ignore`-list}

Dacă cuvântul necunoscut apare doar pe o singură pagină sau pe câteva pagini,
adăugă-l la o listă `cSpell:ignore` de tip `page local` în partea de sus a
paginii:

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

Pentru fișierele non-Markdown, adăugă `cSpell:ignore <cuvânt>` într-o linie de
comentarii corespunzătoare fișierului. De exemplu, într-un fișier YAML cu
intrare [registry](/ecosystem/registry/), ar putea arăta astfel:

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

### Fișiere cu listă de cuvinte {#word-list-files}

Dacă cuvântul necunoscut apare pe mai multe pagini sau este un termen tehnic,
adăugă-l în fișierul cu lista de cuvinte specific setărilor regionale. Fișierele
cu lista de cuvinte se află în directorul [.cspell/][].

Dacă cuvântul este scris corect în toate setările regionale, cum ar fi `opamp`,
adăugă-l în fișierul [all-words.txt][].

[.cspell/]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/

## Formatul fișierului {#file-format}

Folosim [Prettier][] pentru a impune formatarea fișierelor. Invocă-l folosind:

- `npm run fix:format` pentru a formata toate fișierele
- `npm run fix:format:diff` pentru a formata doar fișierele care s-au modificat
  de la ultimul commit
- `npm run fix:format:staged` pentru a formata doar fișierele care sunt
  modificate pentru următorul commit

## Nume de fișiere {#file-names}

Toate numele fișierelor ar trebui să fie în
[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case).

## Rezolvarea problemelor de validare {#fixing-validation-issues}

Pentru a afla cum să remediezi problemele de validare, vezi
[verificările Pull request-ului](../pr-checks).

[.markdownlint.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[sintaxa de sfârșit de linie]:
  https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
