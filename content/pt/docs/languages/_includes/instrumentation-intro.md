---
default_lang_commit: 1ececa0615b64c5dfd93fd6393f3e4052e0cc496 # patched
---

[Instrumentação](/docs/concepts/instrumentation/) é o ato de adicionar código de
observabilidade a uma aplicação por conta própria.

Se você estiver instrumentando uma aplicação, será necessário utilizar o SDK do
OpenTelemetry para sua linguagem. Você irá utilizar o SDK para inicializar o
OpenTelemetry e a API para instrumentar seu código. Isso passará a emitir dados
de telemetria da sua aplicação e de qualquer biblioteca que você tenha instalado
que também possua instrumentação.

Se você estiver instrumentando uma biblioteca, instale apenas o pacote da API do
OpenTelemetry para sua linguagem. Sua biblioteca não emitirá telemetria por
conta própria; ela só emitirá telemetria quando fizer parte de uma aplicação que
utiliza o SDK do OpenTelemetry. Para mais informações sobre a instrumentação de
bibliotecas, consulte a seção
[Bibliotecas](/docs/concepts/instrumentation/libraries/).

Para mais informações sobre a API e o SDK do OpenTelemetry, consulte a
[especificação](/docs/specs/otel/).
