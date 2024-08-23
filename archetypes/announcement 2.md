---
title: {{ replaceRE "[-_]" " " .Name | title }}
date: {{ .Date | time.Format "2006-01-02" }} # Start date (optional)
expiryDate: {{ dateFormat "2006-01-02" .Date }} # End date (optional)
---

<!-- For more detail about announcements, see
https://opentelemetry.io/docs/contributing/#announcement-management

Erase this comment once you are done including the announcement text below. -->
