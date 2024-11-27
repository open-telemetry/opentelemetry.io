---
title: Blog
menu: { main: { weight: 50 } }
redirects:
  # Every January, update the year number in the paths below
  - { from: '', to: '2024/ 302!' }
  # Workaround to https://github.com/open-telemetry/opentelemetry.io/issues/4440:
  - { from: 'index.xml', to: '2024/index.xml 302!' }
outputs: [HTML, RSS]
htmltest:
  # 2024-11-07 DO NOT COPY the following IgnoreDirs to non-en pages because handles all locales.
  IgnoreDirs:
    # Ignore blog index pages for all locales and in all blog sections (top-level and years)
    - ^(../)?blog/(\d+/)?page/\d+
---
