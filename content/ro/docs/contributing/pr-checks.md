---
title: Verificări și teste pentru pull request
linkTitle: Verificări și teste de PR
description:
  Învață cum să faci ca pull request-ul tău să treacă toate verificările
weight: 40
default_lang_commit: bd03f1126f53ee43b8eacc129b36e0d244ce43f4
drifted_from_default: true
---

Atunci când ridici un
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) cu
[repertoriul opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io)
sunt set de verificări sunt executate. Aceste verificări de PR se asigură că:

- Ai semnat [CLA-ul](#easy-cla)
- PR-ul tău se [lansează prin Netlify](#netlify-deployment)
- Modificările tale sunt conforme cu [ghidul de stil](#checks)

> [!NOTE]
>
> Dacă oricare dintre verificările PR-ului eșuează, încearcă să
> [rezolvi problemele de conținut](../pull-requests/#fix-issues) începând prin a
> rula `npm run fix:all` local.
>
> Poți de asemenea să adaugi comentariul `/fix` la PR-ul tău. Asta va porni
> Bot-ul OpenTelemetry care o să ruleze acea comandă pentru tine pentru a
> actualiza PR-ul. Fii sigur că tragi acele schimbări local.
>
> Numai dacă problemele tale persistă, citește mai jos ce alte verificări fac și
> cum poți să revii dintr-o stare de eșec.

## `Easy CLA` {.notranslate lang=en}

Această verificare eșuează dacă nu ai [semnat CLA-ul](../prerequisites/#cla).

## Deployment Netlify

Dacă build-ul de [Netlify](https://www.netlify.com/) eșuează, selectează
**Detaliile** pentru mai multe informații.

## Verificările de GitHub PR {#checks}

Pentru a ne asigura că schimbările urmăresc [ghidu de stil](../style-guide/) am
implementat un set de verificări care verifică regulile ghidului de stil și
eșuează dacă găsesc vreo problemă.

Secțiunile de mai jos descriu verificările actuale și ce poți face pentru a
remedia erorile aferente.

> [!NOTE]
>
> Numai post-urile de blog recente sunt verificate. Pentru detalii, vezi
> [blog-urile vechi nu sunt actualizate][old-blogs]. În mod special, în timp ce
> postările vechi sunt afișate pe website, verificările următoare nu se aplică
> lor.

[old-blogs]: ../blog/#old-blogs-are-not-updated

### `Linter-ul de TEXT` {.notranslate lang=en}

Această verificare verifică faptul că
[Termeni și cuvinte specifice OpenTelemetry sunt utilizate în mod constant pe tot site-ul](../style-guide/#opentelemetryio-word-list).

Dacă se constată probleme, se adaugă adnotări în fișierele tale din secțiunea
`files changed` a PR-ului tău. Corectează-le pentru a trece verificările. Ca o
alternativă, poți rula local `npm run check:text -- --fix` pentru a rezolva
majoritate problemelor. Rulează `npm run check:text` din nou și rezolvă manual
problemele rămase.

### `Linter-ul de MARKDOWN` {.notranslate lang=en}

Această verificare verifică dacă
[standardele și consecvența pentru fișierele Markdown sunt aplicate](../style-guide/#markdown-standards).

Dacă se constată probleme, rulează `npm run fix:markdown` pentru a rezolva
majoritate problemelor automat. Pentru orice problemă rămasă, rulează
`npm run check:markdown` și aplică modificările sugerate manual.

### `Verificare ortografică` {.notranslate lang=en}

Această verificare verifică dacă [toate cuvintele sunt scrise
corect][spell checking] în toate localizările.

If the check fails, run `npm run check:spelling` locally to list issues. To add
or change allowed words, see [Spell checking][] in the style guide. Dacă această
verificare eșuează, rulează `npm run check:spelling` local pentru a vedea
problemele. Pentru a adăuga sau schimba cuvintele permise, vezi [verificare
ortografică][Spell checking] în ghidul de stil.

[Spell checking]: ../style-guide/#spell-checking

### Verificarea `CSPELL` {.notranslate lang=en}

Această verificare verifică dacă listele `cSpell:ignore` din front matter sunt
normalizate și dacă listele de cuvinte `.cspell/*.txt` sunt sortate (vezi
`npm run fix:dict`).

Dacă această verificare eșuează, rulează `npm run fix:dict` local și introdu
modificările într-un nou commit.

### `FILE FORMAT` {.notranslate lang=en}

Această verificare verifică dacă toate fișierele sunt conforme cu
[Regulile de formatare Prettier](../style-guide/#file-format).

Dacă această verificare eșuează, rulează `npm run fix:format` local și introdu
modificările într-un nou commit.

### `Verificare FILENAME` {.notranslate lang=en}

Această verificare verifică dacă:

- Toate [numele de fișiere sunt kebab-case](../style-guide/#file-names)
- Nu există fișiere sau foldere învechite în repertoriu (vezi lista de mai jos)

Dacă această verificare eșuează, rulează `npm run fix:filenames` local și
introdu modificările într-un nou commit.

> [!NOTE]
>
> `fix:filenames` ar putea **șterge** fișiere sau foldere vechi.

#### Fișiere și foldere învechite

Următoarele căi sunt semnalate ca fiind vechi și sunt înlăturare de
`fix:filenames`. Când există, un issue sau număr de PR oferă context pentru
schimbarea care a făcut acea cale să fie învechită.

- `tools/` - [Migrate code-excerpts tooling to npm package version #9638][#9638]

[#9638]: https://github.com/open-telemetry/opentelemetry.io/pull/9638

### `BUILD` și `CHECK LINKS` {.notranslate lang=en}

Aceste două verificări construiesc website-ul și verifică că toate link-urile
sunt valide.

Pentru a construi și verifica link-uri local, rulează `npm run check:links`.
Această comandă de asemenea actualizează și cache-ul de referință. Adaugă orice
modificare la refcache într-un nou comit.

> [!NOTE]
>
> For information on warnings about site-local links, see
> [Always use a path for site-local links](#avoid-external-site-local-links).
> Pentru mai multe informații despre avertismente legate de link-uri site-local,
> vezi
> [Folosește mereu o cale pentru link-uri site-local](#avoid-external-site-local-links).

#### Rezolvă erorile 404

Trebuie să repari URL-urile semnalate ca și **invalide** (HTTP status **404**),
de către verificarea de link-uri.

#### Gestionarea linkurilor externe valide

Verificarea link-urilor va primi uneori alte status-uri HTTP decât 200 (succes)
de la servere care blochează verificatoarele. Asemenea servere vor întoarce des
un status HTTP în intervalul 400 altele decât 404, precum 401, 403 sau 406, care
sunt cele mai comune. Unele servere, link LinkedIn, întorc 999.

Dacă ai validate manual un link extern pentru care verificatorul nu primește un
status de succes, poți adăuga următorul parametru de interogare în URL-ul tău
pentru a ajuta verificatorul de link-uri să-l ignore: `?link-check=no` sau
`&link-check=no` dacă sunt și alți parametrii de interogare. De exemplu,
următoarele URL-uri vor fi ignorate:

- <https:/some-example.org?link-check=no>
- <https:/some-example.org?other-param=value&link-check=no>

> [!TIP] Sfat pentru întreținători
>
> Întreținătorii pot rula următorul script imediat după ce au rulat
> verificatorul de link-uri pentru a face Puppeteer să încercă să valideze
> link-uri cu status-uri non-ok.
>
> ```sh
> ./scripts/double-check-refcache-4XX.mjs
> ```
>
> Folosește indicatorul `-f` pentru a valida fragmente din URL (ancore) în
> link-uri externe, validări pe care `htmltest` nu le face. Momentan nu rulăm
> acest lucru des, așadar vei dori să limitezi numărul de actualizări ale
> intrărilor folosind indicatorul `-m N`. Pentru informații de utilizare,
> rulează cu `-h`.

### `Avertismente în log-ul build-ului?` {.notranslate lang=en}

Dacă această verificare eșuează, revizuiește log-ul de `BUILD and CHECK LINKS`,
sub pasul `npm run log:check:links`, pentru alte potențiale probleme. Întreabă
întreținători pentru ajutor, dacă nu știi cum să rezolvi această problemă.

#### Mereu folosește o cale pentru link-uri site-local {#avoid-external-site-local-links}

Atunci când facem link-uri către pagini din website-ul OpenTelemetry, folosește
căi locale în loc de link-uri externe. Build-ul va emite un avertisment dacă nu
faci asta.

Pentru a remedia avertismentul de build, păstrați doar partea cu calea din
adresa URL completă:

| ❌ Nu folosi                              | ✅ Folosește în schimb |
| ----------------------------------------- | ---------------------- |
| `https://opentelemetry.io/docs/concepts/` | `/docs/concepts/`      |
| `https://www.opentelemetry.io/blog/...`   | `/blog/...`            |

Using local paths ensures that: Utilizare căilor locale asigură că:

- Paginile site-local se deschid în același tab de browser: Link-urile externe
  se deschid într-un tab nou, comportament care nu este apreciat în navigarea
  site-local.
- Procesarea link-urile de localizare funcționează conform așteptărilor:
  link-urile sunt prefixate automat cu codul de limbă aferent.
- Căile locale sunt mai ușor de verificat și încarcă refcache-ul inutil.

<details>
<summary>Notă către întreținători</summary>

`Următorul cod impune cerințele pentru link-uri, descrise în această secțiune:`

- Hook-ul de render-link hook care emite acest avertisment:
  [`layouts/_markup/render-link.html`](https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_markup/render-link.html)
- Script-ul care convertește automat URL-uri complete în căi locale:
  [`scripts/content-modules/adjust-pages.pl`](https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages.pl)

</details>

### Ghidul de `LOCALIZARE` {.notranslate lang=en #localization}

Această verificare impune verificarea mecanică a
[ghidului de localizare](../localization/), precum a
[nu copia imagini și alte asset-uri](../localization/#images) în alte
localizări, care nu sunt deja acoperite de alte verificări

Dacă această verificare eșuează, rulează `npm run fix:l10n` local și adaugă
modificările într-un nou commit.

### `TEST (excluding test:base)` {.notranslate lang=en}

Rulează `npm run test:compound-tests`, care execută script-uri NPM compuse
`test:*-*` (spre exemplu, teste Netlify edge-function). Această comandă **nu**
rulează `test:base`.
