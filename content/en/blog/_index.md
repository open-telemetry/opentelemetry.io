---
title: Blog
menu: { main: { weight: 50 } }
redirects: [{ from: '', to: '2024/ 301!' }]
outputs: [HTML, RSS]
htmltest:
  IgnoreDirs:
    # 2024-11-03 The following entry is for `en` pages only. Other locales do
    # not currently require it.
    - ^blog/(\d+/)?page/\d+
---
