---
title: 'Запрошуємо до співпраці: OpenTelemetry для Kotlin'
linkTitle: 'OTel для Kotlin'
date: 2025-09-30
author: >-
  [Jamie Lynch](https://github.com/fractalwrench) (Embrace)
issue: 2975
sig: Governance Committee
default_lang_commit: 624a5ad2ea3c8f07660370aab626532469f946a3
---

## Навіщо створювати OpenTelemetry для Kotlin? {#why-launch-opentelemetry-for-kotlin}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/) (KMP) дозволяє виконувати код Kotlin на багатьох різних платформах, таких як веб-оглядачі, сервери та настільні компʼютери. Традиційно Kotlin був найпопулярнішим на Android та JVM, але з появою KMP кількість людей, які використовують його для обміну кодом між різними платформами, постійно зростає.

[Embrace](https://embrace.io/) [опублікував пропозицію](https://github.com/open-telemetry/community/issues/2975) про готовність надати реалізацію специфікації OpenTelemetry для Kotlin, яку можна використовувати в проєктах KMP. Це дозволить проєктам KMP і Kotlin збирати телеметричні дані за допомогою одного API для багатьох різних платформ. API було розроблено таким чином, щоб залишатися якомога більш незалежним від платформи реалізацією OpenTelemetry і намагається бути якомога більш мобільним для важливих випадків використання Android/iOS.

Хоча [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java) і підтримує застосунки Kotlin, що працюють на JVM, це залежить від взаємодії з Java і не «відчувається» як ідіоматичний API Kotlin для OpenTelemetry. Крім того, opentelemetry-java може працювати тільки на JVM, тоді як Kotlin можна розгортати на платформах, що не є JVM.

## Запрошення до співпраці {#call-for-contributors}

Якщо ви зацікавлені у використанні OpenTelemetry на Kotlin Multiplatform, нам потрібна ваша допомога! Ми шукаємо учасників, які готові підтримувати кодову базу, брати участь у регулярних засіданнях Special Interest Group (SIG) та загалом допомагати розвивати SDK.

Якщо ви зацікавлені стати учасником або знаєте когось, хто міг би бути зацікавленим, будь ласка, залиште коментар до [пропозиції про підтримку](https://github.com/open-telemetry/community/issues/2975).

Якщо ви не хочете стати учасником, але хочете поділитися своїми думками про проєкт або спробувати його, перегляньте [репозиторій тут](https://github.com/embrace-io/opentelemetry-kotlin) і подайте свої пропозиції.
