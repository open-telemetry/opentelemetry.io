---
title: Експонування Колектора OTel в Kubernetes з Gateway API та mTLS
linkTitle: Колектор з Gateway API та mTLS
date: 2025-06-05
author: >
  [Vipin Vijaykumar](https://github.com/vipinvkmenon) (SAP SE)
sig: End-User SIG
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
# prettier-ignore
cSpell:ignore: gateway gatewayclass ingress ingressgateway Vijaykumar Vipin безсерверних термінується
---

Метою цієї публікації є демонстрація того, як можна безпечно експонувати Колектор OpenTelemetry (OTel), що працює в Kubernetes, для зовнішнього світу, використовуючи [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) та [mutual TLS (mTLS)](https://www.buoyant.io/mtls-guide) для автентифікації та шифрування.

Оскільки спостережуваність стає все більш важливою в сучасних розподілених системах, централізація телеметричних даних за допомогою Колекторів OTel, розгорнутих в одному або декількох кластерах Kubernetes, є загальноприйнятою практикою. Часто служби або агенти, що працюють поза вашим кластером Kubernetes, повинні надсилати дані до цих Колекторів. Експонування внутрішніх сервісів вимагає ретельного розгляду питань безпеки та стандартизації. Саме тут Kubernetes Gateway API та mTLS показують свої переваги.

Зазвичай така конфігурація є корисною, коли ви маєте застосунки або робочі навантаження, що знаходяться поза кластером, і вам потрібно збирати їхні телеметричні дані. Ось декілька прикладів:

- **Гібридні хмарні/локальні середовища:** Застосунки або сервери, що працюють у традиційному центрі обробки даних, в іншій хмарі або поза кластером Kubernetes, повинні пересилати свої метрики, трейси або логи до вашого центрального місця спостережуваності.
- **Агрегація телеметрії з декількох кластерів:** у конфігурації, яка може працювати на декількох кластерах Kubernetes, ви можете призначити один кластер для розміщення основного розгортання OTel Collector. Колектори в інших «spoke» кластерах будуть діяти як клієнти, експортуючи дані до цього центрального колектора через його зовнішню точку доступу. Наприклад, у конфігурації сервісної мережі з декількома кластерами робочі навантаження можуть вимагати централізованого виконання вибірки наприкінці. У цьому випадку центральний колектор, налаштований за допомогою [процесора вибірки наприкінці](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.127.0/processor/tailsamplingprocessor) і відкритий через шлюз, агрегує дані з усіх кластерів для прийняття рішень щодо вибірки.
- **Edge Computing / IoT:** Пристрої, розгорнуті на периферії, часто повинні надсилати операційні дані назад на центральну платформу.
- **Безсерверні функції / PaaS:** Застосунки, що працюють на безсерверних платформах (таких як AWS Lambda, Google Cloud Functions) або на платформах, що надаються як послуга (Platform-as-a-Service) поза вашим кластером, можуть потребувати експорту даних OTLP.
- **Зовнішні агенти моніторингу:** Сторонні агенти або локально запущені екземпляри розробки, яким потрібно підключитися до спільного колектора в кластері.
- **Моніторинг на стороні клієнта:** Телеметрія, що надходить від зовнішніх клієнтів, таких як вебоглядачі та мобільні застосунки. Хоча mTLS не може використовуватися для [експорту телеметрії з вебоглядачів(/docs/languages/js/getting-started/browser/), колектори в кінцевому підсумку повинні бути доступними.

## Передумови {#prerequisites}

Перед тим, як почати, переконайтеся, що у вас є наступні компоненти:

1.  **Кластер Kubernetes:** Minikube, Kind, Docker Desktop, Gardener або Kubernetes від постачальника хмари.
2.  **`kubectl`:** [Налаштований](https://kubernetes.io/docs/reference/kubectl/) для взаємодії з вашим кластером.
3.  **`helm`:** [Налаштований](https://helm.sh/) для встановлення Helm-чартів.
4.  **Впровадження Gateway API:** У цьому прикладі ми будемо використовувати [Istio](https://istio.io/latest/docs/overview/what-is-istio/). Інші реалізації, такі як Contour, NGINX Gateway Fabric тощо, також можуть працювати з потенційно незначними налаштуваннями.
5.  **`openssl`:** OpenSSL [CLI](https://github.com/openssl/openssl/wiki/Binaries) для генерації сертифікатів.

> [!WARNING] Примітка щодо стабільності API
>
> Оскільки певні частини API Gateway все ще знаходяться на стадії альфа/бета, підтримка конкретних аспектів може варіюватися або може не бути стандартно увімкнена. Будь ласка, зверніться до документації реалізації Gateway, яку ви використовуєте. Наприклад, на момент написання, якщо ви використовуєте Istio, переконайтеся, що `PILOT_ENABLE_ALPHA_GATEWAY_API` увімкнено під час встановлення.

## Що це таке Gateway API в Kubernetes? {#what-is-the-kubernetes-gateway-api}

[Gateway API в Kubernetes](https://gateway-api.sigs.k8s.io/) є еволюцією старішого API Ingress. Він забезпечує більш виразний, орієнтований на ролі та гнучкий спосіб управління вхідним трафіком до вашого кластера. Ініціатива [GAMMA](https://gateway-api.sigs.k8s.io/mesh/gamma/) визначає реалізацію Gateway API. Вона була введена з наступних причин:

- **Обмеження Ingress:** API Ingress, хоча і корисний, став обмеженим. Він не мав стандартизації між реалізаціями та також обмежував можливості маршрутизації, які широко варіювалися між різними реалізаціями.
- **Розділення ролей:** Gateway API розділяє обовʼязки:
  - `GatewayClass`: Визначає _тип_ балансувальника навантаження (наприклад, Istio, GKE LB). Керується адміністраторами інфраструктури.
  - `Gateway`: Представляє екземпляр балансувальника навантаження, що запитує конкретний `GatewayClass`. Визначає слухачів (порти, протоколи, TLS). Керується операторами кластеру. Вони також можуть бути спільними для різних просторів імен.
  - `HTTPRoute`, `GRPCRoute`, `TCPRoute`, `TLSRoute` тощо: Визначають правила маршрутизації на рівні застосунків, що прикріплюються до `Gateway`. Керується розробниками/власниками застосунків.
- **Переносимість:** Стандартизоване визначення API має на меті забезпечити більшу переносимість між різними реалізаціями шлюзів/сервісних мереж.
- **Виразність:** Нативно підтримує розширені функції, такі як маніпуляція заголовками, розділення трафіку, конфігурація mTLS, маршрутизація gRPC тощо.

По суті, Gateway API пропонує більш надійну і стандартизовану модель управління трафіком північ-південь у порівнянні з традиційним Ingress API.

## mTLS — короткий вступ{#mtls-a-brief-introduction}

Mutual TLS (mTLS) розширює стандартний TLS, вимагаючи, щоб _обидві_ сторони, клієнт і сервер, представляли та перевіряли сертифікати для взаємної автентифікації.

Стандартний TLS (як HTTPS на вебсайтах) перевіряє особу _сервера_ для _клієнта_. Mutual TLS (mTLS) йде далі:

- - Клієнт перевіряє ідентичність сервера (використовуючи сертифікат сервера).
- Сервер _також_ перевіряє ідентичність клієнта (використовуючи сертифікат клієнта).

Mutual TLS важливий, оскільки він забезпечує сильну автентифікацію, гарантує наскрізне шифрування та відповідає принципам безпеки Zero Trust:

- Гарантує, що _тільки_ довірені клієнти (ті, що мають дійсний сертифікат, підписаний довіреним центром сертифікації (CA)) можуть підключатися до вашого експонованого сервісу.

- Вся комунікація між автентифікованим клієнтом і сервером (таким як Gateway) зашифрована.

- Підтримує модель Zero Trust, вимагаючи підтвердження від обох сторін і ніколи не покладаючись на взаємну довіру за типовим сценарієм.

## Сценарій {#the-scenario}

Ось кроки, які ми виконаємо, щоб експонувати розгортання OTel Collector за межами кластера.

- Розгорніть OTel Collector всередині Kubernetes, налаштований з простим приймачем OTLP/gRPC.
- Згенеруйте самопідписний кореневий CA, сертифікат сервера (для Gateway) і сертифікат клієнта (для зовнішнього клієнта).
- Налаштуйте ресурс Kubernetes `Gateway`, щоб він слухав на певному порту, завершував TLS і вимагав сертифікати клієнтів (mTLS).
- Налаштуйте `GRPCRoute`, щоб маршрутизувати вхідний gRPC-трафік з `Gateway` до внутрішнього сервісу OTel Collector.
- Налаштуйте зовнішній клієнт (інший OTel Collector), щоб експортувати дані через OTLP/gRPC, використовуючи сертифікат клієнта та довіряючи кореневому CA.

![Схема сценарію](scenario-flow.png)

## Налаштування {#setup}

### Крок 1: Встановіть Gateway API CRD. {#step-1-install-gateway-api-crd}

Стандартно, Gateway API не встановлено в кластері Kubernetes. На момент написання цього блогу, остання версія — [v1.2](https://gateway-api.sigs.k8s.io/implementations/v1.2/). Встановіть CRD Gateway API, якщо вони не присутні:

```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml

#Для підтримки GRPCRoute на даний момент. Буде не потрібен, коли GRPCRoute CRD стане GA.
kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd/experimental?ref=v1.2.0" | kubectl apply -f -
```

### Крок 2: Згенеруйте самопідписні сертифікати {#step-2-generate-self-signed-certificates}

Щоб налаштувати mTLS між клієнтом і сервером, нам потрібен набір сертифікатів. Для цього демонстраційного сценарію ми будемо використовувати самопідписні сертифікати. Ми будемо використовувати один і той же CA для підписання сертифікатів як клієнтів, так і сервера в цій демонстрації. Ми будемо використовувати `openssl` для створення наших сертифікатів. Будь ласка, зверніться до документації `openssl` для отримання деталей конфігурації.

```bash
# Змінні (налаштуйте домен/імена за потреби)
export ROOT_CA_SUBJ="/CN=MyDemoRootCA"
# Використовуйте відповідний CN/SAN для сервера/шлюзу. Якщо клієнти підключаються через IP, включіть його.
# Для DNS використовуйте імʼя хоста, яке клієнти будуть використовувати (наприклад, otel.example.com)
export SERVER_HOSTNAME="otel-gateway.example.com"
export SERVER_SUBJ="/CN=${SERVER_HOSTNAME}"
export CLIENT_SUBJ="/CN=external-otel-client"

# 1. Створіть сертифікат та ключ кореневого CA
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -subj "${ROOT_CA_SUBJ}" -keyout rootCA.key -out rootCA.crt

# 2. Створіть CSR сервера та підпишіть його кореневим CA
openssl req -newkey rsa:4096 -nodes -keyout server.key -out server.csr -subj "${SERVER_SUBJ}" \
  -addext "subjectAltName = DNS:${SERVER_HOSTNAME}" # Додайте SAN для перевірки імені хоста

openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -days 365 -sha256 \
  -extfile <(printf "subjectAltName=DNS:${SERVER_HOSTNAME}") # Переконайтеся, що SAN є в остаточному сертифікаті

# 3. Створіть CSR клієнта та підпишіть його кореневим CA
openssl req -newkey rsa:4096 -nodes -keyout client.key -out client.csr -subj "${CLIENT_SUBJ}"

openssl x509 -req -in client.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out client.crt -days 365 -sha256
```

> [!WARNING]
>
> У промисловому використанні ніколи не використовуйте самопідписні сертифікати для зовнішніх точок доступу, доступних публічно в Інтернеті. Використовуйте сертифікати, видані надійним публічним CA (наприклад, Let's Encrypt через cert-manager) або внутрішньою системою PKI. Процес отримання сертифікатів буде відрізнятися, але концепції їх використання в Kubernetes залишаються подібними. Переконайтеся, що загальне імʼя (CN) або альтернативне імʼя субʼєкта (SAN) сертифіката сервера відповідає імені хосту, яке використовують клієнти для підключення.

### Крок 3: Створіть простір імен `otel-collector` {#step-3-create-otel-collector-namespace}

Ми розгорнемо нашу конфігурацію OTel Collector у вказаному просторі імен. Далі, залежно від реалізації шлюзу/системи сервісної мережі, яку ви використовуєте, ви можете відповідно налаштувати простір імен. Наприклад, з Istio ми можемо створити простір імен з `istio-injection:enabled`, щоб Istio автоматично працював з розгорнутими навантаженнями в просторі імен.

`namespace.yaml`:

```yaml
# OpenTelemetry Collector Namespace
---
apiVersion: v1
kind: Namespace
metadata:
  name: otel-collector
  labels:
    istio-injection: enabled # Релевантно тільки якщо ви використовуєте Istio.
```

Застосуйте цю конфігурацію:

```bash
kubectl apply -f namespace.yaml
```

### Крок 4: Розгортання колектора (сервера) OTel {#step-4-deploying-the-otel-collector-server}

Створімо просте розгортання та сервіс OTel Collector. У наведеній конфігурації OTel collector буде виводити вхідні телеметричні дані. Ця конфігурація зміниться відповідно до ваших випадків використання.

`otel-collector-server.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-conf
  namespace: otel-collector # Розгортання колектора в просторі імен otel-collector
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            # Note: No TLS config here. TLS terminates at the Gateway.
            endpoint: 0.0.0.0:4317

    processors:
      batch:

    exporters:
      # Для демонстраційних цілей, виводимо логи в stdout
      debug:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        metrics:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
        logs:
          receivers: [otlp]
          processors: [batch]
          exporters: [debug]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector-server
  namespace: otel-collector # Розгортання колектора в просторі імен otel-collector
spec:
  replicas: 1
  selector:
    matchLabels:
      app: otel-collector-server
  template:
    metadata:
      labels:
        app: otel-collector-server
    spec:
      containers:
        - name: otel-collector
          # Використовуйте конкретний, актуальний теґ версії в операційному середовищі
          image: otel/opentelemetry-collector:latest
          ports:
            - containerPort: 4317 # OTLP gRPC
              name: otlp-grpc
          volumeMounts:
            - name: otel-collector-config-vol
              mountPath: /etc/otelcol
      volumes:
        - name: otel-collector-config-vol
          configMap:
            name: otel-collector-conf
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector-server-svc
  namespace: otel-collector
spec:
  selector:
    app: otel-collector-server
  ports:
    - name: grpc
      protocol: TCP
      port: 4317
      targetPort: 4317
```

Застосуйте цю конфігурацію:

```bash
kubectl apply -f otel-collector-server.yaml
```

### Крок 5: Зберігання сертифікатів як Секретів Kubernetes {#step-5-storing-certificates-as-kubernetes-secrets}

Шлюз потребує доступу до сертифіката/ключа сервера та сертифіката CA для перевірки клієнтів.

Створіть секрет з сертифікатом сервера, ключем. Ми також зберігатимемо сертифікат CA, який використовувався для підписання клієнтів. У цій демонстрації, для зручності, ми розміщуємо його в просторі імен otel-collector.

```bash
kubectl create -n otel-collector secret generic otel-gateway-server-cert --from-file=tls.crt=server.crt --from-file=tls.key=server.key --from-file=ca.crt=rootCA.crt
```

### Крок 6: Налаштування ресурсів Kubernetes Gateway API {#step-6-configuring-the-kubernetes-gateway-api-resources}

Нам потрібно два ресурси: `Gateway` та `GRPCRoute`. Для спрощення ми зберігаємо ресурси в одному просторі імен `otel-collector` в цій демонстрації. Це зміниться залежно від вашої конфігурації розгортання.

`otel-gateway-resources.yaml`:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: otel-gateway
  namespace: otel-collector
spec:
  gatewayClassName: istio
  listeners:
    - name: otlp-grpc-mtls
      port: 4317
      protocol: HTTPS
      hostname: 'otel-gateway.example.com'
      tls:
        mode: Terminate
        certificateRefs:
          - group: '' # Основна група API для Secrets
            kind: Secret
            name: otel-gateway-server-cert # Сертифікати, які були завантажені як секрети на попередньому кроці.
        options:
          # Ця структура може змінюватися в залежності від реалізації вашого Gateway/Service Mesh
          # Будь ласка, зверніться до документації встановленої реалізації.
          # Для Istio ми встановлюємо режим термінування tls тут
          gateway.istio.io/tls-terminate-mode: MUTUAL
---
# GRPCRoute, як правило, є кращим для OTLP/gRPC
# Переконайтеся, що встановлено GRPCRoute CRD (v1alpha2 або v1)
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: otel-collector-grpcroute
  # Простір імен, де знаходиться бекенд-сервіс
  namespace: otel-collector
spec:
  # Приєднайте цей маршрут до нашого шлюзу в просторі імен istio-system
  parentRefs:
    - name: otel-gateway
      namespace: otel-collector # Простір імен ресурсу Gateway
      sectionName: otlp-grpc-mtls # Приєднайте до конкретного слухача за іменем
  # Визначте правила маршрутизації для gRPC-трафіку
  rules:
    - backendRefs:
        - name: otel-collector-server-svc # Імʼя вашого внутрішнього OTel-сервісу
          namespace: otel-collector # Простір імен бекенд-сервісу
          port: 4317 # Цільовий порт на сервісі
```

- У CRD `Gateway` ми налаштовуємо `gatewayclass` і `listeners`. У цьому випадку ми налаштовуємо один `listener` з необхідним `port` і `hostname`. Ми також налаштовуємо `tls`, який тут термінується. Ми використовуємо завантажені сертифікати в якості секретів. Блок `options` використовується для налаштування `implementation specific` параметрів, якщо такі є.

- У `GRPCRoute` ми обираємо шлюз і конкретний `listener`. Ми також налаштовуємо бекенд, на який маршрут буде пересилати запити. В даному випадку на `otel-collector-server-svc`.

> [!NOTE]
>
> Ми використовуємо `options` в шлюзі для конфігурації mTLS, специфічної для конкретної реалізації. Наразі API шлюзу не має явно вираженого [режиму](https://gateway-api.sigs.k8s.io/reference/spec/#tlsmodetype) `Mutual TLS`. Зверніться до останньої версії документації API Gateway для отримання оновлень.

Застосуйте конфігурацію Gateway:

```bash
kubectl apply -f otel-gateway.yaml
```

На цьому етапі Gateway Istio (або інший) повинен бути налаштований на прослуховування порту 4317 (зазвичай відкритого через Сервіс LoadBalancer), вимагати mTLS з використанням вказаного сертифіката сервера та клієнтського CA, а також маршрутизувати допустимий трафік gRPC до `otel-collector-server-svc`.

Щоб отримати детальну інформацію про Gateway, можна виконати наступне:

```bash
# Щоб отримати імʼя хоста/IP шлюзу
kubectl -n otel-collector get gateway otel-gateway -o jsonpath='{.status.addresses[0].value}'

# Щоб отримати порт
kubectl -n otel-collector get gtw otel-gateway -o jsonpath='{.spec.listeners[?(@.name=="otlp-grpc-mtls")].port}'
```

Ви також можете побачити службу Kubernetes, створену для вашого `Gateway`.

```bash
kubectl -n otel-collector get svc
```

### Крок 7: Налаштування зовнішнього Колектора OTel (клієнта) {#step-7-configuring-the-external-otel-collector-client}

Щоб протестувати налаштування, налаштуйте колектор OTel _поза_ кластером для надсилання даних на зовнішню точку доступу Gateway за допомогою mTLS.

У цій демонстрації клієнт (OTel Collector) запускається локально за допомогою Docker.

Наступний приклад `otel-client-config.yaml` є простою конфігурацією для збору метрик CPU і памʼяті та надсилання їх на сервер:

```yaml
receivers:
  # Приклад: Приймач генерує деякі дані, наприклад, метрики хоста
  hostmetrics:
    collection_interval: 10s
    scrapers:
      cpu:
      memory:
      # Додайте інші скрепери за потреби

processors:
  batch:

exporters:
  otlp/grpc:
    # ВАЖЛИВО: Вкажіть зовнішню IP-адресу/імʼя хоста та порт шлюзу
    # Замініть <GATEWAY_EXTERNAL_IP_OR_HOSTNAME> на фактичну адресу
    # Він повинен відповідати імені хоста/SAN у сертифікаті сервера, якщо використовується імʼя хоста
    # Використовуйте імʼя хоста 'otel-gateway.example.com', якщо у вас налаштовано DNS на шлюзі.
    endpoint: <GATEWAY_EXTERNAL_IP_OR_HOSTNAME>:4317

    tls:
      # Ми ОБОВʼЯЗКОВО повинні ввімкнути конфігурацію TLS для клієнта для mTLS
      insecure: false # Переконайтеся, що сертифікат сервера перевірено центром сертифікації
      # Шлях до файлу сертифіката ЦС для перевірки сервера
      ca_file: /etc/cert/rootCA.crt
      # Шлях до файлу сертифіката клієнта
      cert_file: /etc/cert/client.crt
      # Шлях до файлу приватного ключа клієнта
      key_file: /etc/cert/client.key
      # Додатково, але рекомендовано: Вкажіть імʼя сервера для перевірки
      # Повинно відповідати CN або SAN у сертифікаті сервера (server.crt)
      # Це обовʼязково, якщо DNS не налаштовано на шлюзі та endpoint не відповідає імені хосту шлюзу
      server_name_override: otel-gateway.example.com
service:
  pipelines:
    # Приклад: надсилання метрик хосту
    metrics:
      receivers: [hostmetrics]
      processors: [batch]
      exporters: [otlp/grpc]
    # Додайте додаткові конвеєри трас і журналів, якщо клієнт їх генерує
```

Для запуску клієнта:

1.  Замініть `<GATEWAY_EXTERNAL_IP_OR_HOSTNAME>` на фактичну зовнішню IP-адресу або DNS-імʼя сервісу Istio Gateway LoadBalancer. Якщо ви використовуєте імʼя хосту (`otel-gateway.example.com`), переконайтеся, що ваша клієнтська машина може перетворити це імʼя хосту на правильну IP-адресу (наприклад, через `/etc/hosts` для тестування або фактичний DNS).

2.  Використовуйте `server_name_override`, якщо `endpoint` відрізняється від значень SAN/CN у сертифікаті сервера.

3.  Помістіть згенеровані файли `rootCA.crt`, `client.crt` і `client.key` у теку, доступну для колектора клієнта. У цій демонстрації ми зберігаємо їх у теці `certs`.

4.  Запустіть колектор клієнта (виправте шляхи та теґ образу за потреби):

    ```bash
    # Команда виконується за умови, що сертифікати та конфігурація знаходяться у поточній теці.

    docker run --rm -v $(pwd)/certs:/etc/cert/ \
               -v $(pwd)/otel-client-config.yaml:/etc/otelcol-contrib/config.yaml \
               otel/opentelemetry-collector-contrib:0.119.0
    ```

Ми запускаємо контейнер з `otel-client-config.yaml` і теки `certs`, яка містить сертифікати.

### Крок 8: Тестування зʼєднання{#step-8-testing-the-connection}

1.  **Перевірте логи сервера:** Перегляньте логи пода `otel-collector-server` всередині Kubernetes. Якщо експортер `debug` налаштовано, ви повинні побачити записи, які вказують на те, що він отримує пакети даних.

    ```bash
    kubectl logs -n otel-collector -l app=otel-collector-server -f
    ```

2.  **Перевірте логи клієнта:** Перегляньте логи зовнішнього колектора клієнта (наприклад, вивід контейнера Docker). Ви повинні побачити повідомлення на кшталт `Everything is ready. Begin running and processing data.` Будь-яке повідомлення про помилку зʼєднання (наприклад, `"certificate signed by unknown authority"`, `"bad certificate"`) або помилки `connection refused` вказують на проблему. Перевірте:
    - Доступність IP/імʼя хосту шлюзу.
    - Правила брандмауера.
    - Правильні сертифікати (`ca_file`, `cert_file`, `key_file`), які використовуються клієнтом.
    - Правильне значення `server_name_override`, що відповідає SAN/CN сертифіката сервера.
    - Правильна конфігурація mTLS на шлюзі (включаючи перевірку CA клієнта).
    - Логи контролера шлюзу (наприклад, логи пода `istio-ingressgateway` в `istio-system`) для помилок TLS.
3.  **Тестування випадку збою:**
    - Спробуйте запустити клієнта _без_ секції `tls:` в його конфігурації експортерів `otlp/grpc`. Зʼєднання повинно бути відхилено шлюзом (ймовірно, через збій рукостискання TLS або скидання зʼєднання).
    - Спробуйте закоментувати `ca_file`, `cert_file` або `key_file` в конфігурації клієнта. Зʼєднання повинно зазнати невдачі.
    - Якщо у вас є інший сертифікат, підписаний _іншим_ CA, спробуйте використовувати його як сертифікат клієнта. Шлюз повинен відхилити його під час рукостискання mTLS, оскільки він не підписаний довіреним CA.

## Застереження {#caveats}

У цьому посібнику певні кроки були виконані специфічним чином, щоб спростити запуск і розуміння конфігурації та сценарію. Ці моменти слід врахувати при налаштуванні цієї конфігурації в промисловому середовищі:

- `Самопідписні` сертифікати не повинні використовуватися в промисловому середовищі. Також `CA` сертифікати, що використовуються для клієнтів, зазвичай відрізняються від тих, що використовуються для підписання серверних сертифікатів.
- Kubernetes Gateway API постійно розвивається, з все новими функціями, які зʼявляються в специфікації. Багато з цих функцій зараз знаходяться на стадії альфа/бета і незабаром стануть загальнодоступними, наприклад, `GRPCRoute`. Зверніться до останньої документації Kubernetes щодо Gateway API.
- Kubernetes Gateway API прагне зробити конфігурацію переносимою та незалежною від реалізації настільки, наскільки це можливо. Ідеально, щоб це було так після того, як специфікація визріла та еволюціонувала. До тих пір певні аспекти конфігурації матимуть незначні зміни між реалізаціями. Наприклад, спосіб налаштування mTLS у шлюзі зараз.
- При роботі в промисловому середовищі ви можете використовувати блок `infrastructure` у `spec`, щоб налаштувати специфічні параметри для провайдера інфраструктури, наприклад, `DNS`.
- Налаштування для промислового використання повинні мати шифровану наскрізну комунікацію. Наприклад, при використанні Istio всі компоненти, що працюють у просторах імен, керованих Istio в кластері, можуть бути змушені спілкуватися один з одним. Це досягається за допомогою [PeerAuthentication](https://istio.io/latest/docs/reference/config/security/peer_authentication/). Подібні концепції також будуть доступні для інших реалізацій сервісних мереж.
- При роботі з маршрутами та шлюзами в кількох просторах імен вам можуть знадобитися посилання на ресурси, такі як бекенд `services`, та інші конфігурації з інших просторів імен. Для отримання додаткової інформації зверніться до Gateway [ReferenceGrant](https://gateway-api.sigs.k8s.io/api-types/referencegrant/).

## Альтернативні реалізації Gateway {#alternative-gateway-implementations}

Хоча ми використовували Istio (`gatewayClassName: istio`), основною перевагою Gateway API є його потенціал для стандартизації. Якщо ви використовуєте Contour, NGINX Gateway Fabric, HAPROXY тощо, визначення ресурсів `Gateway` і `GRPCRoute` в ідеалі виглядатимуть дуже схоже. Основні відмінності можуть бути такими:

- Конкретне значення для `gatewayClassName`.
- Незначні варіації у тому, як налаштовано специфічні для конкретної реалізації функції або опції (наприклад, точний синтаксис для визначення конфігурації клієнта у структурі `options`).
- Як розгортається, управляється і виставляється базовий контролер/проксі шлюзу (наприклад, імʼя і простір імен сервісу LoadBalancer).

Завжди звертайтеся до документації для конкретної обраної вами реалізації API Gateway, особливо щодо деталей конфігурації mTLS.

## Висновок {#conclusion}

Kubernetes Gateway API пропонує значне покращення в порівнянні з застарілим Ingress API, забезпечуючи більш потужний, переносимий, стандартизований підхід. Це більш гнучкий і орієнтований на ролі спосіб управління вхідним трафіком.

Поєднуючи Gateway API з взаємним TLS (mTLS), ви можете безпечно експонувати внутрішні сервіси, такі як OpenTelemetry Collector, забезпечуючи надійну автентифікацію клієнтів і зашифровану комунікацію.
