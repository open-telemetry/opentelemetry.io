---
title: Localizarea site-ului
description:
  Crearea și menținerea paginilor site-ului în localizări non englezești.
linkTitle: Localizare
weight: 25
cSpell:ignore: Dowair shortcodes
---

Website-ul OTel folosește [framework-ul multilingvist][multilingual framework] al lui Hugo pentru a
susține localizările paginilor. Engleza este limba implicită, având Engleză US
ca localizarea implicită. Un număr în creștere de alte localizări sunt
disponibile, cum se poate vedea în lista de limbi din bara de navigație din
antet.

## Îndrumări pentru traducere

Când traduceți pagini web din Engleză, recomandăm să urmezi îndrumările oferite
în această secțiune

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
- **Păstrați** _conținutul_, _înțelesul_, și _stilul_ textului original
- **Trimiteți schimbări _incrementale_** via [pull request-uri mici](#small-prs)
- **Întrebați** [maintainers][] dacă aveți dubii sau întrebări prin:
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
    În special, nu traduce `aliasuri`. Când ai dubii, întreabă maintainers.
  - [Linkuri](#links), asta include și [id-urile titlurilor](#headings) [^*]
  - Elemente Markdown marcate ca și `notranslate` (deobicei ca o clasă CSS), în
    special pentru [titluri](#headings)
- Create **copies of images and other assets**, unless you
  [localize text in them](#images)
- Add new or change:
  - **Content** that would be different from the originally intended meaning
  - Presentation **style**, including: _formatting_, _layout_, and _design_
    style (typography, letter case, and spacing for example).

[^*]: For a possible exception, see [Links](#links).

[`MARKDOWN` linter]: ../pr-checks/#markdown-linter

</div>

#### Utilizarea instrumentelor de inteligență artificială {#ai-tools}

Dacă folosești instrumente de inteligență artificială generativă (precum
ChatGPT, Gemini, sau similare) pentru a te ajuta cu traducerea, trebuie să
respecți [Politica OpenTelemetry privind contribuția folosind IA
generativ][genai-policy] și [Politica Linux Foundation privind contribuția
folosind IA generativ][lf-ai-policy]. În mod special:

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
<https://en.wikipedia.org>) care au o versiune specifică a localizării tale. Des
acest lucru implică schimbarea `en`-ului din URL la codul de limbă al
localizării tale.

> [!NOTE]
>
> Repertoriul Website-ului OTel are un hook personalizat de randare pe care Hugo
> îl folosește să transforme căi absolute de link care fac referire la pagini de
> documentație. **Link-uri de forma `/docs/some-page` sunt făcute să fie
> specifice localizării** prin prefixarea căii cu codul de limbă atunci când se
> randează link-ul. Spre exemplu, calea precedentă ar deveni
> `/ja/docs/some-page` când este randată dintr-o pagină în Japoneză.

### Etichete pentru definițiile link-urilor {#link-labels}

Autorii de traduceri regionale pot sau nu să aleagă să traducă
[etichete][labels] pentru [definițiile link-urilor][link definitions] din
Markdown. Dacă alegi să păstrezi eticheta în Engleză, atunci urmărește ghidul
dat în această secțiune.

Ia în considerare următorul exemplu de Markdown:

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

Acest ar fi tradus în Franceză ca și:

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
    partajate între traducerile din site. Astfel că, Hugo va produce un _singur_
    fișier de imagine și-l va împărții între traduceri. Pentru detalii, vezi
    [Page bundles][].
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
> [includeri de fișiere](#includes) ca un mijloc de partajare a conținutului
> între pagini.

Unele dintre shortcode-urile de bază conțin text în limba Engleză pe care s-ar
putea să fie nevoie să-l traduci. -- acest lucru este în mod special adevărat
pentru acele conținute în [layouts/_shortcodes/docs][].

Dacă ai nevoie să creezi o versiune tradusă a unui shortcode, pune-l în
`layouts/_shortcodes/xx`, unde `xx` este codul de limbă al traducerii tale. De
acolo, folosește aceeași cale relativă ca și shortcode-ul original de bază.

[layouts/_shortcodes/docs]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/_shortcodes/docs

## Keeping track of localized-page drift {#track-changes}

One of the main challenges of maintaining localized pages, is identifying when
the corresponding English language pages have been updated. This section
explains how we handle this.

### The `default_lang_commit` front-matter field

When a localized page is written, such as `content/zh/<some-path>/page.md`, this
translation is based on a specific [`main` branch commit][main] of the
corresponding English language version of the page at
`content/en/<some-path>/page.md`. In this repository, every localized page
identifies the English page commit in the localized page's front matter as
follows:

```markdown
---
title: Your localized page title
# ...
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
---
```

The front matter above would be in `content/zh/<some-path>/page.md`. The commit
hash would correspond to the latest commit of `content/en/<some-path>/page.md`
from the `main` branch.

### Tracking changes to English pages

As updates are made to English language pages, you can keep track of the
corresponding localized pages that need updating by running the following
command:

```console
$ npm run check:i18n
1       1       content/en/docs/platforms/kubernetes/_index.md - content/zh/docs/platforms/kubernetes/_index.md
...
```

You can restrict the target pages to one or more localizations by providing
path(s) like this:

```sh
npm run check:i18n -- content/zh
```

### Viewing change details

For any given localized pages that need updating, you can see the diff details
of the corresponding English language pages by using the `-d` flag and providing
the paths to your localized pages, or omit the paths to see all. For example:

```console
$ npm run check:i18n -- -d content/zh/docs/platforms/kubernetes
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

### Adding `default_lang_commit` to new pages

As you create pages for your localization, remember to add `default_lang_commit`
to the page front matter along with an appropriate commit hash from `main`.

If your page translation is based on an English page in `main` at `<hash>`, then
run the following command to automatically add `default_lang_commit` to your
page file's front matter using the commit `<hash>`. You can specify `HEAD` as an
argument if your pages are now synced with `main` at `HEAD`. For example:

```sh
npm run check:i18n -- -n -c 1ca30b4d content/ja
npm run check:i18n -- -n -c HEAD content/zh/docs/concepts
```

To list localization page files with missing hash keys, run:

```sh
npm run check:i18n -- -n
```

### Updating `default_lang_commit` for existing pages

As you update your localized pages to match changes made to the corresponding
English language page, ensure that you also update the `default_lang_commit`
commit hash.

> [!TIP]
>
> If your localized page now corresponds to the English language version in
> `main` at `HEAD`, then erase the commit hash value in the front matter, and
> run the **add** command given in the previous section to automatically refresh
> the `default_lang_commit` field value.

If you have batch updated all of your localization pages that had drifted, you
can update the commit hash of these files using the `-c` flag followed by a
commit hash or 'HEAD' to use `main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

> [!IMPORTANT]
>
> When you use `HEAD` as a hash specifier, the script will use the hash of
> `main` at HEAD in your **local environment**. Make sure that you fetch and
> pull `main`, if you want HEAD to correspond to `main` in GitHub.

### Drift status

Run `npm run fix:i18n:status` to set the `drifted_from_default` front-matter
field on those target localization pages that have drifted. This field displays
an "outdated" banner at the top of the page, and causes the link checker to skip
the page, so that stale links on drifted pages don't fail CI.

### Script help

For more details about the script, run `npm run check:i18n -- -h`.

## New localizations

Interested in starting a new localization for the OTel website? Reach out to
maintainers to express your interest, for example through a GitHub discussion or
via the Slack `#otel-docs-localization` channel. This section explains the steps
involved in starting a new localization.

> [!NOTE]
>
> You don't have to be an existing contributor to the OpenTelemetry project to
> start a new localization. However, you cannot be added as a member of the
> [OpenTelemetry GitHub organization](https://github.com/open-telemetry/) or as
> a member of the approvers group for your localization until you satisfy the
> requirements for becoming an established member and approver as outlined in
> the [membership guidelines][].
>
> Before you earn approver status, you can indicate your approval of a
> localization PR by adding an "LGTM" (Looks Good To Me) comment. During this
> startup phase, maintainers will treat your reviews as if you are an approver
> already.

[membership guidelines]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md

### 1. Assemble a localization team {#team}

Creating a localization is about growing an active and supportive community. To
start a new localization for the OpenTelemetry website you need:

1. A **localization mentor** who is familiar with your language, such as an
   [active approver][] of the [CNCF Glossary][] or the [Kubernetes website][].
2. At least two potential contributors.

[active approver]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[CNCF Glossary]: https://glossary.cncf.io/
[Kubernetes website]: https://github.com/kubernetes/website

### 2. Localization kickoff: create an issue {#kickoff}

With a [localization team](#team) in place or coming together, create an issue
with the task list given below:

1. Look up the official [ISO 639-1 code][] for the language you want to add.
   We'll refer to this language code as `LANG_ID` in the remainder of this
   section. If you have doubts about which tag to use, especially when it comes
   to choosing a subregion, ask maintainers.

   [ISO 639-1 code]: https://en.wikipedia.org/wiki/ISO_639-1

2. Identify the GitHub handles of the
   [mentor and potential contributors](#team).

3. Create a [new issue][] containing the following task list in the opening
   comment:

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

### 3. Localize the homepage {#homepage}

[Submit a pull request](../pull-requests/) with a translation of the website
[homepage][], and _nothing else_, in the file `content/LANG_ID/_index.md`.
Ensure that maintainers have the necessary permissions to edit your PR, since
they will add additional changes to your PR that are required to get your
localization project started.

[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

After your first PR is merged, maintainers will set up the issue label, the
org-level group and the component owners.

### 4. Localize the glossary {#glossary}

The second page to localize is the [Glossary](/docs/concepts/glossary/). This is
a **critical** page for localized readers, since it defines the key terms used
in observability and OpenTelemetry in particular. This is especially critical if
no such terms exist in your language.

For guidance, see the [video][ali-d-youtube] of Ali Dowair's talk at Write the
Docs 2024: [The art of translation: How to localize technical
content][ali-dowair-2024].

[ali-dowair-2024]:
  https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair
[ali-d-youtube]: https://youtu.be/HY3LZOQqdig

### 5. Localize remaining site pages in small increments {#rest}

With terminology established, you can now localize the remaining site pages.

> [!IMPORTANT] Submit small PRs <a id="small-prs"></a>
>
> Localization teams should submit their work in **small increments**. That is,
> keep [PRs][] small, preferably limited to one or a few small files. Smaller
> PRs are easier to review and so typically get merged more quickly.

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

### PRs with semantic changes should not span locales {#prs-should-not-span-locales}

Approvers should ensure that [PRs][] making **semantic** changes to doc pages do
not span multiple locales. A semantic change is one that impacts the _meaning_
of the page content. Our docs [localization process](.) ensures that locale
approvers will, in time, review the English-language edits to determine if the
changes are appropriate for their locale, and how best to incorporate them into
their locale. If changes are necessary, the locale approvers will make them via
their own locale-specific PRs.

### Purely editorial changes across locales are OK {#patch-locale-links}

**Purely editorial** page updates are changes that **do not** affect the
existing content and can span multiple locales. These include:

- **Link maintenance**: Fixing broken link paths when pages are moved or
  deleted.
- **Resource updates**: Updating links to moved external resources.
- **Targeted content additions**: Adding specific new definitions or sections to
  files that have drifted, when updating the entire file isn't feasible.

#### Link fixes and resource updates {#link-fixes-and-resource-updates}

For example, sometimes changes to English language documentation can result in
link-check failures for non-English locales. This happens when documentation
pages are moved or deleted.

In such situations, make the following updates to each non-English page that has
a path that fails link checking (drifted pages are skipped by the link checker,
so this typically applies to in-sync pages):

- Update the link reference to the new page path.
- Add the `# patched` YAML comment at the end of the line for the
  `default_lang_commit` front matter line.
- Make no other changes to the file.
- Rerun `npm run check:links` and ensure that no link failures remain.

When an _external link_ to a **moved** (but otherwise semantically
**unchanged**) resource (such as a GitHub file) results in a link-check failure,
consider:

- Removing the broken link from the refcache
- Updating the link across all locales using the method described earlier in
  this section.

#### Targeted content additions to drifted files {#targeted-content-additions}

When adding specific new content to a localized file that has drifted from the
English version, you may choose to make a targeted update rather than updating
the entire file. For example, when a new glossary term such as "cardinality" is
added to the English glossary, you can add just that term to the localized
glossary without addressing other drifted content.

Here's an example of the workflow for this targeted update:

- Add only the "cardinality" definition block to the localized glossary file
- Update the front matter by adding `# patched` as a comment at the end of the
  `default_lang_commit` line
- Leave all other existing content unchanged
- In the PR description, clearly document:
  - The specific content added ("cardinality" definition)
  - That the file remains drifted for other content
  - The rationale for the targeted update (e.g., "Providing critical new
    terminology to localized readers without requiring full file
    synchronization")

This approach enables incremental improvements to localized content while
maintaining awareness that the file still requires future attention for complete
synchronization with the English version.

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
