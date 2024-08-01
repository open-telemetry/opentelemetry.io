---
title: Introdução à Observabilidade
description: Conceitos básicos de Observabilidade
weight: 9
cSpell:ignore: webshop
default_lang_commit: 6e3124135e38e749cdda15271d891813d6bc43db
---

## O que é Observabilidade? 

Observabilidade permite que você compreenda um sistema por fora, permitindo que faça perguntas sobre ele sem precisar conhecer seu funcionamento interno. Além disso, facilita a resolução de problemas e o tratamento de novos problemas, ou seja, "desconhecidos desconhecidos". Também ajuda a responder à pergunta "Por que isso está acontecendo?"

Para fazer essas perguntas sobre o seu sistema, sua aplicação deve estar devidamente instrumentada. Ou seja, código da aplicação deve emitir [sinais](/docs/concepts/signals/) como [rastros](/docs/concepts/signals/traces/), [métricas](/docs/concepts/signals/metrics/) e [logs](/docs/concepts/signals/logs/). Uma aplicação está devidamente instrumentada quando os desenvolvedores não precisam adicionar mais instrumentação para solucionar um problema, porque já tem tudo o que precisa. 


