---
title: Localizarea site-ului
description:
  Crearea și menținerea paginilor site-ului în localizări non englezești.
linkTitle: Localizare
weight: 25
default_lang_commit: cd6a7aa0e28ff8eb622e9fa0c9e9a40f78c9c777
cSpell:ignore: Dowair shortcodes
---

Website-ul OTel folosește [framework-ul multilingvist][multilingual framework]
al lui Hugo pentru a susține localizările paginilor. Engleza este limba
implicită, având engleză US ca localizare standard. Numărul localizărilor
disponibile este în continuă creștere, cum se poate vedea în lista de limbi din
bara de navigație din antet.

## Îndrumări pentru traducere {#translation-guidance}

Când traduci pagini web din engleză, recomandăm să urmezi îndrumările oferite în
această secțiune.

### Sumar {#summary}

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
- **Întreabă** [administratori][maintainers] dacă ai dubii sau întrebări prin:
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
- Creează **copii de imagini și alte fișiere**, cu excepția cazului în care
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
ChatGPT, Gemini, sau altele similare) pentru a te ajuta cu traducerea, trebuie
să respecți [Politica OpenTelemetry privind contribuția folosind IA
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
  al titlului original în engleză.

[Heading ID syntax]:
  https://github.com/yuin/goldmark/blob/master/README.md#headings

### Links {#links}

**Nu** traduce referințele linkurilor. Acest lucru se aplică la linkuri externe,
căi către pagini ale website-ului și resurse locale din secțiuni cum ar fi
[imagini și alte resurse](#images).

Singura excepție este pentru linkuri către pagini externe (precum
<https://en.wikipedia.org>) care au o versiune specifică a localizării tale. În
mod frecvent acest lucru implică schimbarea `en`-ului din URL la codul de limbă
al localizării tale.

> [!NOTE]
>
> Repertoriul Website-ului OTel are un hook personalizat de randare pe care Hugo
> îl folosește să transforme căi absolute de link care fac referire la pagini de
> documentație. **Linkuri de forma `/docs/some-page` sunt făcute să fie
> specifice localizării** prin prefixarea căii cu codul de limbă atunci când se
> randează linkul. Spre exemplu, calea precedentă ar deveni `/ja/docs/some-page`
> când este randată dintr-o pagină în japoneză.

### Etichete pentru definițiile linkurilor {#link-labels}

Autorii de traduceri regionale pot sau nu să aleagă să traducă
[etichete][labels] pentru [definițiile linkurilor][link definitions] din
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
  care nu reprezintă conținut cu excepția cazului în care traduci textul din
  fișier.
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

### Câmpul `default_lang_commit` din front matter {#the-default_lang_commit-front-matter-field}

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

### Urmărirea modificărilor aduse paginilor în limba engleză {#tracking-changes-to-english-pages}

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

### Vizualizarea detaliilor modificărilor {#viewing-change-details}

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

### Adăugarea câmpului `default_lang_commit` la paginile noi {#adding-default_lang_commit-to-new-pages}

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
verificatorul de linkuri o omite, astfel încât linkurile expirate din paginile
care diferă să nu ducă la eșecul CI. Verificatorul de linkuri nu așteaptă
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

### Ajutor pentru script {#script-help}

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
> îndeplinești cerințele pentru a deveni membru cu drepturi depline și
> aprobator, așa cum sunt descrise în [îndrumările privind statutul de
> membru][membership guidelines].
>
> Înainte de a obține statutul de aprobator, îți poți exprima aprobarea pentru
> un PR de localizare adăugând un comentariu „LGTM” (Looks Good To Me). În
> această etapă inițială, responsabilii proiectului vor trata revizuirile tale
> ca și cum ai fi deja aprobator.

[membership guidelines]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md

### 1. Formarea unei echipe de localizare {#team}

Crearea unei localizări înseamnă dezvoltarea unei comunități active și solidare.
Pentru a începe o nouă localizare pentru site-ul OpenTelemetry, ai nevoie de:

1. Un **mentor de localizare** familiarizat cu limba ta, cum ar fi un [aprobator
   activ][active approver] al [Glosarului CNCF][CNCF Glossary] sau al [site-ului
   Kubernetes][Kubernetes website].
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

[Trimite un pull request](../pull-requests/) cu traducerea [paginii
principale][homepage], și _nimic altceva_, în fișierul
`content/LANG_ID/_index.md`. Asigură-te că administratorii au permisiunile
necesare pentru a-ți edita pull request-ul, deoarece vor adăuga modificări
suplimentare la acesta, necesare pentru demararea proiectului tău de localizare.

[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

După ce primul tău pull request este integrat, administratorii vor configura
eticheta de issue, grupul la nivel de organizație și responsabilii
componentelor.

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

### Listă de verificare pentru administratorii OTel {#otel-maintainer-checklist}

#### Hugo {#hugo}

Actualizează configurația Hugo pentru `LANG_ID`. Adaugă intrările
corespunzătoare pentru `LANG_ID` în:

- `languages` din `config/_default/hugo.yaml`
- `module.mounts` prin `config/_default/module-template.yaml`. Adaugă cel puțin
  o singură intrare `source`-`target` pentru `content`. Ia în considerare
  adăugarea de intrări pentru paginile de rezervă în `en` doar după ce
  localizarea are suficient conținut.

#### Ortografie {#spelling}

Caută [dicționare cSpell][cSpell dictionaries] disponibile ca pachete NPM
[@cspell/dict-LANG_ID][]. Dacă nu este disponibil un dicționar pentru dialectul
sau regiunea ta, alege regiunea cea mai apropiată.

- **Dacă este disponibil un dicționar**:

  - Adaugă pachetul NPM ca dependență de dezvoltare, de exemplu:
    `npm install --save-dev @cspell/dict-bn`.
  - În [`.cspell.yml`][], adaugă fișierul `cspell-ext.json` al pachetului la
    `import:` și adaugă ID-ul dicționarului (de exemplu `bn`, `es-es`, `pl_pl`)
    la `dictionaries:`.

- **Dacă nu este disponibil niciun dicționar** pentru limba respectivă, nu
  adăuga un `import` pentru acesta. Adaugă `content/LANG_ID` în lista
  `ignorePaths` din [`.cspell.yml`][], astfel încât cSpell să nu încerce să
  verifice ortografia fișierelor Markdown ale acelei localizări ca și cum ar fi
  în engleză.

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict
[`.cspell.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml

#### Listă de cuvinte {#word-list}

Creează `.cspell/LANG_ID-words.txt` pentru fiecare localizare nouă (gol la
început), chiar și atunci când la pasul **Ortografie** nu există un dicționar de
limbă naturală de adăugat.

- În [`.cspell.yml`][], înregistrează fișierul și activează-l:

  - La `dictionaryDefinitions`, adaugă o intrare cu `name` (de exemplu
    `LANG_ID-words`) și `path` (de exemplu `.cspell/LANG_ID-words.txt`).
  - La `dictionaries`, adaugă aceeași valoare `name` ca la pasul anterior (nu
    calea fișierului).

#### Suport pentru alte instrumente {#other-tooling-support}

- Suport Prettier: dacă `LANG_ID` nu este bine susținut de Prettier, adaugă
  reguli de ignorare în `.prettierignore`.

## Îndrumări pentru aprobatori și administratori {#approver-and-maintainer-guidance}

### Activarea auto-merge pentru PR-uri specifice unei localizări {#auto-merge}

Membrii echipei de administratori a unei localizări pot activa [auto-merge pe
GitHub][GitHub auto-merge] pentru un PR specific acelei localizări, comentând
`/auto-merge` (sau `/auto-merge:enable`; folosește `/auto-merge:disable` pentru
a-l dezactiva). Directiva trebuie să fie pe o linie separată, fără text sau
spații înaintea ei, ca prima sau ultima linie care nu este goală din comentariu.
Poate apărea cel mult o dată. De exemplu, poți scrie:

```text
LGTM
/auto-merge
```

Acest lucru permite echipelor de localizare deja stabilite să își integreze
propriile PR-uri fără să aștepte un administrator al documentației. Regulile
GitHub, cele de protecție a branch-ului și CODEOWNERS controlează în continuare
integrarea: PR-ul este integrat doar după ce sunt obținute toate revizuirile
necesare și toate verificările sunt finalizate cu succes.

Un comentariu auto-merge este luat în considerare doar atunci când fiecare
fișier modificat aparține unei localizări pe care o administrezi, așa că nu
poate fi folosit pentru a modifica conținutul partajat sau conținutul în limba
engleză. Pentru regulile de eligibilitate și detaliile comenzii, vezi [README-ul
de ajutor][helper README].

[GitHub auto-merge]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[helper README]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge

### PR-urile nu ar trebui să includă mai multe localizări {#prs-should-not-span-locales}

Ca regulă generală, un PR nu ar trebui să includă mai multe localizări, adică ar
trebui să modifice paginile a cel mult unei localizări. Singurele excepții sunt
descrise în această secțiune.

#### Modificări semantice {#semantic-changes}

Aprobatorii ar trebui să se asigure că [PR-urile][PRs] care aduc modificări
**semantice** paginilor de documentație nu includ mai multe localizări. O
modificare semantică este una care afectează _înțelesul_ conținutului paginii —
ceea ce cititorii înțeleg și pun în practică. Blocurile de cod, comenzile și
exemplele de configurare fac parte din acest conținut: acestea nu sunt
[traduse](#do-not), dar modificările aduse lor sunt, în aceeași măsură,
modificări semantice. [Procesul de localizare](.) al documentației noastre
asigură că aprobatorii localizărilor vor revizui, în timp, modificările în limba
engleză pentru a stabili dacă acestea sunt potrivite pentru localizarea lor și
cum să le încorporeze cel mai bine în aceasta. Dacă sunt necesare modificări,
aprobatorii localizării le vor face prin propriile PR-uri specifice localizării.

> [!NOTE] Mentenanță neutră față de conținut
>
> Regula privind includerea mai multor localizări se aplică **conținutului**
> paginilor. Administratorii trimit uneori modificări neutre față de conținut
> care includ în mod necesar mai multe localizări: actualizări la nivelul
> întregului site ale instrumentelor, configurației, front matter-ului sau
> marcajului, inclusiv evidența [stării diferențelor](#drift-status) — atât
> PR-urile automate, cât și modificările manuale care vizează doar starea.
> Astfel de modificări nu schimbă înțelesul paginilor localizate.

#### Menținerea build-ului funcțional {#keep-checks-green}

Un PR care modifică **conținutul** paginilor localizate poate include mai multe
localizări doar atunci când acest lucru este strict necesar pentru a menține
build-ul site-ului funcțional. Astfel de **corecții de build** remediază
defecțiunile build-ului site-ului în paginile localizate, de exemplu, după
modificarea unui shortcode comun, a unui fișier inclus sau a unei surse de date.
[Starea diferențelor](#drift-status) unei pagini o protejează doar de
verificarea linkurilor, nu și de build-ul Hugo. Marchează fiecare pagină
localizată pe care o corectezi ca [patched](#patched).

Eșecurile verificării linkurilor în paginile localizate **nu** constituie un
astfel de caz; pentru modul de rezolvare a acestora, vezi
[Corectarea linkurilor și actualizarea resurselor](#link-fixes-and-resource-updates).

Aceeași regulă a corecției minime se aplică și evidenței stării diferențelor:
când o verificare eșuată impune actualizarea câmpului `drifted_from_default`,
actualizează numai paginile raportate de verificarea eșuată;
[rularea zilnică Housekeeping](/site/build/ci-workflows/#housekeeping) le
completează pe celelalte. Modificările care vizează doar starea sunt
[mentenanță neutră față de conținut](#semantic-changes).

Tratează orice altă modificare a conținutului paginilor localizate ca pe o
modificare **semantică** pentru acea localizare. Aceasta include adăugările
punctuale de conținut în paginile care diferă, cum ar fi adăugarea unui nou
termen în glosar.

#### Corectarea linkurilor și actualizarea resurselor {#link-fixes-and-resource-updates}

Modificările aduse documentației în limba engleză pot duce la eșecuri ale
verificării linkurilor pentru localizările în alte limbi decât engleza. Acest
lucru se întâmplă atunci când paginile de documentație sau secțiuni din acestea
sunt mutate sau șterse; linkurile către resurse externe mutate pot eșua în mod
similar. Corectează astfel de eșecuri numai în paginile în limba engleză; **nu
edita niciodată conținutul paginilor localizate pentru a corecta linkurile**.
[Urmărirea diferențelor](#track-changes) semnalează echipelor fiecărei
localizări copiile localizate învechite, iar reconcilierea, inclusiv corectarea
linkurilor, este lăsată în sarcina fiecărei echipe.

Mai întâi, limitează efectele în partea în limba engleză prin corectarea
linkurilor care eșuează. Unele situații ale resurselor țintă permit măsuri
suplimentare:

- **O pagină a fost mutată**: asigură-te că pagina mutată în limba engleză
  declară un [alias][aliases] pentru calea sa veche. Aliasul menține funcționale
  linkurile publicate anterior către pagină, dar numai pentru vizitatorii
  site-ului: aliasurile sunt publicate ca redirecționări pe server, iar
  verificatorul de linkuri rezolvă linkurile în raport cu căile canonice ale
  paginilor din site-ul generat. Prin urmare, linkurile către calea veche
  trebuie totuși corectate în paginile în limba engleză.
- **O secțiune a fost mutată în cadrul paginii sale**: păstrează-i
  [ID-ul titlului](#headings), astfel încât linkurile către secțiune să rămână
  funcționale. Aliasurile nu sunt de ajutor în acest caz: ele redirecționează
  căile paginilor, nu fragmentele.

Celelalte situații nu permit astfel de măsuri: o secțiune mutată pe o altă
pagină, o resursă externă mutată sau o țintă ștearsă. Corectarea linkurilor în
limba engleză reprezintă întreaga corecție necesară pe partea în limba engleză;
pentru o țintă ștearsă, aceasta înseamnă alegerea unei ținte înlocuitoare sau
eliminarea referinței din fiecare pagină care conține un link către aceasta.

Apoi, lasă gestionarea diferențelor să acopere paginile localizate: corectarea
paginilor în limba engleză face ca respectivele copii localizate să fie
[marcate ca diferite](#drift-status), iar verificatorul de linkuri omite copiile
marcate astfel. Dacă o pagină localizată continuă să eșueze la verificarea
linkurilor, actualizează-i direct starea diferențelor:

```sh
npm run fix:i18n:status -- PATHS_TO_FAILING_LOCALIZED_PAGES
```

În cazul rar în care un link care eșuează există numai într-o pagină localizată,
raportează-l și coordonează corectarea acestuia cu echipa localizării
respective.

În final, rulează din nou `npm run check:links` și confirmă că nu mai există
eșecuri ale verificării linkurilor.

[aliases]: https://gohugo.io/content-management/urls/#aliases
[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
[multilingual framework]: https://gohugo.io/content-management/multilingual/
