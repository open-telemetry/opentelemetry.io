---
title: Localizarea site-ului
description:
  Crearea și menținerea paginilor site-ului în localizări non englezești.
linkTitle: Localizare
weight: 25
default_lang_commit: 8711ecf72d25cdd723a0f7b6d41641df04eafb60
cSpell:ignore: Dowair shortcodes
---

Website-ul OTel folosește [framework-ul multilingvist][multilingual framework]
al lui Hugo pentru a susține localizările paginilor. Engleza este limba
implicită, având Engleză US ca localizare standard. Numărul localizărilor
disponibile este în continuă creștere, cum se poate vedea în lista de limbi din
bara de navigație din antet.

## Îndrumări pentru traducere

Când traduci pagini web din engleză, recomandăm să urmezi îndrumările oferite în
această secțiune

### Sumar

#### ✅ Ce se face {#do}

<div class="border-start border-success bg-success-subtle">

- **Traduce**:
  - Conținutul paginii, incluzând:
    - Câmpuri text din [diagrame](#images) Mermaid
    - Comentarii de cod din excepții de cod (opțional)
  - [Front matter][] valorile câmpurilor pentru `title`, `linkTitle`, și
    `description`
  - **Tot** conținutul paginii și front matter dacă nu se specifică altfel
- **Păstrează** _conținutul_, _înțelesul_, și _stilul_ textului original
- **Trimite schimbări _incrementale_** via [pull request-uri mici](#small-prs)
- **Întreabă** [administratori][maintainers] dacă aveți dubii sau întrebări
  prin:
  - [Slack][] Canalele `#otel-docs-localization` sau `#otel-comms`
  - [Discuție][Discussion], issue, sau comentariu pe PR

[Discussion]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ Ce NU se face {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **Traduce**:
  - [Tipuri de alerte](../style-guide/#alerts) cum ar fi `TIP`, `WARNING`, etc.
    Acest lucru este impus de o regulă [`MARKDOWN` linter][].
  - Cod, incluzând blocuri de cod sau cod inline (precum acest
    `exemplu de cod inline`)
  - Nume de **Fișier sau director** al resurselor din acest repertoriu
  - Câmpuri [Front matter][], altele decât cele enumerate în [Ce se face](#do).
    În special, nu traduce `aliasuri`. Când ai dubii, întreabă administratori.
  - [Linkuri](#links), asta include și [id-urile titlurilor](#headings) [^*]
  - Elemente Markdown marcate ca și `notranslate` (deobicei ca o clasă CSS), în
    special pentru [titluri](#headings)
- Creează **copii de imagini și alte fișiere**, decât dacă
  [traduci text din ele](#images)
- Adaugă sau schimbă:
  - **Conținut** care ar avea un sens diferit față de cel inițial dorit
  - **Stilul** de prezentare, incluzând: _formatare_, _aspect_, și stilul de
    _design_ (font, scrierea cu literă mică sau mare și spațierea spre exemplu).

[^*]: Pentru o posibilă excepție, vezi [Links](#links).

[`MARKDOWN` linter]: ../pr-checks/#markdown-linter

</div>

#### Utilizarea instrumentelor de inteligență artificială {#ai-tools}

Dacă folosești instrumente de inteligență artificială generativă (precum
ChatGPT, Gemini, sau similare) pentru a te ajuta cu traducerea, trebuie să
respecți [Politica OpenTelemetry privind contribuția folosind IA
generativă][genai-policy] și [Politica Linux Foundation privind contribuția
folosind IA generativă][lf-ai-policy]. În mod special:

- **Dezvăluie** că ai folosit IA bifând căsuța corespunzătoare din [șablonul
  pull request-ului][pull request template].
- **Revizuiește și validează** toate traducerile generate de IA pentru precizie.
  Tu ești responsabil pentru conținutul pe care-l trimiți.
- **Nu trimite** traduceri generate de IA pe care tu însuți nu le poți revizui
  și verifica (ex: traduceri în limbi pe care nu le stăpânești). Acest lucru
  creează un blocaj semnificativ în ceea ce privește revizuirile iar PR-ul tău
  poate fi închis pentru a proteja volumul de muncă al mentenanței.

[genai-policy]:
  https://github.com/open-telemetry/community/blob/main/policies/genai.md
[lf-ai-policy]: https://www.linuxfoundation.org/legal/generative-ai
[pull request template]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/PULL_REQUEST_TEMPLATE.md

### ID-urile titlurilor {#headings}

Pentru a asigura uniformitatea ancorelor de titlu în toate localizările, atunci
când se traduc titlurile:

- Păstrează ID-ul explicit al titlului dacă are unul. [Sintaxa ID-ului de
  titlu][Heading ID syntax] este scrisă după textul titlului folosind sintaxa
  `{ #some-id }`.
- Altfel, declară explicit un ID de titlu care să corespundă ID-ului autogenerat
  al titlului original în Engleză

[Heading ID syntax]:
  https://github.com/yuin/goldmark/blob/master/README.md#headings

### Links {#links}

**Nu** traduce referințele link-urilor. Acest lucru se aplică la link-uri
externe, căi către pagini ale website-ului și resurse locale din secțiuni cum ar
fi [imagini și alte resurse](#images).

Singura excepție este pentru link-uri către pagini externe (precum
<https://en.wikipedia.org>) care au o versiune specifică a localizării tale. În
mod frecvent acest lucru implică schimbarea `en`-ului din URL la codul de limbă
al localizării tale.

> [!NOTE]
>
> Repertoriul Website-ului OTel are un hook personalizat de randare pe care Hugo
> îl folosește să transforme căi absolute de link care fac referire la pagini de
> documentație. **Link-uri de forma `/docs/some-page` sunt făcute să fie
> specifice localizării** prin prefixarea căii cu codul de limbă atunci când se
> randează link-ul. Spre exemplu, calea precedentă ar deveni
> `/ja/docs/some-page` când este randată dintr-o pagină în japoneză.

### Etichete pentru definițiile link-urilor {#link-labels}

Autorii de traduceri regionale pot sau nu să aleagă să traducă
[etichete][labels] pentru [definițiile link-urilor][link definitions] din
Markdown. Dacă alegi să păstrezi eticheta în engleză, atunci urmărește ghidul
dat în această secțiune.

Ia în considerare următorul exemplu de Markdown:

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

Acesta ar fi tradus în franceză ca și:

```markdown
[Bonjour][hello], le monde! Bienvenue sur le [site OTel][OTel website].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

[labels]: https://spec.commonmark.org/0.31.2/#link-label
[link definitions]:
  https://spec.commonmark.org/0.31.2/#link-reference-definitions

### Images and other assets {#images}

- **Nu** face copii ale fișierelor de imagine, videoclipuri sau alte elemente
  care nu reprezintă conținut decât dacă traduci textul din fișier.
  - Hugo este deștept în felul în care randează fișiere de imagine care sunt
    partajate între traducerile din site. Prin urmare, Hugo va produce un
    _singur_ fișier de imagine și-l va împărți între traduceri. Pentru detalii,
    vezi [Page bundles][].
  - Acest lucru este impus de o verificare a îndeplinirii [instrucțiunilor de
    `LOCALIZARE`][l10n-check]

- **Nu** traduce text în diagrame [Mermaid][].

[l10n-check]: ../pr-checks/#localization
[Mermaid]: https://mermaid.js.org
[Page bundles]: https://gohugo.io/content-management/multilingual/#page-bundles

### Includerea de fișiere {#includes}

**Tradu** fragmente de pagini găsite în directoarele `_includes` la fel ca și
cum ai traducere orice alt conținut de pagină.

### Shortcodes

> [!NOTE]
>
> Din Februarie 2025, suntem în procesul de migrare de la shortcodes la
> [includeri de fișiere](#includes) ca modalitate de partajare a conținutului
> între pagini.

Unele dintre shortcode-urile de bază conțin text în limba engleză pe care s-ar
putea să fie nevoie să-l traduci. -- acest lucru este în mod special adevărat
pentru cele conținute în [layouts/_shortcodes/docs][].

Dacă ai nevoie să creezi o versiune tradusă a unui shortcode, pune-l în
`layouts/_shortcodes/xx`, unde `xx` este codul de limbă al traducerii tale. De
acolo, folosește aceeași cale relativă ca și shortcode-ul original de bază.

[layouts/_shortcodes/docs]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/_shortcodes/docs

## Urmărirea diferențelor dintre paginile localizate {#track-changes}

Una dintre principalele provocări ale menținerii paginilor localizate este
identificarea momentului în care versiunile corespunzătoare în limba engleză au
fost actualizate. Această secțiune explică modul în care tratăm acest lucru.

### Câmpul `default_lang_commit` din front matter

Atunci când se creează o pagină localizată, precum
`content/zh/<some-path>/page.md`, traducerea se bazează pe un anumit [commit din
branch-ul `main`][main] al versiunii în limba engleză a paginii, aflată la
`content/en/<some-path>/page.md`. În acest repertoriu, fiecare pagină localizată
identifică în front matter commit-ul paginii în limba engleză, astfel:

```markdown
---
title: Titlul paginii localizate
# ...
default_lang_commit:
  <hash-ul celui mai recent commit al paginii în limba implicită>
---
```

Front matter-ul de mai sus s-ar afla în `content/zh/<some-path>/page.md`.
Hash-ul commit-ului corespunde celui mai recent commit al paginii
`content/en/<some-path>/page.md` din branch-ul `main`.

### Urmărirea modificărilor aduse paginilor în limba engleză

Pe măsură ce paginile în limba engleză sunt actualizate, poți urmări paginile
localizate corespunzătoare care necesită actualizare rulând următoarea comandă:

```console
$ npm run check:i18n
> Drifted file: content/zh/docs/platforms/kubernetes/_index.md
...
DRIFTED files: 361 out of 990
```

Poți restrânge paginile țintă la una sau mai multe localizări furnizând una sau
mai multe căi, astfel:

```sh
npm run check:i18n -- content/zh
```

### Vizualizarea detaliilor modificărilor

Pentru orice pagină localizată care necesită actualizare, poți vedea detaliile
diferențelor față de pagina corespunzătoare în limba engleză folosind subcomanda
`diff` și indicând calea către pagina localizată. De exemplu:

```console
$ npm run check:i18n -- diff content/zh/docs/platforms/kubernetes
# content/zh/docs/platforms/kubernetes/_index.md: drifted from 1ca30b4d
diff --git a/content/en/docs/platforms/kubernetes/_index.md b/content/en/docs/platforms/kubernetes/_index.md
index 3592df5d..c7980653 100644
--- a/content/en/docs/platforms/kubernetes/_index.md
+++ b/content/en/docs/platforms/kubernetes/_index.md
@@ -1,7 +1,7 @@
 ---
 title: OpenTelemetry with Kubernetes
 linkTitle: Kubernetes
-weight: 11
+weight: 350
 description: Using OpenTelemetry with Kubernetes
 ---
```

### Adăugarea câmpului `default_lang_commit` la paginile noi

Pe măsură ce creezi pagini pentru localizarea ta, nu uita să adaugi
`default_lang_commit` în front matter-ul paginii, împreună cu un hash de commit
corespunzător din `main`.

Dacă traducerea paginii tale se bazează pe o pagină în limba engleză din `main`
la commit-ul `<HASH>`, rulează următoarea comandă pentru a adăuga automat
`default_lang_commit` în front matter-ul fișierului paginii, folosind commit-ul
`<HASH>`. Poți specifica `HEAD` ca argument dacă paginile tale sunt acum
sincronizate cu `main` la `HEAD`. De exemplu:

```sh
npm run check:i18n -- commit 1ca30b4d --new content/ja
npm run check:i18n -- commit HEAD --new content/zh/docs/concepts
```

Pentru a lista fișierele paginilor localizate cărora le lipsește cheia hash,
rulează:

```sh
npm run check:i18n -- --new
```

### Actualizarea câmpului `default_lang_commit` pentru paginile existente {#updating-default_lang_commit-for-existing-pages}

Pe măsură ce îți actualizezi paginile localizate pentru a reflecta modificările
aduse paginii corespunzătoare în limba engleză, asigură-te că actualizezi și
hash-ul commit-ului din `default_lang_commit`.

> [!TIP]
>
> Dacă pagina ta localizată corespunde acum versiunii în limba engleză din
> `main` la `HEAD`, rulează
> `npm run check:i18n -- commit HEAD <CALEA-CĂTRE-PAGINA-TA>`: hash-ul
> `default_lang_commit` este actualizat, iar
> [starea diferențelor](#drift-status) paginii este eliminată în cadrul
> aceleiași operațiuni de scriere.

Dacă ai actualizat în bloc toate paginile localizate care prezentau diferențe,
poți actualiza hash-ul commit-ului acestor fișiere folosind subcomanda `commit`,
urmată de un hash de commit sau de `HEAD` pentru a utiliza `main@HEAD`.

```sh
npm run check:i18n -- commit <HASH> <CALEA-CĂTRE-FIȘIERELE-ACTUALIZATE>
npm run check:i18n -- commit HEAD <CALEA-CĂTRE-FIȘIERELE-ACTUALIZATE>
```

> [!IMPORTANT]
>
> Atunci când folosești `HEAD` ca specificator de hash, scriptul va utiliza
> hash-ul branch-ului `main` la `HEAD` din **mediul tău local**. Asigură-te că
> ai rulat `fetch` și `pull` pentru `main`, dacă vrei ca `HEAD` să corespundă cu
> `main` de pe GitHub.

### Aplicarea de corecții paginilor localizate {#patched}

[Corecțiile de build](#keep-checks-green) necesită uneori editarea unei pagini
localizate fără sincronizarea acesteia cu versiunea sa în limba engleză: de
exemplu, repararea apelului unui shortcode după ce shortcode-ul comun s-a
modificat. Marchează fiecare pagină localizată corectată în acest mod ca
**patched**, indiferent dacă această corecție vizează una sau mai multe
localizări:

- Fă doar modificările necesare pentru aplicarea corecției — fără alte
  modificări în pagină.
- Adaugă comentariul YAML `# patched` la sfârșitul liniei `default_lang_commit`
  din pagină:

  ```yaml
  default_lang_commit: abc4567... # patched
  ```

Marcajul este rezervat exclusiv pentru astfel de corecții mecanice —
[modificările semantice](#semantic-changes) nu îl folosesc niciodată. Marcajul
indică echipei de localizare că pagina a fost corectată fără a fi sincronizată:
hash-ul continuă să indice ultimul punct de sincronizare. Marcajul este eliminat
la următoarea [actualizare](#updating-default_lang_commit-for-existing-pages) a
hash-ului paginii.

### Starea diferențelor {#drift-status}

Câmpul `drifted_from_default` din front matter marchează o pagină localizată ca
fiind diferită de original: pagina afișează un banner „învechit”, iar
verificatorul de link-uri o omite, astfel încât link-urile expirate din paginile
care diferă să nu ducă la eșecul CI. Verificatorul de link-uri nu așteaptă
prezența acestui câmp: copiile localizate ale paginilor în limba engleză
modificate de la ultima sincronizare a stării la nivelul întregului arbore sunt
de asemenea omise, ca
[diferențe în așteptare](/site/build/link-checking/#configuration).

[Rularea zilnică Housekeeping](/site/build/ci-workflows/#housekeeping) menține
câmpul sincronizat la nivelul întregului arbore; pull request-urile nu
actualizează starea paginilor pe care nu le modifică în alt mod. Fiecare pagină
pe care un pull request **o modifică** trebuie să rămână cu o stare a
diferențelor corectă, așa cum impune verificarea `I18N check`: fie sincronizezi
pagina cu pagina corespunzătoare în limba engleză și îi
[actualizezi referința](#updating-default_lang_commit-for-existing-pages) —
starea este eliminată în cadrul aceleiași operațiuni de scriere — fie
înregistrezi diferențele rămase cu `npm run fix:i18n:status -- <CĂI>`.
Referințele pot indica numai commit-uri din `main`, așa că o pagină sincronizată
cu modificări în limba engleză făcute în același pull request înregistrează
diferențele rămase până când acele modificări sunt integrate.

### Ajutor pentru script

Pentru mai multe detalii despre script, rulează `npm run check:i18n -- -h`.

## Localizări noi {#new-localizations}

Te interesează să începi o nouă localizare pentru site-ul OTel? Contactează
responsabilii proiectului pentru a-ți exprima interesul, de exemplu printr-o
discuție pe GitHub sau pe canalul Slack `#otel-docs-localization`. Această
secțiune explică pașii necesari pentru începerea unei noi localizări.

> [!NOTE]
>
> Nu trebuie să fii deja contribuitor la proiectul OpenTelemetry pentru a începe
> o nouă localizare. Totuși, nu poți fi adăugat ca membru al
> [organizației OpenTelemetry de pe GitHub](https://github.com/open-telemetry/)
> sau ca membru al grupului de aprobatori pentru localizarea ta până când nu
> îndeplinești cerințele pentru a deveni membru cu drepturi depline și aprobator,
> așa cum sunt descrise în
> [îndrumările privind statutul de membru][membership guidelines].
>
> Înainte de a obține statutul de aprobator, îți poți exprima aprobarea pentru un
> PR de localizare adăugând un comentariu „LGTM” (Looks Good To Me). În această
> etapă inițială, responsabilii proiectului vor trata revizuirile tale ca și cum
> ai fi deja aprobator.

[membership guidelines]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md

### 1. Formarea unei echipe de localizare {#team}

Crearea unei localizări înseamnă dezvoltarea unei comunități active și
solidare. Pentru a începe o nouă localizare pentru site-ul OpenTelemetry, ai
nevoie de:

1. Un **mentor de localizare** familiarizat cu limba ta, cum ar fi un
   [aprobator activ][active approver] al [Glosarului CNCF][CNCF Glossary] sau al
   [site-ului Kubernetes][Kubernetes website].
2. Cel puțin doi potențiali contribuitori.

[active approver]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[CNCF Glossary]: https://glossary.cncf.io/
[Kubernetes website]: https://github.com/kubernetes/website

### 2. Demararea localizării: crearea unui issue {#kickoff}

Cu o [echipă de localizare](#team) formată sau în curs de formare, creează un
issue cu lista de sarcini de mai jos:

1. Caută [codul ISO 639-1][ISO 639-1 code] oficial pentru limba pe care vrei să
   o adaugi. Ne vom referi la acest cod de limbă ca `LANG_ID` în restul acestei
   secțiuni. Dacă ai dubii cu privire la eticheta pe care să o folosești, în
   special când vine vorba de alegerea unei subregiuni, întreabă
   administratorii.

   [ISO 639-1 code]: https://en.wikipedia.org/wiki/ISO_639-1

2. Identifică identificatorii GitHub ai
   [mentorului și potențialilor contribuitori](#team).

3. Creează un [issue nou][new issue] care conține următoarea listă de sarcini în
   comentariul de deschidere:

   ```markdown
   - [ ] Language info:
     - ISO 639-1 language code: `LANG_ID`
     - Language name: ADD_NAME_HERE
   - [ ] Locale team info:
     - [ ] Locale mentor: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
     - [ ] Contributors: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
   - [ ] Read through
         [Localization](https://opentelemetry.io/docs/contributing/localization/)
         and all other pages in the Contributing section
   - [ ] Localize site homepage (only) to YOUR_LANGUAGE_NAME and submit a PR.
         For details, see
         [Localize the homepage](https://opentelemetry.io/docs/contributing/localization/#homepage).
   - [ ] OTel maintainers:
     - [ ] Update Hugo config for `LANG_ID`
     - [ ] Configure cSpell and other tooling support
     - [ ] Create an issue label for `lang:LANG_ID`
     - [ ] Create org-level group for `LANG_ID` approvers
     - [ ] Update components owners for `content/LANG_ID`
   - [ ] Create an issue to track the localization of the **glossary**. Add the
         issue number here. For details, see
         [Localize the glossary](https://opentelemetry.io/docs/contributing/localization/#glossary).
   ```

### 3. Localizarea paginii principale {#homepage}

[Trimite un pull request](../pull-requests/) cu traducerea
[paginii principale][homepage], și _nimic altceva_, în fișierul
`content/LANG_ID/_index.md`. Asigură-te că administratorii au permisiunile
necesare pentru a-ți edita pull request-ul, deoarece vor adăuga modificări
suplimentare la acesta, necesare pentru demararea proiectului tău de
localizare.

[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

După ce primul tău pull request este integrat, administratorii vor configura
eticheta de issue, grupul la nivel de organizație și responsabilii componentelor.

### 4. Localizarea glosarului {#glossary}

A doua pagină de localizat este [Glosarul](/docs/concepts/glossary/). Este o
pagină **critică** pentru cititorii localizării, deoarece definește termenii
cheie folosiți în observabilitate și în OpenTelemetry în particular. Acest lucru
este cu atât mai important dacă astfel de termeni nu există în limba ta.

Pentru îndrumare, vezi [înregistrarea video][ali-d-youtube] a prezentării
susținute de Ali Dowair la Write the Docs 2024: [The art of translation: How to
localize technical content][ali-dowair-2024].

[ali-dowair-2024]:
  https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair
[ali-d-youtube]: https://youtu.be/HY3LZOQqdig

### 5. Localizarea paginilor rămase din site, în etape mici {#rest}

Cu terminologia stabilită, poți localiza acum paginile rămase din site.

> [!IMPORTANT] Trimite pull request-uri mici <a id="small-prs"></a>
>
> Echipele de localizare ar trebui să-și trimită munca în **etape mici**. Adică,
> păstrează [pull request-urile][PRs] mici, de preferință limitate la unul sau
> câteva fișiere mici. Pull request-urile mai mici sunt mai ușor de revizuit și,
> prin urmare, sunt de obicei integrate mai rapid.

### OTel maintainer checklist

#### Hugo

Update Hugo config for `LANG_ID`. Add appropriate entries for `LANG_ID` under:

- `languages` in `config/_default/hugo.yaml`
- `module.mounts` via `config/_default/module-template.yaml`. At a minimum, add
  a single `source`-`target` entry for `content`. Consider adding entries for
  `en` fallback pages only once the locale has enough content.

#### Spelling

Look for [cSpell dictionaries][] available as NPM packages
[@cspell/dict-LANG_ID][]. If a dictionary isn't available for your dialect or
region, choose the closest region.

- **If a dictionary is available**:
  - Add the NPM package as a dev dependency, for example:
    `npm install --save-dev @cspell/dict-bn`.
  - In [`.cspell.yml`][], add the package's `cspell-ext.json` under `import:`,
    and add the dictionary's ID (for example `bn`, `es-es`, `pl_pl`) under
    `dictionaries:`.
- **If no dictionary is available** for the language, do not add an `import` for
  it. Add `content/LANG_ID` to the `ignorePaths` list in [`.cspell.yml`][] so
  cSpell does not try to spell-check that locale's Markdown as English.

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict
[`.cspell.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml

#### Word list

Create `.cspell/LANG_ID-words.txt` for every new locale (empty at first), even
when **Spelling** has no natural-language dictionary to add.

- In [`.cspell.yml`][], register the file and enable it:
  - Under `dictionaryDefinitions`, add an entry with `name` (for example
    `LANG_ID-words`) and `path` (for example `.cspell/LANG_ID-words.txt`).
  - Under `dictionaries`, add the same `name` value as in the step above (not
    the file path).

#### Other tooling support

- Prettier support: if `LANG_ID` isn't well supported by Prettier, add ignore
  rules to `.prettierignore`

## Approver and maintainer guidance

### Enabling auto-merge on locale-only PRs {#auto-merge}

Members of a locale's maintainers team can enable [GitHub auto-merge][] on a
locale-only PR by commenting `/auto-merge` (or `/auto-merge:enable`; use
`/auto-merge:disable` to turn it off). The directive must be on its own line,
with no leading text or whitespace, as the first or last non-blank line of the
comment. It may appear at most once. For example, you can write:

```text
LGTM
/auto-merge
```

This lets established localization teams land their own PRs without waiting on a
docs maintainer. GitHub, branch protection, and CODEOWNERS rules still gate the
merge: the PR only merges once all required reviews are in and checks pass.

An auto-merge comment is honored only when every changed file is owned by a
locale you maintain, so it can't be used to make changes to shared or English
content. For the eligibility rules and command details, see the [helper
README][].

[GitHub auto-merge]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[helper README]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge

### PRs should not span locales {#prs-should-not-span-locales}

As a general rule, a PR should not span locales, that is, it should change the
pages of at most one locale. The only exceptions are described in this section.

#### Semantic changes {#semantic-changes}

Approvers should ensure that [PRs][] making **semantic** changes to doc pages do
not span multiple locales. A semantic change is one that impacts the _meaning_
of the page content — what readers understand and act on. Code blocks, commands,
and configuration samples are part of that content: they aren't
[translated](#do-not), but edits to them are semantic changes all the same. Our
docs [localization process](.) ensures that locale approvers will, in time,
review the English-language edits to determine if the changes are appropriate
for their locale, and how best to incorporate them into their locale. If changes
are necessary, the locale approvers will make them via their own locale-specific
PRs.

> [!NOTE] Content-neutral maintenance
>
> The locale-span rule governs page **content**. Maintainers sometimes submit
> content-neutral changes that necessarily span locales: site-wide tooling,
> configuration, front-matter, or markup updates, including
> [drift-status](#drift-status) bookkeeping — the automated PRs and manual
> status-only edits alike. Such changes don't alter the meaning of localized
> pages.

#### Keeping the build and checks green {#keep-checks-green}

A PR that changes localized page **content** may span multiple locales only when
that is strictly required to keep the site build and its checks green:

- **Link fixes**: repairing link-check failures on localized pages after an
  English page is moved or deleted, or an external resource has moved. See
  [Link fixes and resource updates](#link-fixes-and-resource-updates).
- **Build fixes**: repairing site-build breakage on localized pages, for
  example, after a shared shortcode, include file, or data source changes. A
  page's [drift status](#drift-status) only shields it from link checking, not
  from the Hugo build.

In both cases, mark every localized page that you fix as [patched](#patched).

The check-green minimum applies to drift-status bookkeeping too: when a failing
check calls for refreshing `drifted_from_default` (see the deleted-page case
below), update only the pages that the failing check reports — the daily
[Housekeeping run](/site/build/ci-workflows/#housekeeping) completes the rest.
Status-only edits are [content-neutral maintenance](#semantic-changes).

Treat any other change to localized page content as a **semantic** change for
that locale. This includes targeted content additions to drifted pages, such as
adding a new glossary term.

#### Link fixes and resource updates {#link-fixes-and-resource-updates}

Changes to the English documentation can result in link-check failures for
non-English locales. This happens when documentation pages, or sections within
them, are moved or deleted; links to moved external resources can fail
similarly. A moved or deleted page's localized copies themselves don't need to
be touched: [drift tracking](#track-changes) flags them for their locale teams.
What may need fixing are the localized pages that **link** to such targets.
Proceed according to the fate of the link target:

- **A page was moved**:

  1. Ensure that the moved English page declares an [alias][aliases] for its old
     path. The alias keeps previously published links to the page working, but
     only for site visitors: aliases are published as server-side redirects, and
     the link checker resolves links against the built site's canonical page
     paths. Links to the old path therefore still need fixing.
  2. Update the link to the new path on each non-English page that fails link
     checking, and mark each edited page as [patched](#patched).
     ([Drifted](#drift-status) pages are skipped by the link checker, so this
     typically applies to in-sync pages.)

- **A section was moved**: aliases can't help in this case, since they redirect
  page paths, not fragments. If the section moved within its page, preserve its
  [heading ID](#headings) so that links to the section keep working. Otherwise,
  update links to the section on each page that fails link checking, and mark
  each edited localized page as [patched](#patched).

- **A page or section was deleted**: choosing a replacement or dropping the
  reference is a [semantic change](#semantic-changes) for each affected locale,
  so don't patch such links. Fixing the English pages that linked to the deleted
  target makes their localized copies drift; the link checker already skips such
  copies as [drift pending](#drift-status), and the daily Housekeeping run
  persists their status. If a localized page still fails link checking, refresh
  its [drift status](#drift-status) directly:
  `npm run fix:i18n:status -- <PATHS-TO-FAILING-LOCALIZED-PAGES>`.
  Reconciliation is left to each page's locale team. In the rare case where a
  failing link exists only in a localized page, coordinate a fix with its locale
  team.

- **An external resource was moved**, but is otherwise semantically unchanged
  (such as a relocated GitHub file): update the link on each page that fails
  link checking, marking each edited localized page as [patched](#patched).

In all cases, rerun `npm run check:links` and confirm that no link failures
remain.

[aliases]: https://gohugo.io/content-management/urls/#aliases
[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
[multilingual framework]: https://gohugo.io/content-management/multilingual/
