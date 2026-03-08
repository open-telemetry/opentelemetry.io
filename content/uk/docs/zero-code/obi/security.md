---
title: Безпека, дозволи та можливості OBI
linkTitle: Безпека
description: Привілеї та можливості, необхідні для OBI
weight: 22
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
cSpell:ignore: akseks BPF_PROG_TYPE_KPROBE CAP_PERFMON eksctl
---

OBI потребує доступу до різних інтерфейсів Linux для інструментування застосунків, таких як читання з файлової системи `/proc`, завантаження застосунків eBPF та управління фільтрами мережевих інтерфейсів. Багато з цих операцій вимагають підвищених привілеїв. Найпростіше рішення — запустити OBI від імені root, однак це може не працювати добре в налаштуваннях, де повний доступ root не є бажаним. Щоб вирішити цю проблему, OBI спроєктовано так, щоб використовувати лише конкретні можливості ядра Linux, необхідні для його поточної конфігурації.

## Можливості ядра Linux {#linux-kernel-capabilities}

Можливості ядра Linux — це система з тонким налаштуванням для контролю доступу до привілейованих операцій. Вони дозволяють надавати конкретні дозволи процесам без надання їм повного доступу суперкористувача або root, що допомагає підвищити безпеку, дотримуючись принципу найменших привілеїв. Можливості розділяють привілеї, які зазвичай асоціюються з root, на менші привілейовані операції в ядрі.

Можливості призначаються процесам і виконуваним файлам. Використовуючи такі інструменти, як `setcap`, адміністратори можуть призначати конкретні можливості бінарному файлу, дозволяючи йому виконувати лише ті операції, які йому потрібні, без запуску від імені root. Наприклад:

```shell
sudo setcap cap_net_admin,cap_net_raw+ep myprogram
```

Цей приклад надає можливості `CAP_NET_ADMIN` і `CAP_NET_RAW` застосунку `myprogram`, дозволяючи йому керувати мережевими налаштуваннями без вимоги повних привілеїв суперкористувача.

Обираючи та призначаючи можливості, ви можете знизити ризик ескалації привілеїв, дозволяючи процесам виконувати лише ті дії, які їм потрібні.

Більше інформації можна знайти в [довідці можливостей](https://man7.org/linux/man-pages/man7/capabilities.7.html).

## Режими роботи OBI {#obi-operation-modes}

OBI може працювати в двох різних режимах: _спостереження за застосунками_ та _спостереження за мережею_. Ці режими не є взаємовиключними і можуть використовуватися разом за потреби. Для отримання додаткової інформації про активацію цих режимів зверніться до [документації з конфігурації](../configure/options/).

OBI читає свою конфігурацію та перевіряє наявність необхідних можливостей, якщо якісь з них відсутні, показується попередження, наприклад:

```shell
time=2025-01-27T17:21:20.197-06:00 level=WARN msg="Required system capabilities not present, OBI may malfunction" error="the following capabilities are required: CAP_DAC_READ_SEARCH, CAP_BPF, CAP_CHECKPOINT_RESTORE"
```

Потім OBI намагається продовжити роботу, але відсутні можливості можуть призвести до помилок пізніше.

Ви можете встановити `OTEL_EBPF_ENFORCE_SYS_CAPS=1`, що змусить OBI відмовитися від роботи, якщо необхідні можливості недоступні.

## Список можливостей, необхідних OBI {#list-of-capabilities-required-by-obi}

OBI вимагає наступний список можливостей для своєї роботи:

| Можливість               | Використання в OBI                                                                                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAP_BPF`                | Дозволяє загальну функціональність BPF та застосунків фільтрації сокетів (`BPF_PROG_TYPE_SOCK_FILTER`), які використовуються для захоплення мережевих потоків у режимі _спостереження за мережею_.                                                                                 |
| `CAP_NET_RAW`            | Використовується для створення необроблених сокетів `AF_PACKET`, які є механізмом для підключення застосунків фільтрації сокетів, що використовуються для захоплення мережевих потоків у режимі _спостереження за мережею_.                                                        |
| `CAP_NET_ADMIN`          | Необхідно для завантаження застосунків TC `BPF_PROG_TYPE_SCHED_CLS` - ці застосунки використовуються для захоплення мережевих потоків і для поширення контексту трасування, як для _мережевої, так і для спостережуваності застосунків_.                                           |
| `CAP_PERFMON`            | Використовується для поширення контексту трасування, загальної _спостережуваності застосунків_ та моніторингу мережевих потоків. Дозволяє прямий доступ до пакетів застосункам TC, завантаження eBPF-проб у ядро та арифметику вказівників, що використовуються цими застосунками. |
| `CAP_DAC_READ_SEARCH`    | Доступ до `/proc/self/mem` для визначення версії ядра, використовується OBI для визначення відповідного набору підтримуваних функцій для активації.                                                                                                                                |
| `CAP_CHECKPOINT_RESTORE` | Доступ до символічних посилань у файловій системі `/proc`, використовується OBI для отримання різної інформації про процеси та системи.                                                                                                                                            |
| `CAP_SYS_PTRACE`         | Доступ до `/proc/pid/exe` та виконуваних модулів, використовується OBI для сканування виконуваних символів та інструментування різних частин застосунків.                                                                                                                          |
| `CAP_SYS_RESOURCE`       | Збільшує кількість доступної заблокованої памʼяті, **ядра < 5.11** тільки                                                                                                                                                                                                          |
| `CAP_SYS_ADMIN`          | Поширення контексту трасування на рівні бібліотеки через `bpf_probe_write_user()` та доступ до даних BTF експортером метрик BPF                                                                                                                                                    |

### Завдання моніторингу продуктивності {#performance-monitoring-tasks}

Доступ до `CAP_PERFMON` підлягає контролю доступу `perf_events`, що регулюється налаштуванням ядра `kernel.perf_event_paranoid`, яке можна налаштувати за допомогою `sysctl` або змінивши файл `/proc/sys/kernel/perf_event_paranoid`. Стандартне значення для `kernel.perf_event_paranoid` зазвичай становить `2`, див. в розділі `perf_event_paranoid` у [документації ядра](https://www.kernel.org/doc/Documentation/sysctl/kernel.txt) та більш детально в [документації з безпеки perf](https://www.kernel.org/doc/Documentation/admin-guide/perf-security.rst).

Деякі дистрибутиви Linux визначають вищі рівні для `kernel.perf_event_paranoid`, наприклад, дистрибутиви на базі Debian [також використовують](https://lwn.net/Articles/696216/) `kernel.perf_event_paranoid=3`, що забороняє доступ до `perf_event_open()` без `CAP_SYS_ADMIN`. Якщо ви працюєте на дистрибутиві з налаштуванням `kernel.perf_event_paranoid` вище `2`, ви можете або змінити свою конфігурацію, щоб знизити її до `2`, або використовувати `CAP_SYS_ADMIN` замість `CAP_PERFMON`.

### Розгортання в AKS/EKS {#deploying-on-akseks}

Обидва середовища AKS та EKS постачаються з ядрами, які стандартно встановлюють `sys.perf_event_paranoid > 1`, що означає, що OBI потребує `CAP_SYS_ADMIN` для роботи, див. розділ про те, як [моніторити продуктивність завдань](#performance-monitoring-tasks) для отримання додаткової інформації.

Якщо ви віддаєте перевагу використовувати лише `CAP_PERFMON`, ви можете налаштувати свій вузол, щоб встановити `kernel.perf_event_paranoid = 1`. Ми надали кілька прикладів того, як це зробити, майте на увазі, що ваші результати можуть відрізнятися залежно від вашої конкретної конфігурації.

#### AKS

##### Створення конфігураційного файлу AKS {#create-aks-configuration-file}

```json
{
  "sysctls": {
    "kernel.sys_paranoid": "1"
  }
}
```

##### Створення та оновлення вашого кластера AKS {#create-or-update-your-aks-cluster}

```sh
az aks create --name myAKSCluster --resource-group myResourceGroup --linux-os-config ./linuxosconfig.json
```

Для отримання додаткової інформації див. "[Customize node configuration for Azure Kubernetes Service (AKS) node pools](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)"

#### EKS (використання EKS Anywhere Configuration) {#eks-using-eks-anywhere-configuration}

##### Створення конфігураційного файлу EKS Anywhere {#create-eks-anywhere-configuration-file}

```yaml
apiVersion: anywhere.eks.amazonaws.com/v1alpha1
kind: VSphereMachineConfig
metadata:
  name: machine-config
spec:
  hostOSConfiguration:
    kernel:
      sysctlSettings:
        kernel.sys_paranoid: '1'
```

##### Розгортання або оновлення вашого кластера EKS Anywhere {#deploy-or-update-your-eks-anywhere-cluster}

```sh
eksctl create cluster --config-file hostosconfig.yaml
```

#### EKS (зміна налаштувань групи вузлів) {#eks-modifying-node-group-settings}

##### Оновлення групи вузлів {#update-the-node-group}

```yaml
apiVersion: eks.eks.amazonaws.com/v1beta1
kind: ClusterConfig
...
nodeGroups:
  - ...
    os: Bottlerocket
    eksconfig:
      ...
      sysctls:
        kernel.sys_paranoid: "1"
```

Використовуйте AWS Management Console, AWS CLI або `eksctl`, щоб застосувати оновлену конфігурацію до вашого кластера EKS.

Для отримання додаткової інформації див. "[EKS host OS configuration documentation](https://anywhere.eks.amazonaws.com/docs/getting-started/optional/hostosconfig/)".

## Приклади сценаріїв {#example-scenarios}

Наступні приклади сценаріїв демонструють, як запустити OBI як користувача без прав root:

### Мережеві метрики через фільтр сокетів {#network-metrics-via-socket-filter}

Потрібні можливості:

- `CAP_BPF`
- `CAP_NET_RAW`

Встановіть необхідні можливості та запустіть OBI:

```shell
sudo setcap cap_bpf,cap_net_raw+ep ./bin/obi
OTEL_EBPF_NETWORK_METRICS=1 OTEL_EBPF_NETWORK_PRINT_FLOWS=1 bin/obi
```

### Мережеві метрики через управління трафіком {#network-metrics-via-traffic-control}

Потрібні можливості:

- `CAP_BPF`
- `CAP_NET_ADMIN`
- `CAP_PERFMON`

Встановіть необхідні можливості та запустіть OBI:

```shell
sudo setcap cap_bpf,cap_net_admin,cap_perfmon+ep ./bin/obi
OTEL_EBPF_NETWORK_METRICS=1 OTEL_EBPF_NETWORK_PRINT_FLOWS=1 OTEL_EBPF_NETWORK_SOURCE=tc bin/obi
```

### Спостережуваність застосунків {#application-observability}

Потрібні можливості:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`

Встановіть необхідні можливості та запустіть OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace+ep ./bin/obi
OTEL_EBPF_OPEN_PORT=8080 OTEL_EBPF_TRACE_PRINTER=text bin/obi
```

### Спостережуваність застосунків з поширенням контексту трасування {#application-observability-with-trace-context-propagation}

Потрібні можливості:

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`
- `CAP_SYS_PTRACE`
- `CAP_NET_ADMIN`

Встановіть необхідні можливості та запустіть OBI:

```shell
sudo setcap cap_bpf,cap_dac_read_search,cap_perfmon,cap_net_raw,cap_sys_ptrace,cap_net_admin+ep ./bin/obi
OTEL_EBPF_CONTEXT_PROPAGATION=all OTEL_EBPF_OPEN_PORT=8080 OTEL_EBPF_TRACE_PRINTER=text bin/obi
```

## Внутрішні вимоги до можливостей трасувальника eBPF {#internal-ebpf-tracer-capability-requirements-reference}

OBI використовує _tracers_, набір застосунків eBPF, які реалізують основну функціональність. Трейсер може завантажувати та використовувати різні види застосунків eBPF, кожен з яких вимагає свого набору можливостей.

У наведеному нижче списку кожен внутрішній трейсер зіставляється з необхідними йому можливостями. Цей список призначений для використання в якості довідника для розробників, учасників проєкту та всіх, хто цікавиться внутрішньою структурою OBI:

**(Мережева спостережуваність) Socket flow fetcher:**

- `CAP_BPF`: для `BPF_PROG_TYPE_SOCK_FILTER`
- `CAP_NET_RAW`: для створення сокета `AF_PACKET` та підключення фільтрів сокета до мережевого інтерфейсу

**(Мережева спостережуваність) Flow fetcher (tc):**

- `CAP_BPF`
- `CAP_NET_ADMIN`: для завантаження `PROG_TYPE_SCHED_CLS` eBPF TC застосунків, які використовуються для перевірки мережевого трафіку
- `CAP_PERFMON`: для прямого доступу до памʼяті пакетів через `struct __sk_buff::data` та для дозволу арифметики вказівників у програмах eBPF

**(Спостережуваність застосунків) Watcher:**

- `CAP_BPF`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_DAC_READ_SEARCH`: для доступу до `/proc/self/mem` для визначення версії ядра
- `CAP_PERFMON`: для завантаження `BPF_PROG_TYPE_KPROBE` eBPF застосунків, які вимагають арифметики вказівників

**(Спостережуваність застосунків) Підтримка мов, відмінних від Go:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: для створення сокета `AF_PACKET`, який використовується для підключення
  `obi_socket__http_filter` до мережевих інтерфейсів
- `CAP_SYS_PTRACE`: для доступу до `/proc/pid/exe` та інших вузлів у `/proc`

**(Спостережуваність застосунків і Мережева спостережуваність) моніторинг мережі в режимі TC та поширення контексту:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_PERFMON`
- `CAP_NET_ADMIN`: для завантаження `BPF_PROG_TYPE_SCHED_CLS`,
  `BPF_PROG_TYPE_SOCK_OPS` та `BPF_PROG_TYPE_SK_MSG`, всі використовуються для поширення контексту трасування та моніторингу мережі

**(Спостережуваність застосунків) GO tracer:**

- `CAP_BPF`
- `CAP_DAC_READ_SEARCH`
- `CAP_CHECKPOINT_RESTORE`
- `CAP_PERFMON`
- `CAP_NET_RAW`: для створення сокета `AF_PACKET`, який використовується для підключення `obi_socket__http_filter` до мережевих інтерфейсів
- `CAP_SYS_PTRACE`: для доступу до `/proc/pid/exe` та інших вузлів у `/proc`
- `CAP_SYS_ADMIN`: для поширення контексту на рівні бібліотеки (`bpf_probe_write_user()`)
