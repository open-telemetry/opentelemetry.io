---
title: Блог
menu: { main: { weight: 50 } }
outputs: [HTML, RSS]
htmltest:
  # 2024-11-07 DO NOT COPY the following IgnoreDirs to non-en pages because it handles all locales.
  IgnoreDirs:
    # Ignore blog index pages for all locales and in all blog sections (top-level and years)
    - ^(../)?blog/(\d+/)?page/\d+
    # Ignore old blog posts
    - ^(../)?blog/20(19|21|22|23)/
description: Блог OpenTelemetry
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

<script>
    document.addEventListener("DOMContentLoaded", function () {
        if (window.location.pathname.includes('/page/')) return;

        var checkbox = document.getElementById("m-blog2025-check");
        if (checkbox) checkbox.checked = true;
        checkbox = document.getElementById("m-blog2024-check");
        if (checkbox) checkbox.checked = true;
    });
</script>
