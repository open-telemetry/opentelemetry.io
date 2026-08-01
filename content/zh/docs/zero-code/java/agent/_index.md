---
title: Java 代理
linkTitle: 代理
default_lang_commit: 7715987e5ce1d4ac441afce2db7d337e11192666
aliases:
  - /docs/java/automatic_instrumentation
  - /docs/languages/java/automatic_instrumentation
redirects: [{ from: /docs/languages/java/automatic/*, to: ':splat' }]
---

Java 的零代码插桩通过将一个 Java 代理 JAR 附加到任何 Java 8+ 应用程序来实现。
它动态注入字节码来捕获许多流行库和框架的遥测数据。
它可用于在应用程序或服务的 “边界” 捕获遥测数据，例如入站请求、出站 HTTP 调用、数据库调用等。
要了解如何手动插桩您的服务或应用程序代码，请参阅[手动插桩](/docs/languages/java/instrumentation/)。
