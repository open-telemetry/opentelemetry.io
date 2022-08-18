---
title: {{ replaceRE "[-_]" " " .Name | title }}
linkTitle: ADD A SHORT TITLE HERE # TODO: add short title or remove this line
date: {{ dateFormat "2006-01-02" .Date }}
author: [Your Name](https://github.com/yourhandle) # TODO: add author names
draft: true # TODO: remove this line once your post is ready to be published
# TODO: run the following command before submitting
#   npx prettier --write content/en/{{ .File.Path }}
---

## Top-level heading

Top-level headings start at level 2, as shown above.

## Paragraphs

Wrap paragraph text at 80 characters, this helps make git diffs (which is line
based) more useful.

## Prettier

Before submitting a new commit run Prettier command over your file:

```shell
$ npx prettier --write content/en/blog/2022/file-name-for-your-blog-post.md
```

Happy writing!
