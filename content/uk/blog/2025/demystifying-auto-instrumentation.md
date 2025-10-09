---
title: 'Розвінчування міфів про автоматичну інструменталізацію: як насправді працює ця магія'
linkTitle: Розвінчання міфів про автоматичну інструменталізацію
date: 2025-10-08
author: >-
  [Severin Neumann](https://github.com/svrnm) (Causely)
canonical_url: https://www.causely.ai/blog/demystifying-automatic-instrumentation
issue: https://github.com/open-telemetry/opentelemetry.io/issues/7810
sig: Comms
cspell:ignore: Beyla bpftrace Causely libbpf premain uprobes
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Незважаючи на зростання популярності OpenTelemetry та [eBPF](https://ebpf.io/), більшість розробників не знають, як насправді працює автоматична інструменталізація. Ця стаття розбирає це питання — не для того, щоб запропонувати вам створити власну інструменталізацію, а щоб допомогти вам зрозуміти, що відбувається, коли ваші інструменти «просто працюють».

Ми розглянемо пʼять ключових технік, що лежать в основі автоматичної інструменталізації: monkey patching, інструменталізація байт-коду, інструменталізація під час компіляції, eBPF та API мов виконання. Кожна техніка використовує унікальні характеристики різних мов програмування та середовищ виконання, щоб додати спостережуваність без змін у коді.

## Що таке автоматична інструменталізація? {#what-is-automatic-instrumentation}

Згідно з [глосарієм](/docs/concepts/glossary), автоматична інструменталізація означає «_методи збору телеметричних даних, які не вимагають від кінцевого користувача модифікації вихідного коду застосунку. Методи різняться залежно від мови програмування, прикладами можуть бути введення байт-коду або monkey patching._»

Варто зазначити, що «автоматична інструменталізація» часто використовується для опису двох повʼязаних але різних понять. У наведеному вище визначенні та в цьому дописі це поняття стосується конкретних технік (таких як введення байт-коду або monkey patching), які можна використовувати для забезпечення спостережуваності без змін у коді. Однак, коли люди використовують термін «автоматична інструменталізація» у розмовах, вони часто мають на увазі повністю готові рішення, такі як [OpenTelemetry Java agent](/docs/zero-code/java/agent/).

Ця відмінність є важливою: насправді тут існує трирівнева ієрархія. На нижньому рівні знаходяться **техніки автоматичної інструменталізації** (інʼєкції байт-коду, monkey patching тощо), які ми розглянемо тут. Ці методи використовуються [бібліотеками інструменталізації](/docs/concepts/glossary/#instrumentation-library), які орієнтовані на конкретні фреймворки, наприклад, бібліотеки, що інструменталізують [Spring і Spring Boot](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/spring), [Express.js](https://www.npmjs.com/package/@opentelemetry/instrumentation-express), [Laravel](https://packagist.org/packages/open-telemetry/opentelemetry-auto-laravel) або інших популярних фреймворків. Нарешті, комплексні рішення, такі як OpenTelemetry Java agent, обʼєднують ці бібліотеки інструментування та додають всі стандартні конфігурації для експортерів, семплерів та інших будівельних блоків.

У спільноті моніторингу тривають дискусії щодо правильної термінології, і ця стаття не має на меті вирішити ці суперечки.

Також зверніть увагу, що те, що для однієї людини є «автоматичним», для іншої може бути «ручним»: якщо розробник бібліотеки інтегрує API OpenTelemetry у свій код, користувачі цієї бібліотеки «автоматично» отримуватимуть трейси, логи та метрики з цієї бібліотеки, коли додадуть SDK OpenTelemetry до свого застосунку.

## Хочете спробувати ці техніки самостійно? {#want-to-try-the-techniques-yourself}

Цей допис у блозі містить невеликі фрагменти коду для ілюстрації концепцій. Ви можете спробувати повністю робочі приклади в [lab repository](https://github.com/causely-oss/automatic-instrumentation-lab).

Перш ніж ми перейдемо до вивчення цих технік, важливо зазначити, що не слід створювати власні автоматичні інструментування з нуля, особливо використовуючи цю публікацію в блозі як план. Наведені тут приклади спрощені для навчальних цілей і не містять багатьох складних деталей, з якими ви зіткнетеся в реальних реалізаціях. Існують перевірені інструменти та механізми, які дозволяють впоратися з більшістю складнощів та крайніх випадків, з якими ви зіткнетеся під час створення інструментування з нуля. Якщо ви зацікавлені в більш глибокому вивченні цієї галузі, найкращим підходом буде [участь в поточних проєктах, таких як OpenTelemetry](/community/#develop-and-contribute), де ви зможете навчитися у досвідчених розробників та працювати з готовим до використання кодом.

## Техніки автоматичного інструментування {#automatic-instrumentation-techniques}

Тепер давайте розберемося, як ці техніки працюють «під капотом».

### Monkey patching: Заміна функції під час виконання {#monkey-patching-runtime-function-replacement}

Monkey patching — це, мабуть, найпростіша техніка автоматичної інструментації, яка зазвичай використовується в динамічних мовах, таких як JavaScript, Python і Ruby. Концепція проста: під час виконання ми замінюємо наявні функції інструментованими версіями, які вставляють телеметрію до і після виклику оригінальної функції.

Ось як це працює в Node.js:

```javascript
const originalFunction = exports.functionName;

function instrumentedFunction(...args) {
  const startTime = process.hrtime.bigint();
  const result = originalFunction.apply(this, args);
  const duration = process.hrtime.bigint() - startTime;
  console.log(`functionName(${args[0]}) took ${duration} nanoseconds`);
  return result;
}

exports.functionName = instrumentedFunction;
```

Бібліотека require-in-the-middle дозволяє нам виконувати цю заміну під час завантаження модуля, перехоплюючи процес завантаження модуля, щоб модифікувати експортовані функції до того, як вони будуть використані застосунком:

```javascript
const hook = require("require-in-the-middle");
hook(["moduleName"], (exports, name, basedir) => {
  const functionName = exports.fibonacci;
  ...
  exports.functionName = instrumentedFunction;
  return exports;
});
```

Однак, monkey patching має свої обмеження. Він не може інструментувати код, який вже скомпільований у машинний код, і може не працювати з функціями, які викликаються до завантаження інструментування. Крім того, накладні витрати на обгортання функцій можуть бути значними для застосунків, критичних до продуктивності. Monkey patching також є нестійким, коли реалізація інструментованого коду значно змінюється, оскільки код інструментування потрібно оновлювати, щоб він відповідав новому інтерфейсу.

Щоб спробувати це самостійно, ознайомтеся з [прикладом Node.js](https://github.com/causely-oss/automatic-instrumentation-lab#monkey-patching-nodejs) з lab.

Якщо ви хочете побачити реалізації monkey patching, які активно використовуються, ви можете ознайомитися з бібліотеками інструментації, що надаються OpenTelemetry для [JavaScript](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages) або [Python](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation).

### Інструментація байт-коду: модифікація віртуальної машини {#bytecode-instrumentation-modifying-the-virtual-machine}

Для мов, що працюють за допомогою віртуальних машин, інструментація байт-коду є потужним підходом. Ця техніка працює шляхом модифікації скомпільованого байт-коду під час його завантаження віртуальною машиною, що дозволяє нам вводити код на рівні інструкцій.

API інструментації Java забезпечує основу для цього підходу. Коли агент Java вказаний з прапорцем `-javaagent`, JVM викликає метод `premain()` агента перед запуском основної програми. Це дає нам можливість зареєструвати трансформатор класів, який може модифікувати будь-який клас під час його завантаження.

```java
public static void premain(String args, Instrumentation inst) {
    new AgentBuilder.Default()
        .type(ElementMatchers.nameStartsWith("com.example.TargetApp"))
        .transform((builder, typeDescription, classLoader, module, protectionDomain) ->
            builder.method(ElementMatchers.named("targetMethod"))
                   .intercept(MethodDelegation.to(MethodInterceptor.class))
        ).installOn(inst);
}
```

Потім перехоплювач обгортає оригінальний виклик методу логікою синхронізації:

```java
@RuntimeType
public static Object intercept(@Origin String methodName,
                            @AllArguments Object[] args,
                            @SuperCall Callable<?> callable) throws Exception {
    long startTime = System.nanoTime();
    Object result = callable.call();
    long duration = System.nanoTime() - startTime;

    System.out.printf("targetMethod(%s) took %d ns%n", args[0], duration);
    return result;
}
```

Інструментація байт-коду є особливо потужною, оскільки працює на рівні JVM, що робить її незалежною від мови в екосистемі JVM. Вона може інструментувати Java, Kotlin, Scala та інші мови JVM без модифікації.

Головною перевагою інструментації байт-коду є її всеосяжне покриття — вона може інструментувати будь-який код, що виконується на JVM, включаючи код, завантажений динамічно або з зовнішніх джерел. Однак це супроводжується деякими накладними витратами через процес трансформації байт-коду.

У реальних реалізаціях [ByteBuddy](https://bytebuddy.net/#/) є основною бібліотекою для інструментації байт-коду в Java, що надає потужний і гнучкий API для створення Java-агентів. Вона абстрагує більшу частину складності маніпулювання байт-кодом і надає чистий, безпечний для типів спосіб визначення правил інструменталізації.

Щоб спробувати це самостійно, ознайомтеся з [прикладом на Java](https://github.com/causely-oss/automatic-instrumentation-lab#byte-code-instrumentation-java) з lab.

Якщо ви хочете побачити реалізації інструментації байт-коду, що активно використовуються, ви можете ознайомитися з бібліотеками інструментації, що надаються OpenTelemetry для [Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation) або [.NET](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src).

### Інструментація під час компіляції: вбудовування спостережуваності в бінарний файл {#compile-time-instrumentation-Baking-observability-into-the-binary}

Для статично компільованих мов, таких як Go, інструментування під час компіляції пропонує інший підхід. Замість модифікації коду під час виконання, ми трансформуємо вихідний код під час процесу побудови за допомогою маніпуляцій з [абстрактним синтаксичним деревом](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST).

Цей процес передбачає розбір вихідного коду в AST, модифікацію дерева для додавання коду інструменталізації, а потім генерацію модифікованого вихідного коду перед компіляцією. Такий підхід гарантує, що інструментація буде вбудована в кінцевий бінарний файл, що забезпечує нульові накладні витрати на виконання для самого механізму інструментації.

```go
func instrumentFunction() {
    fset := token.NewFileSet()
    file, err := parser.ParseFile(fset, "app/target.go", nil, parser.ParseComments)

    // Find the target function and add timing logic
    ast.Inspect(file, func(n ast.Node) bool {
        if fn, ok := n.(*ast.FuncDecl); ok && fn.Name.Name == "targetFunction" {
            // Add defer statement for timing
            deferStmt := &ast.DeferStmt{
                Call: &ast.CallExpr{
                    Fun: &ast.CallExpr{
                        Fun: &ast.Ident{Name: "trace_targetFunction"},
                    },
                },
            }
            fn.Body.List = append([]ast.Stmt{deferStmt}, fn.Body.List...)
        }
        return true
    })

    // Write the modified file back
    printer.Fprint(f, fset, file)
}
```

Інструментація під час компіляції має кілька переваг. Вона не створює додаткового навантаження на механізм інструментації під час виконання, а отриманий бінарний файл містить весь необхідний код. Цей підхід добре працює з компільованими мовами і може бути інтегрований в наявні процеси збирання.

Однак, він має і свої недоліки. Він вимагає доступу до вихідного коду та системи збирання, що робить його непридатним для інструментації сторонніх застосунків або бібліотек. Він також вимагає більш складних інструментів для правильної та послідовної обробки абстрактного синтаксичного дерева (AST), що додає складності до процесу збирання і потенційно вимагає змін у ваших процесах CI/CD.

Щоб спробувати це самостійно, подивіться [приклад компіляції Go](https://github.com/causely-oss/automatic-instrumentation-lab#compile-time-instrumentation-go) з lab.

Якщо ви хочете побачити реалізації інструментування під час компіляції, які активно використовуються, ви можете ознайомитися з проєктом [OpenTelemetry Go Compile Instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation).

### Інструментування eBPF: спостережуваність на рівні ядра {#ebpf-instrumentation-kernel-level-observability}

[eBPF](https://ebpf.io/) (Extended Berkeley Packet Filter) представляє принципово інший підхід до автоматичного інструментування. Замість модифікації коду програми або байт-коду, eBPF працює на рівні ядра, приєднуючи проби до точок входу і виходу функцій у запущеному застосунку.

Програми eBPF — це невеликі безпечні програми, що працюють у ядрі та можуть спостерігати за системними викликами, викликами функцій та іншими подіями. Для автоматичного інструментування ми використовуємо uprobes (проби простору користувача), які приєднуються до конкретних функцій у нашому застосунку.

```bash
#!/usr/bin/env bpftrace

uprobe:/app/fibonacci:main.fibonacci
{
    @start[tid] = nsecs;
}

uretprobe:/app/fibonacci:main.fibonacci /@start[tid]/
{
    $delta = nsecs - @start[tid];
    printf("fibonacci() duration: %d ns\n", $delta);
    delete(@start[tid]);
}
```

Цей скрипт [bpftrace](https://github.com/bpftrace/bpftrace) приєднує пробу до функції в нашому застосунку. Коли функція викликається, він записує час початку. Коли функція завершується, він обчислює тривалість і виводить результат.

Інструментування eBPF не залежить від мови і працює з будь-якою мовою, що працює в Linux. Це забезпечує глибоку спостережуваність на рівні системи без необхідності внесення будь-яких змін до коду застосунку або процесу збирання. Накладні витрати мінімальні, оскільки інструментування працює в ядрі.

Однак інструментування eBPF має деякі обмеження. Для його роботи потрібні Linux і права суперкористувача, що робить його менш придатним для контейнерних середовищ або застосунків, які не можуть працювати з підвищеними правами.

Для реальних випадків використання bpftrace є лише одним із багатьох доступних інструментів eBPF. Хоча він чудово підходить для навчання та створення прототипів, у промислових середовищах зазвичай використовуються більш складні фреймворки, такі як [BCC](https://github.com/iovisor/bcc) (BPF Compiler Collection) або [libbpf](https://github.com/libbpf/libbpf), які забезпечують кращу продуктивність, більше функцій та надійніші гарантії безпеки.

Щоб спробувати це самостійно, ознайомтеся з [прикладом Go eBPF](https://github.com/causely-oss/automatic-instrumentation-lab#ebpf-based-instrumentation-go) з лабораторії.

Якщо ви хочете побачити реалізації інструментування eBPF, що активно використовуються, ви можете ознайомитися з проєктом [OpenTelemetry eBPF Instrumentation](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation) («OBI»), який є результатом [передачі Beyla компанією Grafana Labs](https://github.com/open-telemetry/community/issues/2406).

### API мов виконання: підтримка вбудованих інструментів {#language-runtime-apis-native-instrumentation-support}

Деякі мови надають вбудовані API інструментування, пропонуючи більш інтегрований підхід. [API Observer для PHP](https://github.com/php/php-src/blob/PHP-8.0/Zend/zend_observer.h), представлений у PHP 8.0, є яскравим прикладом такого підходу.

API Observer дозволяє розширенням C підключатися до потоку виконання рушія PHP на рівні рушія Zend. Це забезпечує глибокий контроль поведінки PHP-застосунків без необхідності модифікації коду.

```cpp
static void observer_begin(zend_execute_data *execute_data) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            start_time = clock();
        }
    }
}

static void observer_end(zend_execute_data *execute_data, zval *retval) {
    if (execute_data->func && execute_data->func->common.function_name) {
        const char *function_name = ZSTR_VAL(execute_data->func->common.function_name);
        if (strcmp(function_name, "fib") == 0) {
            clock_t end_time = clock();
            double duration = (double)(end_time - start_time) / CLOCKS_PER_SEC * 1000;
            php_printf("Function %s() took %.2f ms\n", function_name, duration);
        }
    }
}
```

API Observer надає чіткий, підтримуваний спосіб додавання інструментування до PHP-застосунків. Він працює на рівні виконання мови, подібно до того, як інші мови реалізують свої API інструментування. Цей підхід є ефективним і добре інтегрованим в екосистему мови.

Однак він вимагає написання розширень C, що додає складності і робить його менш доступним для розробників, які не знайомі з C або внутрішніми API PHP. Він також є специфічним для PHP, тому знання не переносяться на інші мови.

Щоб спробувати це самостійно, подивіться на [приклад PHP Observer API](https://github.com/causely-oss/automatic-instrumentation-lab#php-observer-api-php) з лабораторії.

Якщо ви хочете побачити реалізації інструментування API, що активно використовуються, ви можете ознайомитися з бібліотеками інструментування, що надаються OpenTelemetry для [PHP](https://github.com/open-telemetry/opentelemetry-php-contrib/tree/main/src/Instrumentation).

## Примітка щодо поширення контексту {#a-note-on-context-propagation}

Хоча ми розглянули основні техніки автоматичного інструментування, є один важливий аспект, який ми ще не обговорили: [поширення контексту](/docs/concepts/context-propagation/). Це передбачає введення інформації про контекст трасування (ідентифікатори трасування, ідентифікатори відрізків) в заголовки HTTP, метадані повідомлень та інші канали комунікації, щоб забезпечити розподілене трасування за межами сервісів.

На відміну від розглянутих нами суто методів спостереження, поширення контексту активно змінює поведінку вашої програми, змінюючи дані, що передаються за межами сервісів. Це додає додаткової складності, яка заслуговує на окремий допис у блозі.

## Висновки {#conclusion}

Ми розглянули основні техніки автоматичної інструменталізації, від monkey patching до інструменталізації байт-коду та eBPF-проб. Кожен підхід використовує унікальні характеристики різних мов програмування та середовищ виконання.

Ці техніки лежать в основі інструментів спостережуваності процесів у промисловому масштабі, таких як OpenTelemetry, що дозволяє розробникам швидко додавати телеметрію без модифікації вихідного коду. Найуспішніші стратегії спостережуваності поєднують автоматичну та ручну інструментацію: автоматична інструментація забезпечує широке покриття типових шаблонів, а ручна інструментація збирає метрики, специфічні для конкретного проєкту.

Якщо ви хочете самостійно випробувати ці техніки, ви можете скористатися [Automatic Instrumentation Lab](https://github.com/causely-oss/automatic-instrumentation-lab).

Якщо ви зацікавлені у сприянні розвитку цих технологій, розгляньте можливість участі в [різних Special Interest Groups](https://github.com/open-telemetry/community/#special-interest-groups) (SIG) OpenTelemetry.
