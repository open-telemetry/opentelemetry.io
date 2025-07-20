---
title: টেস্ট
default_lang_commit: b588b7136fb0f6fb7cf569e65479238e3e2eefc8
cSpell:ignore: Tracetest
---

বর্তমানে, রিপোজিটরিতে ফ্রন্টএন্ড এবং ব্যাকএন্ড উভয় সার্ভিসের জন্য E2E টেস্ট অন্তর্ভুক্ত রয়েছে। ওয়েব স্টোরের ফ্রন্টএন্ডের বিভিন্ন ফ্লো পরীক্ষা করার জন্য আমরা [Cypress](https://www.cypress.io/) ব্যবহার করছি। অন্যদিকে, ব্যাকএন্ড সার্ভিসের ইন্টিগ্রেশন টেস্টের প্রধান টেস্টিং ফ্রেমওয়ার্ক হিসেবে [AVA](https://avajs.dev) এবং ট্রেস-ভিত্তিক টেস্টের জন্য [Tracetest](https://tracetest.io/) ব্যবহৃত হচ্ছে।

সব টেস্ট একসাথে চালানোর জন্য, রুট ডিরেক্টরি থেকে `make run-tests` কমান্ডটি এক্সিকিউট করুন।

এছাড়া, নির্দিষ্ট কোনো টেস্ট চালাতে চাইলে, প্রতিটি টেস্টের জন্য নিচের কমান্ডগুলো ব্যবহার করতে পারেন[^1]:

- **ফ্রন্টএন্ড টেস্ট**: `docker compose run frontendTests`

- **ব্যাকএন্ড টেস্ট**:
  - ইন্টিগ্রেশন: `docker compose run integrationTests`
  - ট্রেস-ভিত্তিক: `docker compose run traceBasedTests`

এই টেস্টগুলো সম্পর্কে আরও বিস্তারিত জানতে [Service Testing](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test) দেখুন।

[^1]: {{% param notes.docker-compose-v2 %}}
