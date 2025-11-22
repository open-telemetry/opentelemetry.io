---
title: OpenTelemetry ডেমো ডকুমেন্টেশন
linkTitle: ডেমো
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: 2571ec5a1e17744982e8dc6efe1fdf3115d0ebbc
drifted_from_default: true
---

[OpenTelemetry ডেমো](/ecosystem/demo/) ডকুমেন্টেশনে স্বাগতম, যেখানে ডেমো কীভাবে ইনস্টল ও চালাতে হয় এবং কিছু সিনারিও দেখানো হয়েছে, যার মাধ্যমে আপনি OpenTelemetry-কে অ্যাকশনে দেখতে পারবেন।

## ডেমো চালানো {#running-the-demo}

ডেমোটি ডিপ্লয় করে অ্যাকশনে দেখতে চান? এখান থেকে শুরু করুন।

- [ডকার](docker-deployment/)
- [কুবারনেটিস](kubernetes-deployment/)

## ল্যাঙ্গুয়েজ ফিচার রেফারেন্স {#language-feature-reference}

কোনো নির্দিষ্ট ল্যাঙ্গুয়েজ ইনস্ট্রুমেন্টেশন কীভাবে কাজ করে জানতে চান? এখান থেকে শুরু করুন।

| ল্যাঙ্গুয়েজ        | স্বয়ংক্রিয় ইনস্ট্রুমেন্টেশন                        | ইনস্ট্রুমেন্টেশন লাইব্রেরি                                                                  | ম্যানুয়াল ইনস্ট্রুমেন্টেশন                                                                 |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| .NET        | [অ্যাকাউন্টিং সার্ভিস](services/accounting/)         | [কার্ট সার্ভিস](services/cart/)                                                             | [কার্ট সার্ভিস](services/cart/)                                                               |
| C++         |                                                      |                                                                                            | [কারেন্সি সার্ভিস](services/currency/)                                                       |
| Go          |                                                      | [চেকআউট সার্ভিস](services/checkout/), [প্রোডাক্ট ক্যাটালগ সার্ভিস](services/product-catalog/) | [চেকআউট সার্ভিস](services/checkout/), [প্রোডাক্ট ক্যাটালগ সার্ভিস](services/product-catalog/) |
| Java        | [অ্যাড সার্ভিস](services/ad/)                        |                                                                                            | [অ্যাড সার্ভিস](services/ad/)                                                                 |
| JavaScript  |                                                      |                                                                                            | [পেমেন্ট সার্ভিস](services/payment/)                                                         |
| TypeScript  |                                                      | [ফ্রন্টএন্ড](services/frontend/), [রিঅ্যাক্ট নেটিভ অ্যাপ](services/react-native-app/)       | [ফ্রন্টএন্ড](services/frontend/)                                                             |
| Kotlin      |                                                      | [ফ্রড ডিটেকশন সার্ভিস](services/fraud-detection/)                                           |                                                                                              |
| PHP         |                                                      | [কোট সার্ভিস](services/quote/)                                                              | [কোট সার্ভিস](services/quote/)                                                               |
| Python      | [রিকমেন্ডেশন সার্ভিস](services/recommendation/)      |                                                                                            | [রিকমেন্ডেশন সার্ভিস](services/recommendation/)                                             |
| Ruby        |                                                      | [ইমেইল সার্ভিস](services/email/)                                                           | [ইমেইল সার্ভিস](services/email/)                                                             |
| Rust        |                                                      | [শিপিং সার্ভিস](services/shipping/)                                                         | [শিপিং সার্ভিস](services/shipping/)                                                          |

## সার্ভিস ডকুমেন্টেশন {#service-documentation}

প্রতিটি সার্ভিসে OpenTelemetry কীভাবে ডিপ্লয় করা হয়েছে, তার নির্দিষ্ট তথ্য এখানে পাওয়া যাবে:

- [অ্যাকাউন্টিং সার্ভিস](services/accounting/)
- [অ্যাড সার্ভিস](services/ad/)
- [কার্ট সার্ভিস](services/cart/)
- [চেকআউট সার্ভিস](services/checkout/)
- [ইমেইল সার্ভিস](services/email/)
- [ফ্রন্টএন্ড](services/frontend/)
- [লোড জেনারেটর](services/load-generator/)
- [পেমেন্ট সার্ভিস](services/payment/)
- [প্রোডাক্ট ক্যাটালগ সার্ভিস](services/product-catalog/)
- [কোট সার্ভিস](services/quote/)
- [রিকমেন্ডেশন সার্ভিস](services/recommendation/)
- [শিপিং সার্ভিস](services/shipping/)
- [ইমেজ প্রোভাইডার সার্ভিস](services/image-provider/)
- [রিঅ্যাক্ট নেটিভ অ্যাপ](services/react-native-app/)

## ফিচার ফ্ল্যাগ সিনারিও {#feature-flag-scenarios}

OpenTelemetry দিয়ে কীভাবে সমস্যা সমাধান করবেন? এই [ফিচার ফ্ল্যাগ এনাবল্ড সিনারিও](feature-flags/) আপনাকে কিছু pre-configured সমস্যা দেখাবে এবং কীভাবে OpenTelemetry ডেটা বিশ্লেষণ করে সমাধান করতে হয়, তা শেখাবে।

## রেফারেন্স {#reference}

প্রকল্পের রেফারেন্স ডকুমেন্টেশন, যেমন রিকয়ারমেন্ট ও ফিচার ম্যাট্রিক্স।

- [আর্কিটেকচার](architecture/)
- [ডেভেলপমেন্ট](development/)
- [ফিচার ফ্ল্যাগ রেফারেন্স](feature-flags/)
- [মেট্রিক ফিচার ম্যাট্রিক্স](telemetry-features/metric-coverage/)
- [রিকয়ারমেন্ট](./requirements/)
- [স্ক্রিনশট](screenshots/)
- [সার্ভিসগুলো](services/)
- [স্প্যান অ্যাট্রিবিউট রেফারেন্স](telemetry-features/manual-span-attributes/)
- [টেস্ট](tests/)
- [ট্রেস ফিচার ম্যাট্রিক্স](telemetry-features/trace-coverage/)
