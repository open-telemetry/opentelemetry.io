---
title: Блог
menu: { main: { weight: 50 } }
outputs: [HTML, RSS]
htmltest:
  IgnoreDirs:
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
