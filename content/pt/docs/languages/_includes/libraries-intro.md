---
default_lang_commit: 3574925e7c75e789f1405db04a285323679b0fd9
---

Ao desenvolver uma aplicação, é possível utilizar bibliotecas e _frameworks_ de
terceiros para acelerar seu trabalho. Caso você instrumente sua aplicação
utilizando OpenTelemetry, talvez queira evitar gastar tempo adicional para
adicionar manualmente rastros, logs e métricas às bibliotecas e _frameworks_ de
terceiros que utiliza.

Muitas bibliotecas e _frameworks_ já oferecem suporte ao OpenTelemetry ou são
compatíveis por meio da
[instrumentação](/docs/concepts/instrumentation/libraries/), permitindo gerar
dados de telemetria que podem ser exportados para um _backend_ de
observabilidade.

Caso você esteja instrumentando uma aplicação ou serviço que utilize bibliotecas
ou _frameworks_ de terceiros, siga estas instruções para aprender como usar
bibliotecas instrumentadas nativamente e bibliotecas de instrumentação para as
dependências do seu projeto.

## Usar bibliotecas com instrumentação nativa {#use-natively-instrumented-libraries}

Se uma biblioteca oferece suporte ao OpenTelemetry por padrão, é possível obter
rastros, métricas e logs emitidos por essa biblioteca ao adicionar e configurar
o SDK do OpenTelemetry na sua aplicação.

A biblioteca pode exigir alguma configuração adicional para sua instrumentação.
Consulte a documentação dessa biblioteca para saber mais.
