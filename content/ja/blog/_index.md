---
title: ブログ
menu: { main: { weight: 50 } }
outputs: [HTML, RSS]
description: OpenTelemetry ブログ
default_lang_commit: 94d77ab8cbfe5552a7cd68bf677be86c574a613a
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
