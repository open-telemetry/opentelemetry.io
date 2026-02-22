---
title: Документація до OpenTelemetry Demo
linkTitle: Демо
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Ласкаво просимо до [документації OpenTelemetry Demo](/ecosystem/demo/), яка охоплює встановлення та запуск демонстрації, а також деякі сценарії, які ви можете використовувати для перегляду OpenTelemetry в дії.

## Запуск Demo {#running-the-demo}

Хочете розгорнути Demo та побачити його в дії? Почніть тут.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Довідник функцій мов {#language-feature-reference}

Хочете зрозуміти, як працює інструментування певної мови? Почніть тут.

| Мова       | Автоматичне інструментування                                                                  | Бібліотеки інструментування                                                                              | Ручне інструментування                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| .NET       | [Сервіс бухгалтерії](services/accounting/)                                                    | [Сервіс кошика](services/cart/)                                                                          | [Сервіс кошика](services/cart/)                                                                          |
| C++        |                                                                                               |                                                                                                          | [Сервіс валюти](services/currency/)                                                                      |
| Elixir     |                                                                                               | [Сервіс Flagd-UI](services/flagd-ui/)                                                                    |                                                                                                          |
| Go         |                                                                                               | [Сервіс оформлення замовлення](services/checkout/), [Сервіс каталогу товарів](services/product-catalog/) | [Сервіс оформлення замовлення](services/checkout/), [Сервіс каталогу товарів](services/product-catalog/) |
| Java       | [Сервіс реклами](services/ad/)                                                                |                                                                                                          | [Сервіс реклами](services/ad/)                                                                           |
| JavaScript |                                                                                               |                                                                                                          | [Сервіс платежів](services/payment/)                                                                     |
| TypeScript |                                                                                               | [Фронтенд](services/frontend/), [Застосунок React Native App](services/react-native-app/)                | [Фронтенд](services/frontend/)                                                                           |
| Kotlin     |                                                                                               | [Сервіс виявлення шахрайства](services/fraud-detection/)                                                 |                                                                                                          |
| PHP        |                                                                                               | [Сервіс котирувань](services/quote/)                                                                     | [Сервіс котирувань](services/quote/)                                                                     |
| Python     | [Сервіс рекомендацій](services/recommendation/), [Сервіс відгуків](services/product-reviews/) |                                                                                                          | [Сервіс рекомендацій](services/recommendation/), [Сервіс відгуків](services/product-reviews/)            |
| Ruby       |                                                                                               | [Сервіс електронної пошти](services/email/)                                                              | [Сервіс електронної пошти](services/email/)                                                              |
| Rust       |                                                                                               | [Сервіс доставки](services/shipping/)                                                                    | [Сервіс доставки](services/shipping/)                                                                    |

## Документація сервісів {#service-documentation}

Специфічна інформація про те, як OpenTelemetry розгорнуто в кожному сервісі, може бути
знайдена тут:

- [Сервіс бухгалтерії](services/accounting/)
- [Сервіс реклами](services/ad/)
- [Сервіс кошика](services/cart/)
- [Сервіс оформлення замовлення](services/checkout/)
- [Сервіс електронної пошти](services/email/)
- [Фронтенд](services/frontend/)
- [Генератор навантаження](services/load-generator/)
- [Сервіс платежів](services/payment/)
- [Сервіс каталогу товарів](services/product-catalog/)
- [Сервіс відгуків про товари](services/product-reviews/)
- [Сервіс котирувань](services/quote/)
- [Сервіс рекомендацій](services/recommendation/)
- [Сервіс доставки](services/shipping/)
- [Сервіс постачальника зображень](services/image-provider/)
- [Застосунок React Native](services/react-native-app/)

## Сценарії з використанням прапорців функцій{#feature-flag-scenarios}

Як можна розвʼязати проблеми за допомогою OpenTelemetry? Ці [сценарії з використанням прапорців функцій](feature-flags/) проведуть вас через деякі попередньо налаштовані проблеми та покажуть, як інтерпретувати дані OpenTelemetry для їх вирішення.

## Довідка {#reference}

Довідкова документація проєкту, така як вимоги та матриці функцій.

- [Архітектура](architecture/)
- [Розробка](development/)
- [Довідка по Feature Flags](feature-flags/)
- [Матриця функцій метрик](telemetry-features/metric-coverage/)
- [Вимоги](./requirements/)
- [Скріншоти](screenshots/)
- [Сервіси](services/)
- [Довідка по атрибутах відрізків](telemetry-features/manual-span-attributes/)
- [Тести](tests/)
- [Матриця функцій трасування](telemetry-features/trace-coverage/)
