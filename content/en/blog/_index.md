---
title: Blog
menu: { main: { weight: 50 } }
# 2024-11-07 DO NOT COPY the following config to non-en pages: the (../)?
# prefix makes these patterns handle all locales.
link_check_exclude_path:
  # Skip blog index pages for all locales and in all blog sections (top-level and years)
  - ^(../)?blog/(\d+/)?page/\d+
  # Skip old blog posts
  - ^(../)?blog/20(19|21|22|23|24)/
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
