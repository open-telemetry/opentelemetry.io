---
title: Site localization
description:
  Guidance on creating and maintaining site page in non-English localizations.
linkTitle: Localization
weight: 20
---

{{% pageinfo color="warning" %}}

🚧 This DRAFT page is under active development. 🚧

{{% /pageinfo %}}

This website uses Hugo's [multilingual framework] to support page localizations.
English is the default language, with US English as the default (implicit) localization.
A growing number of other localizations are supported, as can be seen from the languages
dropdown menu in the top nav.

## Keeping track of localized page drift {#track-changes}

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
...

default_lang_commit: <commit-hash-of-main-for-default-language-page>
```

The front matter above would be in `content/zh/<some-path>/page.md`. The commit
would correspond to the latest commit of `content/en/<some-path>/page.md` in
`main`.

### Tracking changes to English pages

As updates are made to English language pages, you can keep track of the
corresponding localized pages that need updating by running the following
command:

```console
$ npm run check:i18n
1       1       content/en/docs/kubernetes/_index.md - content/zh/docs/kubernetes/_index.md
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
$ npm run check:i18n -- -d content/zh/docs/kubernetes
diff --git a/content/en/docs/kubernetes/_index.md b/content/en/docs/kubernetes/_index.md
index 3592df5d..c7980653 100644
--- a/content/en/docs/kubernetes/_index.md
+++ b/content/en/docs/kubernetes/_index.md
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

{{% alert title="Tip" %}}

If your localized page now corresponds to the English language version in `main`
at `HEAD`, then erase the commit hash value in the front matter, and run the
**add** command given in the previous section to automatically refresh the
`default_lang_commit` field value.

{{% /alert %}}

If you have batch updated all of your localization pages that had drifted, you
can update the commit hash of these files using the `-u` flag followed by a
commit hash or 'HEAD' to use `main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

{{% alert title="Important" %}}

When you use `HEAD` as a hash specifier, the script will use the hash of `main`
at HEAD in your **local environment**. Make sure that you fetch and pull `main`,
if you want HEAD to correspond to `main` in GitHub.

{{% /alert %}}

### Script help

For more details about the script, run `npm run check:i18n -- -h`.

## New localizations

(Section To Be Completed soon with information about how to propose a new
localization.)

<!--

cSpell:ignore: CODEOWNERSHIP Comms

* Our website supports multiple languages already, so the translated content should live under main/content/<two_letter_code>
* Our point of reference is how kubernetes is doing their localization, see https://github.com/kubernetes/website
* We need at least 2 ppl owning that content, so that changes can be approved (CODEOWNERSHIP will help with that)
* We can start with the translation been hidden until we reach a point where enough material is translated to go live (with maybe some blog post & announcements around it)
* (Please anticipate that this is guidance on not a fixed set of rules)

As stated above this project requires a set of individuals that are happy to take on ownership for their language and work with SIG Comms on implementing this. So any discussion on this page "how to do it" needs to be preceded by a "I volunteer to co-own `<language>`"

-->

[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[multilingual framework]: https://gohugo.io/content-management/multilingual/
