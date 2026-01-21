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

        // Open the sidebar year-groups for the current and previous years
        var currentYear = new Date().getFullYear();
        var yearsToCheck = [currentYear, currentYear - 1];

        yearsToCheck.forEach(function(year) {
            var checkbox = document.getElementById("m-blog" + year + "-check");
            if (checkbox) checkbox.checked = true;
        });
    });
</script>
