---
title: 'Вибірка на основі звʼязків'
linkTitle: 'Вибірка на основі звʼязків'
weight: 60
default_lang_commit: 873e42833f8e17860becdff26de4717194eb11ca
---

Деякі сценарії, такі як сценарій створювач-споживач, можна змоделювати за допомогою "звʼязків між відрізками", щоб виразити причинно-наслідкові звʼязки між активностями. Активність (відрізок) у трейсі може посилатися на будь-яку кількість активностей в інших трейсах. Коли використовується вибірка на основі батьків, рішення про вибірку приймається на рівні одного трейса. Це означає, що рішення про вибірку для таких звʼязаних трейсів приймається незалежно, без урахування звʼязків. Це може призвести до неповної інформації для аналізу системи. Ідеально було б вибрати всі звʼязані трейси разом.

Як один із можливих способів вирішення цієї проблеми, цей приклад показує, як ми можемо збільшити ймовірність отримання повних трейсів через звʼязані трейси.

## Як працює цей приклад вибірки? {#how-does-this-sampling-example-work}

Ми використовуємо композитний семплер, який використовує два вибірники:

1. Вибірник на основі батьків.
2. Вибірник на основі звʼязків.

Цей композитний семплер спочатку делегує роботу вибірнику на основі батьків. Якщо вибірник на основі батьків вирішує провести вибірку, тоді композитний семплер також вирішує провести вибірку. Однак, якщо вибірник на основі батьків вирішує відмовитися, композитний семплер делегує роботу вибірнику на основі звʼязків. Вибірник на основі звʼязків вирішує провести вибірку, якщо активність має будь-які повʼязані активності і якщо принаймні ОДНА з цих повʼязаних активностей була вибрана.

Вибірник на основі звʼязків не є ймовірнісним вибірником. Це упереджений вибірник, який вирішує провести вибірку активності, якщо будь-який з повʼязаних контекстів був вибраний.

## Коли слід розглянути таку опцію? Які компроміси? {#when-should-you-consider-such-an-option-what-are-the-tradeoffs}

Це може бути хорошою опцією для розгляду, якщо ви хочете отримати більш повні трейси через звʼязані трейси. Однак є кілька компромісів, які слід врахувати:

### Не гарантує послідовну вибірку в усіх ситуаціях {#not-guaranteed-to-give-consistent-sampling-in-all-situations}

Цей підхід не гарантує, що ви отримаєте повні трейси через звʼязані трейси в усіх ситуаціях.

Розглянемо кілька випадків, використовуючи той самий сценарій створювач-споживач. Припустимо, у нас є активність створювача (наприклад, з ID S1 у трейсі T1), який створює повідомлення, і активність споживача (наприклад, з ID S2 у трейсі T2), яка споживає повідомлення.

Тепер припустимо, що активність створювача S1 у трейсі T1 була вибрана, скажімо, за допомогою рішення вибірника на основі батьків. Припустимо, що активність S2 у трейсі T2 не була вибрана на основі рішення вибірника на основі батьків для T2. Однак, оскільки ця активність S2 у T2 повʼязана з активністю створювача (S1 у T1), яка була вибрана, цей механізм гарантує, що активність споживача (S2 у T2) також буде вибрана.

Або ж розглянемо, що станеться, якщо діяльність S1 у трейсі T1 не буде відібрана, скажімо, за допомогою рішення батьківського відбірника. Тепер припустимо, що діяльність S2 у трейсі T2 буде відібрана на основі рішення батьківського відбірника. У цьому випадку ми бачимо, що діяльність S2 у трейсі T2 відбирається, хоча діяльність S1 у трейсі T1 не відбирається. Це приклад ситуації, в якій такий підхід не є корисним.

Іншим прикладом ситуації, в якій ви отримаєте частковий трейс, є випадок, коли споживча діяльність S2 у трейсі T2 не є кореневою діяльністю у трейсі T2. У цьому випадку припустимо, що у трейсі T2 є інша діяльність S3, яка є кореневою діяльністю. Припустимо, що рішення про вибірку для активності S3 було відхилити її. Тепер, оскільки S2 у трейсі T2 повʼязана з S1 у трейсі T1, за цим підходом S2 буде відібрана (на основі повʼязаного контексту). Отже, отриманий трейс T2 буде частковим трейсом, оскільки він не буде включати активність S3, але буде включати активність S2.

### Може призвести до збільшення обсягу даних{#can-lead-to-higher-volume-of-data}

Оскільки такий підхід буде вибирати активності, навіть якщо одна з повʼязаних активностей була вибрана, це може призвести до збільшення обсягу даних у порівнянні з регулярним вибірковим відбором на основі кореневої активності. Це повʼязано з тим, що ми приймаємо тут не імовірнісне рішення щодо вибірки на основі рішень щодо вибірки повʼязаних видів діяльності. Наприклад, якщо є 20 повʼязаних активностей, і навіть якщо лише одна з них була вибрана, то повʼязана активність також буде вибрана.

## Приклад виводу {#example-output}

При виконанні цього прикладу ви повинні побачити такий результат, як показано нижче.

```text
af448bc1cb3e5be4e4b56a8b6650785c: ParentBasedSampler decision: Drop
af448bc1cb3e5be4e4b56a8b6650785c: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

1b08120fa35c3f4a37e0b6326dc7688c: ParentBasedSampler decision: Drop
1b08120fa35c3f4a37e0b6326dc7688c: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

ff710bd70baf2e8e843e7b38d1fc4cc1: ParentBasedSampler decision: RecordAndSample
Activity.TraceId:            ff710bd70baf2e8e843e7b38d1fc4cc1
Activity.SpanId:             620d9b218afbf926
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.0373932Z
Activity.Duration:           00:00:00.0022481
Activity.Tags:
    foo: bar
Activity.Links:
    f7464f714b23713c9008f8fc884fc391 7d1c96a6f2c95556
    6660db8951e10644f63cd385e7b9549e 526e615b7a70121a
    4c94df8e520b32ff25fc44e0c8063c81 8080d0aaafa641af
    70d8ba08181b5ec073ec8b5db778c41f 99ea6162257046ab
    d96954e9e76835f442f62eece3066be4 ae9332547b80f50f
Resource associated with Activity:
    service.name: unknown_service:links-sampler


68121534d69b2248c4816c0c5281f908: ParentBasedSampler decision: Drop
68121534d69b2248c4816c0c5281f908: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

5042f2c52a08143f5f42be3818eb41fa: ParentBasedSampler decision: Drop
5042f2c52a08143f5f42be3818eb41fa: At least one linked activity
(TraceID: 5c1185c94f56ebe3c2ccb4b9880afb17, SpanID: 1f77abf0bded4ab9) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            5042f2c52a08143f5f42be3818eb41fa
Activity.SpanId:             0f8a9bfa9d7770e6
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.0806081Z
Activity.Duration:           00:00:00.0018874
Activity.Tags:
    foo: bar
Activity.Links:
    ed77487f4a646399aea5effc818d8bfa fcdde951f29a13e0
    f79860fdfb949f2c1f1698d1ed8036b9 e422cb771057bf7c
    6326338d0c0cf3afe7c5946d648b94dc affc7a6c013ea273
    c0750a9fa146062083b55227ac965ad4 b09d59ed3129779d
    5c1185c94f56ebe3c2ccb4b9880afb17 1f77abf0bded4ab9
Resource associated with Activity:
    service.name: unknown_service:links-sampler


568a2b9489c58e7a5a769d264a9ddf28: ParentBasedSampler decision: Drop
568a2b9489c58e7a5a769d264a9ddf28: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

4f8d972b0d7727821ce4a307a7be8e8f: ParentBasedSampler decision: Drop
4f8d972b0d7727821ce4a307a7be8e8f: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

ce940241ed33e1a030da3e9d201101d3: ParentBasedSampler decision: Drop
ce940241ed33e1a030da3e9d201101d3: At least one linked activity
(TraceID: ba0d91887309399029719e2a71a12f62, SpanID: 61aafe295913080f) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            ce940241ed33e1a030da3e9d201101d3
Activity.SpanId:             5cf3d63926ce4fd5
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.1127688Z
Activity.Duration:           00:00:00.0021072
Activity.Tags:
    foo: bar
Activity.Links:
    5223cff39311c741ef50aca58e4270c3 e401b6840acebf43
    398b43fee8a75b068cdd11018ef528b0 24cfa4d5fb310b9d
    34351a0f492d65ef92ca0db3238f5146 5c0a56a16291d765
    ba0d91887309399029719e2a71a12f62 61aafe295913080f
    de18a8af2d20972cd4f9439fcd51e909 4c40bc6037e58bf9
Resource associated with Activity:
    service.name: unknown_service:links-sampler


ac46618da4495897bacd7d399e6fc6d8: ParentBasedSampler decision: Drop
ac46618da4495897bacd7d399e6fc6d8: No linked span is sampled. Hence,
LinksBasedSampler decision is Drop.

68a3a05e0348d2a2c1c3db34bc3fd2f5: ParentBasedSampler decision: Drop
68a3a05e0348d2a2c1c3db34bc3fd2f5: At least one linked activity
(TraceID: 87773d89fba942b0109d6ce0876bb67e, SpanID: 2aaac98d4e48c261) is sampled.
Hence, LinksBasedSampler decision is RecordAndSample

Activity.TraceId:            68a3a05e0348d2a2c1c3db34bc3fd2f5
Activity.SpanId:             3d0222f56b0e1e5d
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: LinksAndParentBasedSampler.Example
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-04-18T16:52:16.1553354Z
Activity.Duration:           00:00:00.0049821
Activity.Tags:
    foo: bar
Activity.Links:
    7175fbd18da2783dc594d1e8f3260c74 13019d9a06a5505b
    59c9bdd52eb5cf23eae9001006743fcf 25573e0f1b290b8d
    87773d89fba942b0109d6ce0876bb67e 2aaac98d4e48c261
    0a1f65c47f556336b4028b515d363810 0816a2a2b7d4ea0b
    7602375d3eae7e849a9dc27e858dc1c2 b918787b895b1374
Resource associated with Activity:
    service.name: unknown_service:links-sampler
```
