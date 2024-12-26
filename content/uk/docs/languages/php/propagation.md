---
title: Поширення
description: Поширення контексту для PHP API
weight: 60
---

{{% uk/docs/languages/propagation php %}}

Поширення — це механізм, який передає дані між сервісами та процесами. Хоча це не обмежується лише трасуванням, поширення дозволяє трейсам будувати причинно-наслідкову інформацію про систему крізь сервіси, які розподілені між процесами та мережевими межами.

OpenTelemetry надає текстовий підхід для поширення контексту до віддалених сервісів, використовуючи HTTP заголовки [W3C Trace Context](https://www.w3.org/TR/trace-context/).

## Автоматичне поширення контексту {#automatic-context-propagation}

Автоінструментування існує для деяких популярних PHP фреймворків, таких як Symfony, Laravel або Slim. HTTP бібліотеки пропагують контекст для вхідних та вихідних HTTP запитів.

{{% alert title="Примітка" %}}

Використовуйте автоінструментування або бібліотеки інструментування для поширення контексту. Хоча ви можете поширювати контекст вручну, PHP автоінструментування та бібліотеки інструментування добре протестовані та легші у використанні.

{{% /alert %}}

### Вхідні запити {#incoming-requests}

Автоінструментування для фреймворків, які реалізують [PSR-15](https://www.php-fig.org/psr/psr-15/) `RequestHandlerInterface`, автоматично витягує заголовки W3C tracecontext, створює кореневий відрізок та встановлює віддаленого батька для кореневого відрізка.

```shell
composer require open-telemetry/opentelemetry-auto-psr15
```

### Вихідні запити {#outgoing-requests}

Автоінструментування [PSR-18](https://www.php-fig.org/psr/psr-18/) автоматично застосовує заголовки W3C tracecontext до вихідних HTTP запитів для будь-якої бібліотеки, яка реалізує інтерфейс PSR-18.

```shell
open-telemetry/opentelemetry-auto-psr18
```

## Ручне поширення контексту {#manual-context-propagation}

У деяких випадках неможливо поширювати контекст за допомогою бібліотеки інструментування. Можливо, не існує бібліотеки інструментування, яка відповідає бібліотеці, яку ви використовуєте для комунікації між сервісами. Або у вас можуть бути вимоги, які бібліотеки інструментування не можуть виконати, навіть якщо вони існують.

Коли вам потрібно пропагувати контекст вручну, використовуйте API контексту.

Наступний фрагмент показує приклад вихідного HTTP запиту:

```php
$request = new Request('GET', 'http://localhost:8080/resource');
$outgoing = $tracer->spanBuilder('/resource')->setSpanKind(SpanKind::CLIENT)->startSpan();
$outgoing->setAttribute(TraceAttributes::HTTP_METHOD, $request->getMethod());
$outgoing->setAttribute(TraceAttributes::HTTP_URL, (string) $request->getUri());

$carrier = [];
TraceContextPropagator::getInstance()->inject($carrier);
foreach ($carrier as $name => $value) {
    $request = $request->withAddedHeader($name, $value);
}
try {
    $response = $client->send($request);
} finally {
    $outgoing->end();
}
```

Аналогічно, використовуйте текстовий підхід для читання W3C Trace Context з вхідних запитів. Наступний приклад показує обробку вхідного HTTP запиту:

```php
$request = ServerRequestCreator::createFromGlobals();
$context = TraceContextPropagator::getInstance()->extract($request->getHeaders());
$root = $tracer->spanBuilder('HTTP ' . $request->getMethod())
    ->setStartTimestamp((int) ($request->getServerParams()['REQUEST_TIME_FLOAT'] * 1e9))
    ->setParent($context)
    ->setSpanKind(SpanKind::KIND_SERVER)
    ->startSpan();
$scope = $root->activate();
try {
    /* do stuff */
} finally {
    $root->end();
    $scope->detach();
}
```

## Наступні кроки {#next-steps}

Щоб дізнатися більше про поширення, прочитайте [Специфікацію API поширювачів](/docs/specs/otel/context/api-propagators/).
