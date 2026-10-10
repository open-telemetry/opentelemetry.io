---
title: 'Заклик до контрибʼюторів: OpenTelemetry для Dart та Flutter'
linkTitle: 'OTel для Dart та Flutter'
date: 2026-06-29
author: >-
  [Michael Bushe](https://github.com/michaelbushe) (Mindful
  Software/Dartastic.io)
issue: 9902
sig: Governance Committee
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
# prettier-ignore
cSpell:ignore: Bushe dartastic вебплатформ контрибʼютором контрибʼюторів кросплатформових типобезпечним
---

## Чому OpenTelemetry для Dart та Flutter? {#why-opentelemetry-for-dart-and-flutter}

[Dart](https://dart.dev/) — це мова програмування повного циклу та мова [Flutter](https://flutter.dev/), одного з найпопулярніших фреймворків для створення кросплатформових застосунків. Дані свідчать, що понад 20% поточних публікацій в магазинах застосунків — це Flutter-застосунки. Dart є null-безпечним та типобезпечним, компілюється у швидкі бінарні файли і все частіше використовується для бекенд-сервісів. Проте Dart залишається останньою мовою з топ-15 мов програмування, яка не має офіційно підтримуваного SDK OpenTelemetry. Попередні реалізації спільноти більше не підтримуються, залишаючи розробників Dart та Flutter без підтримуваного шляху для збору телеметрії зі своїх серверів та застосунків.

Вже існує розробка специфікації OpenTelemetry для мови Dart, яка активно розвивається і зараз передається до проєкту OpenTelemetry: [dartastic_opentelemetry](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry) та її окремий пакунок API [dartastic_opentelemetry_api](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry_api), випущений під ліцензією Apache 2.0 на [pub.dev](https://pub.dev/packages/dartastic_opentelemetry). Він підтримує трасування, метрики та журнали за допомогою експортерів OTLP/gRPC та OTLP/HTTP для серверних, настільних, мобільних та вебплатформ.

## SIG Dart та Flutter {#a-dart-and-flutter-sig}

Першим кроком до того, щоб зробити це офіційною частиною OpenTelemetry, є створення Special Interest Group (SIG) Dart та Flutter. [Пропозиція проєкту](https://github.com/open-telemetry/community/pull/3517) для створення SIG перебуває на розгляді, а [пропозиція передачі](https://github.com/open-telemetry/community/issues/2718) Dart API та SDK відкрита. Шість супровідників з чотирьох організацій-спонсорів вже долучилися, і довгостроковий успіх офіційного Dart SDK залежить від подальшого зростання цієї спільноти.

## Заклик до контрибʼюторів {#call-for-contributors}

Якщо ви зацікавлені у використанні OpenTelemetry в Dart або Flutter, нам потрібна ваша допомога! Ми шукаємо контрибʼюторів, які готові підтримувати кодову базу, брати участь у регулярних зустрічах SIG та загалом допомагати розвивати SDK.

Якщо ви зацікавлені стати контрибʼютором або знаєте когось, хто міг би бути зацікавлений, будь ласка, залиште коментар у [пропозиції передачі](https://github.com/open-telemetry/community/issues/2718).

Якщо ви не хочете ставати контрибʼютором, але _хочете_ надати відгук або спробувати SDK, перегляньте [репозиторій](https://github.com/MindfulSoftwareLLC/dartastic_opentelemetry) та створіть тікет зі своїми думками. Будь-який відгук допомагає проєкту на цьому етапі.
