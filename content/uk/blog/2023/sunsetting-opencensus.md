---
title: Завершення підтримки OpenCensus
linkTitle: Завершення підтримки OpenCensus
date: 2023-05-01
author: '[Aaron Abbott](https://github.com/aabmass) (Google)'
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
cSpell:ignore: july
---

У 2019 році ми оголосили, що OpenTracing та OpenCensus обʼєднаються, щоб створити проєкт OpenTelemetry. З самого початку ми вважали OpenTelemetry [наступною основною версією як OpenTracing, так і OpenCensus](https://www.cncf.io/blog/2019/05/21/a-brief-history-of-opentelemetry-so-far/).

Ми раді оголосити, що OpenTelemetry досяг функціональної відповідності з OpenCensus у C++, .NET, Go, Java, JavaScript, PHP та Python. [Стабільні релізи](/docs/languages/#status-and-releases) як SDK для трасування, так і метрик доступні для більшості з цих мов, з Go та PHP незабаром. Це означає, що OpenTelemetry може збирати та експортувати телеметричні дані з тим самим рівнем функціональності, що й OpenCensus. Крім того, OpenTelemetry пропонує [багатшу екосистему](/ecosystem/) бібліотек інструментування та експортерів, та [активну спільноту з відкритим кодом](https://www.cncf.io/blog/2023/01/11/a-look-at-the-2022-velocity-of-cncf-linux-foundation-and-top-30-open-source-projects/).

Як результат, ми архівуємо всі репозиторії OpenCensus на GitHub (за винятком [census-instrumentation/opencensus-python][][^python-timeline]) 31 липня 2023 року. Ми раді бачити [довгостроковий план для OpenTelemetry](https://medium.com/opentracing/a-roadmap-to-convergence-b074e5815289) втілюється в життя, і закликаємо всіх користувачів OpenCensus перейти на OpenTelemetry.

## Як перейти на OpenTelemetry {#how-to-migrate-to-opentelemetry}

Однією з [ключових цілей](https://medium.com/opentracing/merging-opentracing-and-opencensus-f0fe9c7ca6f0) проєкту OpenTelemetry є забезпечення зворотної сумісності з OpenCensus та історії міграції для наявних користувачів.

Щоб полегшити шлях міграції, ми надаємо мости зворотної сумісності для наступних мов[^shim-next-release]:

- [Go][go shim]
- [Java][java shim]
- [JavaScript][js shim]
- [Python][python shim]

Встановлення цих мостів дозволяє інструментам OpenCensus та OpenTelemetry гладко взаємодіяти, з усією вашою телеметрією, що виходить через експортери OpenTelemetry. Це дозволяє користувачам OpenCensus поступово переводити всі свої інструменти з OpenCensus на OpenTelemetry, і нарешті видалити бібліотеки OpenCensus зі своїх застосунків[^shim-support].

Хоча OpenTelemetry ніколи не призначався бути суворою надмножиною OpenCensus, більшість API та моделей даних сумісні. Міграція повинна розглядатися як "основне оновлення версії", і ви можете помітити деякі зміни у вашій телеметрії.

Більше деталей про те, чого очікувати та деякі запропоновані робочі процеси для міграції
описані в [специфікації сумісності OpenCensus](/docs/specs/otel/compatibility/opencensus#migration-path).

## Чого очікувати після 31 липня 2023 року {#what-to-expect-after-july-31-2023}

Після 31 липня 2023 року проєкт OpenCensus більше не буде підтримуватися. Це означає, що нові функції не будуть додаватися до проєкту, і будь-які виявлені вразливості безпеки не будуть виправлені.

Однак, репозиторії OpenCensus залишаться архівованими на GitHub. Це означає, що користувачі все ще зможуть завантажувати код OpenCensus та використовувати його у своїх проєктах. Наявні релізи OpenCensus залишаться доступними у публічних репозиторіях пакунків, таких як NPM та PyPI. **Ми закликаємо всіх користувачів OpenCensus почати планування міграції своїх проєктів на OpenTelemetry зараз.**

Одним винятком є репозиторій [census-instrumentation/opencensus-python][][^python-timeline].

[go shim]: https://github.com/open-telemetry/opentelemetry-go/tree/main/bridge/opencensus
[java shim]: https://github.com/open-telemetry/opentelemetry-java/tree/main/opencensus-shim
[python shim]: https://github.com/open-telemetry/opentelemetry-python/tree/main/shim/opentelemetry-opencensus-shim
[js shim]: https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/shim-opencensus
[census-instrumentation/opencensus-python]: https://github.com/census-instrumentation/opencensus-python

[^python-timeline]: Деякі проєкти в репозиторії `opencensus-python` все ще використовуються як рекомендовані промислові рішення. Ці проєкти будуть продовжувати підтримуватися. Для деталей щодо термінів підтримки, наступних кроків для міграції та загальних питань підтримки, звертайтеся до підтримувачів репозиторію.

[^shim-next-release]: Пакунки мостів для Python та JavaScript будуть випущені незабаром.

[^shim-support]: Ці мости реалізують стабільну [специфікацію сумісності OpenCensus](/docs/specs/otel/compatibility/opencensus#migration-path) та будуть підтримуватися принаймні один рік відповідно до [довгострокових рекомендацій підтримки OpenTelemetry](/docs/specs/otel/versioning-and-stability/#long-term-support).
