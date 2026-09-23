---
title: Lambda-функції з'являються в OTTL
linkTitle: Lambda-функції в OTTL
date: 2026-07-22
author: '[Edmo Vamerlatti Costa](https://github.com/edmocosta) (Elastic)'
issue: 10848
sig: Collector SIG
default_lang_commit: b7589cf40b05480bc7a2022cf2dd36cc299904fa
cSpell:ignore: OTTL Vamerlatti
---

У міру того, як конвеєри телеметрії стають складнішими, трансформації, які вони повинні виконувати, також ускладнюються: очищення конфіденційних даних, нормалізація неузгоджених схем та забезпечення контрактів атрибутів. Хоча OTTL надає багатий набір функцій трансформації, вираження операцій над колекціями вимагало спеціалізованих функцій з жорстко закодованою поведінкою для кожного нового випадку використання.

OpenTelemetry Collector Contrib `v0.157.0` змінює це, впроваджуючи лямбда-вирази в OTTL. Лямбди дозволяють користувачам передавати вбудовану логіку безпосередньо до узагальнених функцій вищого порядку, роблячи складні трансформації зібраних даних багаторазовими та лаконічними. Випуск включає вісім нових функцій, які використовують цю можливість: `Filter`, `MapEach`, `MapKeys`, `Any`, `All`, `Find`, `Reduce` та `When`.

Лямбда-вираз —— це невелика анонімна функція, визначена вбудовано, безпосередньо там, де вона використовується. Вона приймає список параметрів та тіло, яке може бути будь-яким дійсним виразом OTTL:

<!-- prettier-ignore-start -->
```yaml
(key, value) => HasPrefix(key, "http.")
(key, value) => value * 2
```
<!-- prettier-ignore-end -->

Наступні приклади показують, що стало можливим завдяки цим функціям.

## Фільтрація та трансформація колекцій {#filtering-and-transforming-collections}

Раніше операції над кожним елементом зрізу або мапи вимагали спеціалізованих функцій з жорстко закодованою поведінкою. Тепер:

<!-- prettier-ignore-start -->
```yaml
# Залишити лише атрибути, ключ яких починається з "http."
set(span.attributes, Filter(span.attributes, (k, _) => HasPrefix(k, "http.")))

# Перетворити всі значення атрибутів у рядки
set(span.attributes, MapEach(span.attributes, (_, v) => String(v)))

# Нормалізувати всі назви ключів атрибутів до snake_case
set(span.attributes, MapKeys(span.attributes, (k, _) => ToSnakeCase(k)))

# Додати префікс до всіх ключів атрибутів ресурсу
set(resource.attributes, MapKeys(resource.attributes, (k, _) => Format("app.%s", [k])))
```
<!-- prettier-ignore-end -->

## Як ставити питання щодо зібраних даних {#asking-questions-about-a-collection}

`Any` та `All` дозволяють використовувати вміст зрізу або мапи як умову, що відкриває правила фільтрації та речення `where`, які раніше були неможливі:

<!-- prettier-ignore-start -->
```yaml
# Відхиляти відрізки, що походять з внутрішніх мереж
filter:
  trace_conditions:
    - Any(span.attributes["http.request.header.x-forwarded-for"],
      (_, v) => IsInCIDR(v, ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]))

# Обробляти лише відрізки, де всі значення db.* не порожні
transform:
  trace_statements:
    - set(span.attributes["db.complete"], true)
      where All(span.attributes, (k, v) => not HasPrefix(k, "db.") or not IsEmpty(v))
```
<!-- prettier-ignore-end -->

## Отримання одного значення {#extracting-a-single-value}

`Find` повертає перший елемент, який відповідає предикату. Додаткова друга лямбда трансформує результат перед поверненням:

<!-- prettier-ignore-start -->
```yaml
# Знайти значення першого заголовка x-
set(span.attributes["custom_header"], Find(span.attributes, (k, _) => HasPrefix(k, "x-")))

# Знайти ключ першого атрибута, значення якого дорівнює "error"
set(log.attributes["error_key"], Find(log.attributes, (_, v) => v == "error", (k, _) => k))
```
<!-- prettier-ignore-end -->

## Агрегація колекції {#aggregating-a-collection}

`Reduce` згортає зріз або мапу в єдине значення:

<!-- prettier-ignore-start -->
```yaml
# Загальна кількість байтів у списку розмірів відповідей
- set(span.attributes["total_bytes"],
  Reduce(span.attributes["response.sizes"], 0, (acc, _,  v) => acc + v))

# Об'єднати всі повідомлення про помилки в один рядок
- set(log.attributes["errors"],
  Reduce(log.attributes["error.messages"], "", (acc, _, v) => Format("%s; %s", acc, v)))
```
<!-- prettier-ignore-end -->

## Вбудовані умовні вирази {#inline-conditionals}

`When` не базується на колекціях, але дотримується тієї ж ідеї.

```yaml
# Замінити два вирази `set` одним
- set(span.attributes["speed_class"], When(() => (span.end_time_unix_nano -
  span.start_time_unix_nano) > 1000000000, "slow", "fast"))
```

## Комбінування функцій {#combining-functions}

Оскільки ці функції є композитними, ви можете передавати вихідні дані однієї функції безпосередньо як вхідні дані іншої. Тут `Filter` звужує мапу до атрибутів, які виглядають як PII, а `MapEach` хешує їхні значення перед обʼєднанням:

<!-- prettier-ignore-start -->
```yaml
transform:
  trace_statements:
    - merge_maps(span.attributes,
      MapEach(
       Filter(span.attributes, (k, v) => IsMatch(k, "(?i)(email|phone|ssn|credit_card)")),
       (_, v) => Format("%s (redacted)", [SHA1(String(v))])
      ), "upsert")
```
<!-- prettier-ignore-end -->

У поєднанні ці функції охоплюють широкий спектр трансформацій.

## Спробуйте {#trying-it-out}

Усі вісім функцій є **експериментальними** та доступні в OpenTelemetry Collector Contrib `v0.157.0` за допомогою функціональної можливості:

```yaml
--feature-gates=ottl.functions.enableLambda
```

Ми заохочуємо користувачів дослідити цю нову функціональність та скористатися її перевагами у своїх конвеєрах телеметрії!

Якщо у вас є питання або пропозиції, ми будемо раді почути вас! Долучайтеся до обговорення в каналі `#otel-collector` у [CNCF Slack](https://slack.cncf.io/).
