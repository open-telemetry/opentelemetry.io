---
title: {{ replaceRE "[-_]" " " .Name | title }}
linkTitle: ADD A SHORT TITLE HERE # TODO: add short title or remove this line
date: {{ dateFormat "2006-01-02" .Date }}
author: >- # If you have only one author, then add the single name on this line in quotes.
  [Author1 Name](https://github.com/author1_GH_ID),
  ...
  [AuthorX Name](https://github.com/authorX_GH_ID)
draft: true # TODO: remove this line once your post is ready to be published
---

## Top-level heading

Top-level headings start at **level 2**, as shown above.

## Paragraphs

Wrap paragraph text at 80 characters, this helps make git diffs (which is line
based) more useful. If you don't want to bother with that, then just run the
markdown formatter (see below).

## Markdown formatter

Before submitting a new commit run the Prettier command over your file:

```console
$ npx prettier --write content/en/{{ .File.Path }}
```

Happy writing!
