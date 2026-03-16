---
title: কম্পোনেন্ট
description: >-
  OpenTelemetry Collector কম্পোনেন্ট - receivers, processors, exporters,
  connectors, এবং extensions
weight: 22
default_lang_commit: 1c2b0563e8e66ef0952c442e3662e4bec18a8762
---

OpenTelemetry Collector বিভিন্ন কম্পোনেন্ট দিয়ে তৈরি যা টেলিমেট্রি ডেটা
পরিচালনা করে। প্রতিটি কম্পোনেন্ট ডেটা পাইপলাইনে একটি নির্দিষ্ট ভূমিকা পালন
করে।

## কম্পোনেন্টের ধরন

- **[Receivers](receiver/)** - বিভিন্ন উৎস এবং ফরম্যাট থেকে টেলিমেট্রি ডেটা
  সংগ্রহ করে
- **[Processors](processor/)** - টেলিমেট্রি ডেটা রূপান্তর, ফিল্টার এবং সমৃদ্ধ
  করে
- **[Exporters](exporter/)** - অবজার্ভেবিলিটি ব্যাকএন্ডে টেলিমেট্রি ডেটা
  পাঠায়
- **[Connectors](connector/)** - দুটি পাইপলাইন সংযুক্ত করে, exporter এবং
  receiver উভয় হিসেবে কাজ করে
- **[Extensions](extension/)** - হেলথ চেকের মতো অতিরিক্ত সক্ষমতা প্রদান করে
