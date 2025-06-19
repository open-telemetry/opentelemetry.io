---
title: সিগন্যাল
description: OpenTelemetry দ্বারা সমর্থিত টেলিমেট্রির বিভাগগুলো সম্পর্কে জানুন
aliases: [data-sources, otel-concepts]
weight: 11
default_lang_commit: c370886c9926e6cab3738ababbf6ff5692899bbd
---

OpenTelemetry-এর উদ্দেশ্য হল [সিগন্যাল][signals] সংগ্রহ, প্রক্রিয়াকরণ এবং রপ্তানি করা।
সিগন্যাল হল সিস্টেম আউটপুট যা একটি প্ল্যাটফর্মে চলমান অপারেটিং সিস্টেম
এবং অ্যাপ্লিকেশনগুলোর অন্তর্নিহিত কার্যকলাপ বর্ণনা করে। একটি সিগন্যাল এমন
কিছু হতে পারে যা আপনি নির্দিষ্ট সময়ে পরিমাপ করতে চান, যেমন তাপমাত্রা
বা মেমরি ব্যবহার, অথবা এমন একটি ঘটনা যা আপনার বিতরণকৃত সিস্টেমের
উপাদানগুলোর মধ্য দিয়ে যায় এবং আপনি সেটি ট্রেস করতে চান। আপনি বিভিন্ন সিগন্যাল
একসাথে গ্রুপ করতে পারেন যাতে একই প্রযুক্তির অভ্যন্তরীণ কার্যকলাপ বিভিন্ন দৃষ্টিকোণ থেকে
পর্যবেক্ষণ করা যায়।

OpenTelemetry বর্তমানে সমর্থন করে:

- [ট্রেস](traces)
- [মেট্রিকস](metrics)
- [লগ](logs)
- [ব্যাগেজ](baggage)

এছাড়াও আন্ডার ডেভেলপমেন্ট বা [প্রস্তাবনা][proposal] পর্যায়ে রয়েছে:

- [ইভেন্ট][Events], একটি নির্দিষ্ট ধরনের [লগ](logs)
- [প্রোফাইল][Profiles] নিয়ে কাজ করছে প্রোফাইলিং ওয়ার্কিং গ্রুপ।

[Events]: /docs/specs/otel/logs/data-model/#events
[Profiles]:
  https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/profiles/0212-profiling-vision.md
[proposal]:
  https://github.com/open-telemetry/opentelemetry-specification/tree/main/oteps/#readme
[signals]: /docs/specs/otel/glossary/#signals
