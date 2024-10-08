{{/*
default_lang_commit: 080527543eae90112f01c89342891aabd6258173
*/ -}}

A [Instrumentação](/docs/concepts/instrumentation/) é o ato de adicionar código de observabilidade a um aplicativo por conta própria.

Se você estiver instrumentando um aplicativo, será necessário utilizar o SDK do OpenTelemetry para sua linguagem. O SDK irá inicializar o OpenTelemetry e a API para instrumentar seu código. Isso passará a emitir dados telemétricos do seu aplicativo e de qualquer biblioteca que você instalou e que também venha com instrumentação.

Se você estiver instrumentando uma biblioteca, basta instalar o pacote da API do OpenTelemetry para sua linguagem. Sua biblioteca não emitirá telemetria por conta própria; ela só emitirá telemetria quando fizer parte de um aplicativo que utiliza o SDK do OpenTelemetry. Para mais informações sobre a instrumentação de bibliotecas, consulte a seção [Bibliotecas](/docs/concepts/instrumentation/libraries/).

Para mais informações sobre a API e o SDK do OpenTelemetry, consulte a [especificação](/docs/specs/otel/).