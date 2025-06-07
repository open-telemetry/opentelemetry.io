---
title: Práticas do SIG para aprovadores e mantenedores
linkTitle: Práticas do SIG
description:
  Saiba como aprovadores e mantenedores gerenciam issues e contribuições.
weight: 999
cSpell:ignore: chalin Comms docsy onboarded
---

Esta página inclui diretrizes e algumas práticas comuns utilizadas por aprovadores e mantenedores.

## Integração (Onboarding)

Quando um colaborador assume um papel com mais responsabilidade na documentação (como aprovador ou mantenedor), ele será integrado pelos aprovadores e mantenedores existentes:

- Ele será adicionado ao grupo `docs-approvers` (ou `docs-maintainers`).
- Será adicionado aos canais de Slack `#otel-comms`, `#otel-maintainers` e canais internos privados.
- Será solicitado a se inscrever nos convites de calendário para as reuniões do
  [SIG Comms](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  e
  [Maintainers Meeting](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- Será solicitado a verificar se o horário atual da reunião do SIG Comms funciona para ele. Caso contrário, deverá colaborar com os demais aprovadores e mantenedores para encontrar um horário viável para todos.
- Será solicitado a revisar os diferentes recursos disponíveis para contribuidores:
  - [Recursos da Comunidade](https://github.com/open-telemetry/community/), especialmente o documento sobre
    [Níveis de Participação na Comunidade](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    e o
    [guia de redes sociais](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Diretrizes de Contribuição](/docs/contributing) — como parte desse processo, a pessoa revisará os documentos e poderá sugerir melhorias por meio de issues ou pull requests.

Outros recursos valiosos para revisão:

- [Documentação do Hugo](https://gohugo.io/documentation/)
- [Documentação do Docsy](https://www.docsy.dev/docs/)
- [Diretrizes de Marketing](/community/marketing-guidelines/), incluindo as diretrizes de branding e
  [uso de marcas registradas da Linux Foundation](https://www.linuxfoundation.org/legal/trademark-usage).
  Esses recursos são especialmente importantes ao revisar entradas para o registro, integrações, fornecedores, adotantes ou distribuições.

## Colaboração

- Aprovadores e mantenedores têm agendas e realidades diferentes. Por isso, toda comunicação é considerada assíncrona. Eles não devem se sentir obrigados a responder fora de seu horário normal.
- Quando um aprovador ou mantenedor não puder contribuir por um período prolongado (mais de alguns dias ou uma semana), deve comunicar isso pelo canal
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6)
  e atualizar seu status no GitHub.
- Aprovadores e mantenedores seguem o
  [Código de Conduta da OTel](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  e os [Valores da Comunidade](/community/mission/#community-values). Eles devem ser amigáveis e prestativos com os contribuidores. Em caso de conflito, mal-entendido ou qualquer situação desconfortável, o aprovador ou mantenedor pode se afastar da conversa, issue ou PR e pedir que outra pessoa assuma.

## Revisão de Código (Code Reviews)

### Geral

- Se o branch da PR estiver "desatualizado com o branch base", não é necessário atualizá-lo continuamente: toda atualização dispara novamente os testes de CI! Geralmente, é suficiente atualizar antes de fazer o merge.
- PRs de pessoas que não são mantenedoras **nunca** devem atualizar submódulos git. Isso pode acontecer por engano. Informe ao autor que não há problema, será corrigido antes do merge, mas que no futuro deve usar um fork atualizado.
- Se o contribuidor estiver com problemas para assinar o CLA ou usou o email errado em algum commit, solicite a correção ou o rebase da PR. No pior dos casos, feche e reabra a PR para disparar nova verificação do CLA.
- Palavras desconhecidas para o cspell devem ser adicionadas à lista local de ignore da página por quem abrir a PR. Apenas aprovadores e mantenedores adicionam termos globais.

### PRs co-gerenciadas

PRs que modificam documentação co-gerenciada por algum SIG (collector, demo, linguagem específica etc.) devem buscar duas aprovações: uma de aprovador de docs e outra de aprovador do SIG:

- O aprovador de docs deve marcar a PR com `sig:<nome>` e mencionar o grupo `-approvers` do SIG.
- Após revisar e aprovar, o aprovador de docs pode adicionar o label
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing),
  sinalizando ao SIG que ele deve revisar a PR.
- Se não houver aprovação do SIG dentro de um prazo razoável (geralmente duas semanas, podendo ser menor em casos urgentes), o mantenedor de docs pode usar seu julgamento para fazer o merge.

### PRs de bots

PRs criadas por bots seguem estas práticas:

- PRs que atualizam versões no registro podem ser corrigidas, aprovadas e mescladas imediatamente.
- PRs que atualizam versões de SDKs, instrumentações zero-code ou o collector podem ser aprovadas e mescladas, a menos que o SIG correspondente solicite adiamento.
- PRs que atualizam versões de especificações frequentemente exigem atualizações em scripts para que os testes de CI passem. Nesse caso,
  [@chalin](https://github.com/chalin/)
  cuidará da PR. Caso contrário, também podem ser aprovadas e mescladas, salvo orientação do SIG.

### PRs de tradução

PRs com mudanças em traduções devem ter duas aprovações: uma de aprovador de docs e outra de aprovador de tradução. As mesmas práticas sugeridas para PRs co-gerenciadas se aplicam aqui.

### Fazendo merge das PRs

Mantenedores podem seguir este fluxo para mesclar PRs:

- Verifique se a PR tem todas as aprovações e todos os testes de CI passaram.
- Se o branch estiver desatualizado, atualize via UI do GitHub.
- Isso disparará novamente os testes de CI. Aguarde os resultados ou use o seguinte comando para rodar e mesclar em segundo plano:

  ```shell
  export PR=<ID DA PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
