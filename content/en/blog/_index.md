---
title: Blog
menu: { main: { weight: 50 } }
outputs: [HTML, RSS]
htmltest:
  # 2024-11-07 DO NOT COPY the following IgnoreDirs to non-en pages because it handles all locales.
  IgnoreDirs:
    # Ignore blog index pages for all locales and in all blog sections (top-level and years)
    - ^(../)?blog/(\d+/)?page/\d+
    # Ignore old blog posts
    - ^(../)?blog/20(19|21|22|23)/
description: OpenTelemetry blog
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

### Linking to GitHub repositories

When linking to source code in GitHub repositories, do not link to the `main` (or other default) branch. Instead, link to a **specific commit** or a **tagged release** that reflects the state of the code at the time the blog post was written.

This ensures that blog posts remain stable and do not break in the future when repositories evolve.
