---
title: 블로그
menu: { main: { weight: 50 } }
description: 오픈텔레메트리(OpenTelemetry) 블로그
default_lang_commit: 89fe70663d19f375b1566b3688ef25257233cafc
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
