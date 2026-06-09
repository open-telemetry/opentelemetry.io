---
title: Recursos
weight: 70
description:
  Adicione detalhes sobre o ambiente das suas aplicações à sua telemetria
default_lang_commit: 2b99811a310f2749a5b6389f5e4d654a4f2e2f8e
cSpell:ignore: myhost SIGINT uuidgen WORKDIR
---

{{% docs/languages/resources-intro %}}

Abaixo você encontrará introduções sobre como configurar a detecção de recursos
com o SDK do Node.js.

## Configuração {#setup}

Siga as instruções em [Primeiros Passos - Node.js][getting started - node.js],
para que você tenha os arquivos `package.json`, `app.js` (ou `app.ts`) e
`instrumentation.mjs` (ou `instrumentation.ts`).

{{% include esm-support-note.md %}}

## Detecção de recursos de processo e ambiente {#process--environment-resource-detection}

Por padrão, o SDK do Node.js detecta [recursos de processo e do _runtime_ de
processo][process and process runtime resources] e obtém atributos da variável
de ambiente `OTEL_RESOURCE_ATTRIBUTES`. Você pode verificar o que ele detecta
ativando o log de diagnóstico no seu arquivo de instrumentação:

```javascript
// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

Execute a aplicação com alguns valores definidos em `OTEL_RESOURCE_ATTRIBUTES`,
por exemplo, definimos o `host.name` para identificar o [Host][host]:

```console
$ env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
  node --import ./instrumentation.mjs app.js
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: { 'host.name': 'localhost' } }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 12345,
    'process.executable.name': 'node',
    'process.command': '/app.js',
    'process.command_line': '/bin/node /app.js',
    'process.runtime.version': '16.17.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
...
```

## Adicionando recursos com variáveis de ambiente {#adding-resources-with-environment-variables}

No exemplo acima, o SDK detectou o processo e também adicionou o atributo
`host.name=localhost` definido pela variável de ambiente automaticamente.

Abaixo você encontrará instruções para que os recursos sejam detectados
automaticamente para você. No entanto, você pode se deparar com a situação em
que nenhum detector existe para o recurso que você precisa. Nesse caso, use a
variável de ambiente `OTEL_RESOURCE_ATTRIBUTES` para injetar o que for
necessário. Além disso, você pode usar a variável de ambiente
`OTEL_SERVICE_NAME` para definir o valor do atributo de recurso `service.name`.
Por exemplo, o script a seguir adiciona atributos de recurso de
[Serviço][service], [Host][host] e [SO][os]:

```console
$ env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
  node --import ./instrumentation.mjs app.js
...
EnvDetector found resource. Resource {
  attributes: {
    'service.name': 'app.js',
    'service.namespace': 'tutorial',
    'service.version': '1.0',
    'service.instance.id': '46D99F44-27AB-4006-9F57-3B7C9032827B',
    'host.name': 'myhost',
    'host.type': 'arm64',
    'os.name': 'linux',
    'os.version': '6.0'
  }
}
...
```

## Adicionando recursos no código {#adding-resources-in-code}

Recursos personalizados também podem ser configurados no seu código. O `NodeSDK`
oferece uma opção de configuração onde você pode defini-los. Por exemplo, você
pode atualizar seu arquivo de instrumentação como o seguinte para ter os
atributos `service.*` definidos:

```javascript
...
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: "yourServiceName",
    [ ATTR_SERVICE_VERSION ]: "1.0",
  })
  ...
});
...
```

> [!NOTE]
>
> Se você definir seus atributos de recurso via variável de ambiente e código,
> os valores definidos pela variável de ambiente têm precedência.

## Detecção de recursos de contêiner {#container-resource-detection}

Use a mesma configuração (`package.json`, `app.js` e `instrumentation.mjs` com a
depuração ativada) e um `Dockerfile` com o seguinte conteúdo no mesmo diretório:

```Dockerfile
FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--import", "./instrumentation.mjs", "app.js" ]
```

Para garantir que você consiga parar seu contêiner docker com <kbd>Ctrl +
C</kbd> (`SIGINT`), adicione o seguinte ao final do `app.js`:

```javascript
process.on('SIGINT', function () {
  process.exit();
});
```

Para obter o ID do seu contêiner detectado automaticamente para você, instale a
seguinte dependência adicional:

```sh
npm install @opentelemetry/resource-detector-container
```

Em seguida, atualize seu `instrumentation.mjs` como o seguinte:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');

// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [containerDetector],
});

sdk.start();
```

Construa sua imagem docker:

```sh
docker build . -t nodejs-otel-getting-started
```

Execute seu contêiner docker:

```sh
$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c3201db5c54'
  }
}
```

O detector extraiu o `container.id` para você. No entanto, você pode perceber
que neste exemplo os atributos de processo e os atributos definidos por uma
variável de ambiente estão faltando! Para resolver isso, ao definir a lista
`resourceDetectors`, você também precisa especificar os detectores `envDetector`
e `processDetector`:

```javascript
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// Para solução de problemas, defina o nível de log como DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // Certifique-se de adicionar aqui todos os detectores que você precisa!
  resourceDetectors: [envDetector, processDetector, containerDetector],
});

sdk.start();
```

Reconstrua sua imagem e execute seu contêiner mais uma vez:

```shell
docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
```

## Próximos passos {#next-steps}

Há mais detectores de recursos que você pode adicionar à sua configuração, por
exemplo, para obter detalhes sobre seu ambiente de [Nuvem][cloud] ou
[Implantação][deployment]. Para mais, veja os
[pacotes nomeados `resource-detector-*` no repositório opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages).

[getting started - node.js]: /docs/languages/js/getting-started/nodejs/
[process and process runtime resources]: /docs/specs/semconv/resource/process/
[host]: /docs/specs/semconv/resource/host/
[cloud]: /docs/specs/semconv/resource/cloud/
[deployment]: /docs/specs/semconv/resource/deployment-environment/
[service]: /docs/specs/semconv/resource/#service
[os]: /docs/specs/semconv/resource/os/
