---
title: Blog
menu: { main: { weight: 50 } }
redirects:
  # Every January, update the year number in the paths below
  - { from: '', to: '2024/ 301!' }
  # Workaround to https://github.com/open-telemetry/opentelemetry.io/issues/4440:
  - { from: 'index.xml', to: '2024/index.xml 301!' }
outputs: [HTML, RSS]
htmltest:
  IgnoreDirs:
    # 2024-11-03 The following entry is for `en` pages only. Other locales do
    # not currently require it.
    - ^blog/(\d+/)?page/\d+
---
