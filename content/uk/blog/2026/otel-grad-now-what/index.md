---
title: OpenTelemetry досяг статусу Graduated… Що далі?
linkTitle: OTel Graduated… Що далі?
date: 2026-07-15
author: >-
  [Adriana Villela](https://github.com/avillela) (Dynatrace LLC), [Reese Lee](https://github.com/reese-lee) (New Relic)
sig: Governance Committee
issue: 10432
default_lang_commit: 0b7375082d1799e37a3063aa2f918f2a8546c6ac
cSpell:ignore: Farfetch версіонованими вражаюче
---

Якщо ви пропустили: [OpenTelemetry (OTel) офіційно отримав статус дипломованого (graduated) проєкту від CNCF](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/)! Тепер він стоїть поряд із такими дивовижними open source проєктами, як [Kubernetes](https://kubernetes.io) та [Prometheus](https://prometheus.io/), щоб назвати лише декілька. Це був довгий шлях, і ми дуже раді… Але що далі? Щоб зрозуміти, куди ми рухаємося, важливо зрозуміти, звідки ми прийшли.

## Історія {#history}

У недалекому минулому сигнали телеметрії не були стандартизовані. Це означало, що формати телеметрії відрізнялися від інструменту до інструменту, причому кожен вендор телеметрії створював і підтримував власні бібліотеки інструментування. Привʼязка до постачальника була величезною проблемою: якщо ви хотіли змінити постачальника, вам доводилося видаляти попередні бібліотеки зі свого коду та замінювати їх на бібліотеки нового постачальника. Таким чином, зміна постачальника була нетривіальним завданням.

Крім того, три основні сигнали телеметрії: трейсування, логи та метрики розглядалися окремо, тому не було простого способу їх зіставити. Через це спостережуваність не була повною.

Попередні спроби стандартизації вже були: [OpenTracing](https://opentracing.io) від [CNCF](https://cncf.io) та [OpenCensus](https://opencensus.io) від Google, які стали основою для того, що згодом стало OpenTelemetry.

![Хронологія OpenTelemetry](./otel-timeline.png 'Хронологія OpenTelemetry')

В інтересах створення єдиного стандарту OpenCensus та OpenTracing були обʼєднані в [OpenTelemetry](https://opentelemetry.io) у травні 2019 року. OpenTelemetry бере найкраще з обох світів, надаючи специфікацію трасувань, метрик та логів, набір стандартизованих API та реалізації цих API для різних мов програмування, а також [Collector](/docs/collector).

Зараз OpenCensus та OpenTracing є офіційно заархівованими. OpenTracing був заархівований у січні 2022 року, а OpenCensus — у липні 2023 року.

За підтримки всіх основних постачальників спостережуваності та активної спільноти розробників і кінцевих користувачів OpenTelemetry став де-факто відкритим стандартом телеметрії.

## Зростання {#growth}

[OpenTelemetry є другим проєктом у CNCF за швидкістю розвитку](https://www.cncf.io/blog/2026/02/09/what-cncf-project-velocity-in-2025-reveals-about-cloud-natives-future/), відразу після Kubernetes. [Згідно з CNCF](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/), OpenTelemetry має «понад 12 000 внесків від понад 2 800 компаній та сотень супроводжувачів у різноманітних Special Interest Groups (SIG)».

Від початку трасування, логи та метрики досягли загальної доступності (GA). [Профілювання](/blog/2024/profiling) було додано як новий сигнал OTel. [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) розширився. [OTel Collector](https://github.com/open-telemetry/opentelemetry-collector) також розширився, регулярно додаються нові компоненти. Ми стали свідками додавання нових компонентів до екосистеми OTel, щоб зробити її більш ергономічною, включаючи [OpAMP](/docs/specs/opamp/), [OTel Operator](/docs/platforms/kubernetes/operator/), [OTel Weaver](https://github.com/open-telemetry/weaver) та [OTel Arrow](https://github.com/open-telemetry/otel-arrow).

Це дуже вражаюче досягнення, враховуючи, що OpenTelemetry всього сім років. Це чіткий сигнал: OpenTelemetry надовго. І graduation допомагає це закріпити.

## Graduation!

OpenTelemetry досяг статусу graduated у травні 2026 року, розпочавши свій шлях до graduation у 2025 році.

Отже, що потрібно, щоб стати graduated проєктом CNCF? Проєкти повинні відповідати наступним критеріям:

1. **Впровадження у повсякденне використання.** [Багато різних організацій](/ecosystem/adopters/), таких як [GitHub](https://www.youtube.com/live/vB9_SiTV5CI?si=F3jRi2w83Gp1lp_F) та [Farfetch](https://youtu.be/9iaGG-YZw5I?si=YDjY8N4Z4zI4uKiV), використовують OpenTelemetry у виробництві.
2. **Надійне управління.** OTel має задокументовану [модель управління](https://github.com/open-telemetry/community/blob/96374af6e5b681664d80402bdc08d9a2d439a966/governance-charter.md) з чітко визначеними ролями щодо виборів та припинення повноважень, разом із прозорою комунікацією та прийняттям рішень.
3. **Здоровʼя спільноти.** OpenTelemetry має встановлений процес рецензування PR та управління. Проєкт має [багато постійних контрибʼюторів з різних організацій](https://www.cncf.io/projects/opentelemetry). Рецензенти реагують швидко, гарантуючи, що проблеми та виправлення вирішуються своєчасно.
4. **Безпека.** OTel пройшов щонайменше один незалежний аудит безпеки, і всі критичні виявлені проблеми були виправлені.
5. **Стабільність API.** API є стабільними, належним чином версіонованими та випускаються з регулярною періодичністю, із забезпеченням зворотної сумісності, щоб не порушувати наявні реалізації.
6. **Документація.** Документація OTel надає огляд архітектури, а також посібники для користувачів, операторів та контрибʼюторів.
7. **Розгляд та затвердження TOC.** Шаблон заявки на graduation був поданий на розгляд [Technical Oversight Committee (TOC) CNCF](https://www.cncf.io/people/technical-oversight-committee/). Ви можете переглянути [подання OTel](https://github.com/cncf/toc/issues/1739).

Як бачите, _багато_ роботи було зроблено за лаштунками багатьма відданими людьми, від супроводжувачів OTel до кінцевих користувачів, до членів TOC CNCF, щоб зробити це можливим.

Ми хотіли б висловити **величезну** подяку всій спільноті OpenTelemetry, яка зробила graduation можливим, і особливо [Austin Parker](https://github.com/austinlparker), члену Governance Committee OpenTelemetry та колишньому Community Manager, який очолив зусилля з graduation разом із CNCF.

## Що це означає для вас {#what-this-means-for-you}

Отже, що означає graduation OpenTelemetry для вас, дорогий читачу?

Dan Gomez Blanco, один із супроводжувачів [OTel End User SIG](/community/end-user/), чудово сказав [у нещодавньому дописі в LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7459538615640010752/):

> Для кінцевих користувачів цей стан сигналізує про те, що OTel далеко не «новий стандарт». Стан здоровʼя його спільноти, безпеки та якості, процеси управління та широке впровадження були оцінені на рівні, необхідному для будь-якого підприємства будь-якого масштабу. Отже, якщо ви входите до 25% скептиків, які не використовують OTel, більше немає виправдань. Ще ніколи не було кращого часу для його впровадження!

Коротше кажучи: OpenTelemetry готовий до повсякденного використання та повністю відкритий для бізнесу. Якщо ваша організація утримувалася від використання OpenTelemetry, у вас більше немає виправдань!

## Що далі? {#whats-next}

Програмне забезпечення ніколи не буває «завершеним», і те саме стосується OpenTelemetry. Проєкт продовжуватиме зростати та розвиватися: від специфікації до API та SDK, до Collector і далі.

Забігаючи наперед, ми бачимо велику потребу в спостережуваності для нових типів навантажень, таких як агентні робочі процеси — сфера, яка охоплюється новими [семантичними домовленостями генеративного AI](/docs/specs/semconv/gen-ai/). Ми також вирішуємо проблеми в областях, на яких раніше не так сильно фокусувалися, таких як браузерна та мобільна спостережуваність.

Більш зрілі команди шукають рекомендації щодо використання OpenTelemetry масштабно. Ось де такі інструменти, як [Weaver](https://github.com/open-telemetry/weaver), який допомагає командам визначати та керувати своїми схемами телеметрії, стають у нагоді. Ми також робимо OTel простішим у впровадженні, упаковуючи компоненти у встановлювані модулі через [OpenTelemetry Packaging](https://github.com/open-telemetry/opentelemetry-packaging), та дозволяючи zero-code інструментування за допомогою [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector).

Попереду в OpenTelemetry довге майбутнє, але ми також знаємо, що це можливо лише завдяки постійній роботі супроводжувачів та контрибʼюторів, і, звичайно, завдяки постійній підтримці та впровадженню нашими кінцевими користувачами.

Ми з нетерпінням чекаємо на те, що приготувало для нас майбутнє, і раді, що ви з нами в цій подорожі.
