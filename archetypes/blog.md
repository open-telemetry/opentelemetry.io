---
title: {{ replaceRE "[-_]" " " .Name | title }}
linkTitle: ADD A SHORT TITLE HERE # Mandatory, make sure that your short title.
date: {{ dateFormat "2006-01-02" .Date }} # Put the current date, we will keep the date updated until your PR is merged
author: >- # If you have only one author, then add the single name on this line in quotes.
  [Author1 Name](https://github.com/author1_GH_ID) (Organization Name 1),
  ...
  [AuthorX Name](https://github.com/authorX_GH_ID) (Organization Name X)
draft: true # TODO: remove this line once your post is ready to be published
# canonical_url: http://somewhere.else/ # TODO: if this blog post has been posted somewhere else already, uncomment & provide the canonical URL here.
body_class: otel-with-contributions-from # TODO: remove this line if there are no secondary contributing authors
---

<!-- If your post doesn't have secondary authors, then delete the following paragraph: -->

With contributions from secondary-author-name-1, ..., and secondary-author-n.

## Top-level heading

Top-level headings start at **level 2**. This means, that your post should not include `# headings` for top-level headings but `## headings` instead.

## Paragraphs

Wrap paragraph text at 80 characters, this helps make git diffs (which is line
based) more useful. If you don't want to bother with that, then just run the
markdown formatter (see below).

## Images

If you use images, make sure that your blog post is located in it's own
directory. Put the images into the same directory.

If you have an image stored at `content/en/{{ .File.Dir }}imagename.png`, you
can reference them like the following:

![Provide a good image description for improved accessibility](imagename.png)

## Markdown formatter

Before submitting a new commit run the formatter over your file:

```sh
npm run format
```

Happy writing!

**Note:** If you view this page with the GitHub file viewer, you can safely ignore the `Error in user YAML` at the top of this page.

