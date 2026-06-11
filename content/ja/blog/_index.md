---
title: ブログ
menu: { main: { weight: 50 } }
description: OpenTelemetry ブログ
default_lang_commit: 68c29178b21e7ace970d27c5817a4edcff3ea9fb
drifted_from_default: true
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
