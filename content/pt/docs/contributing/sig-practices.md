---
title: Práticas do SIG para aprovadores e mantenedores
linkTitle: Práticas do SIG
description:
  Saiba como aprovadores e mantenedores gerenciam issues e contribuições.
weight: 999
default_lang_commit: 6acef01464b667456e7ba6d151235e56d39c12ca
cSpell:ignore: branch chalin Comms contribfest docsy mergeados
---

Esta página inclui diretrizes e algumas práticas comuns utilizadas por
aprovadores e mantenedores.

## Integração {#onboarding}

Quando uma pessoa colaboradora assume um papel com mais responsabilidade na
documentação (como aprovador ou mantenedor), será integrada pelos aprovadores e
mantenedores existentes:

- Será adicionada ao grupo `docs-approvers` (ou `docs-maintainers`).
- Será adicionada aos canais de Slack `#otel-comms`, `#otel-maintainers` e
  canais internos privados.
- Será solicitada a se inscrever nos convites de calendário para as reuniões do
  [SIG de Comunicações](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  e das reuniões de
  [Mantenedores](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- Será solicitada a verificar se o horário atual da reunião do SIG Comms
  funciona para ela. Caso contrário, deverá colaborar com os demais aprovadores
  e mantenedores para encontrar um horário viável para todos.
- Será solicitada a revisar os diferentes recursos disponíveis para
  contribuidores:
  - [Recursos da Comunidade](https://github.com/open-telemetry/community/),
    especialmente o documento sobre
    [Níveis de Participação na Comunidade](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    e o
    [Guia de Redes Sociais](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Diretrizes de Contribuição](/docs/contributing) — como parte desse
    processo, a pessoa revisará os documentos e poderá sugerir melhorias por
    meio de issues ou pull requests.

Outros recursos valiosos para revisão:

- [Documentação do Hugo](https://gohugo.io/documentation/)
- [Documentação do Docsy](https://www.docsy.dev/docs/)
- [Diretrizes de Marketing](/community/marketing-guidelines/), incluindo as
  diretrizes de uso de marca e
  [marca registrada da Linux Foundation](https://www.linuxfoundation.org/legal/trademark-usage).
  Esses recursos são especialmente importantes ao revisar entradas para o
  registro, integrações, fornecedores, adotantes ou distribuições.

## Colaboração {#collaboration}

- Aprovadores e mantenedores têm horários e circunstâncias de trabalho
  diferentes. Por isso, toda comunicação é considerada assíncrona. Eles não
  devem se sentir obrigados a responder fora de seu horário normal.
- Quando um aprovador ou mantenedor não puder contribuir por um período
  prolongado (mais do que alguns dias ou uma semana), deve comunicar isso pelo
  canal [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) e
  atualizar seu status no GitHub.
- Aprovadores e mantenedores seguem o
  [Código de Conduta da OTel](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  e os [Valores da Comunidade](/community/mission/#community-values). Eles devem
  ser amigáveis e prestativos com os contribuidores. Em caso de conflito,
  mal-entendido ou qualquer outro tipo de situação que deixe um
  aprovador/mantenedor desconfortável, eles podem se afastar da conversa, issue
  ou PR e pedir que outra pessoa assuma.

## Triagem {#triage}

### Issues {#issues}

- _Issues_ recebidas são triadas pela equipe `@open-telemetry/docs-triagers`.
- Como primeiro passo, um triador irá ler o título e a descrição da _issue_ e
  aplicará os seguintes rótulos (_labels_):
  - Obrigatório: Um rótulo `sig:*`, `lang:*` ou `docs:*` para determinar a
    (co)propriedade da _issue_:
    - Um rótulo `sig:*` caso a _issue_ esteja relacionada a um conteúdo ou uma
      pergunta que é co-propriedade de um SIG (_Special Interest Group_, ou
      Grupo de Interesse Especial). Por exemplo, uma pergunta sobre o Collector
      será rotulada com `sig:collector`.
    - Um rótulo `lang:*` caso a _issue_ esteja relacionada a um conteúdo ou uma
      pergunta que é co-propriedade de uma localização específica.
    - Um rótulo `docs:*` caso a _issue_ esteja relacionada a um conteúdo ou uma
      pergunta que é de propriedade exclusiva da equipe de documentação (SIG
      Comms):
      - `docs`
      - `docs:admin`
      - `docs:accessibility`
      - `docs:analytics-and-seo`
      - `docs:IA`
      - `docs:blog`
      - `docs:cleanup/refactoring`
      - `docs:upstream`, `docs:upstream/docsy`
      - `docs:javascript`
      - `docs:mobile`
      - `docs:registry`
      - `docs:ux`
  - Obrigatório: Um rótulo `triage:*`:
    - `triage:accepted`, `triage:accepted:needs-pr`
    - `triage:deciding`, `triage:deciding:blocked`, `triage:deciding:needs-info`
    - `triage:rejected`, `triage:rejected:duplicate`, `triage:rejected:invalid`,
      `triage:rejected:wontfix`
  - Obrigatório: Definir o "tipo" da _issue_ da seguinte forma:
    - tipo de _issue_ `bug` para _bugs_
    - tipo de _issue_ `enhancement` para solicitações de recursos
    - rótulo `type:question` para perguntas
    - rótulo `type:copyedit` para edições de texto
    - mover a _issue_ para "_discussions_", caso pareça ser uma conversa aberta
      não solucionável
  - Opcional: Um rótulo de estimativa, se aplicável:
    - `e0-minutes`
    - ...
    - `e4-months`
  - Opcional (e somente definido por mantenedores): Um rótulo de prioridade:
    - `p0-critical`
    - `p1-high`
    - `p2-medium`
    - `p3-low`
  - Opcional: Um dos seguintes rótulos especiais:
    - `good first issue`
    - `help wanted`
    - `contribfest`
    - `maintainers only`
    - `forever`
    - `stale`
- A automação marcará uma _issue_ em `triage:deciding` com `triage:followup`
  para re-triagem após 14 dias de inatividade em uma _issue_. O rótulo
  `triage:followup` deve ser removido dentro de 7 dias. Mencionar os
  participantes e remover o rótulo é atividade suficiente.

### PRs {#prs}

- PRs devem ter uma _issue_ vinculada rotulada como `triage:accepted`, com as
  seguintes exceções:
  - PRs automáticos
  - correções rápidas por mantenedores/aprovadores
- A automação garantirá que os PRs sejam
  [rotulados](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml)
  e
  [atribuídos](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml)
  para o SIG co-proprietário ou equipe de localização apropriada.
- PRs devem ter os mesmos rótulos de co-propriedade que as _issues_.
- Se o PR for co-propriedade de um SIG, esse grupo é responsável por fazer uma
  primeira revisão para garantir que o conteúdo esteja tecnicamente correto.
- Se o PR for co-propriedade de uma equipe de localização, esse grupo é
  responsável por garantir que a tradução do conteúdo esteja correta.
- A principal responsabilidade da equipe de documentação é garantir que o PR
  esteja alinhado com os objetivos gerais do projeto, esteja no lugar certo
  dentro da estrutura e siga os guias de estilo e conteúdo do projeto.
- PRs que estiverem faltando algo para serem _mergeados_ devem ser rotulados
  adequadamente:
  - `missing:cla`
  - `missing:docs-approval`
  - `missing:sig-approval`
  - `blocked`
- A automação marcará um PR como `stale` para solicitar uma nova revisão após 21
  dias de inatividade. O rótulo `stale` deve ser removido dentro de 14 dias.
  Mencionar os participantes e remover o rótulo é atividade suficiente.
- PRs nunca são fechados automaticamente.

## Revisão de Código {#code-reviews}

### Geral {#general}

- Se a _branch_ do PR estiver "desatualizada com a _branch_ base" (_out-of-date
  with the base branch_), não é necessário atualizá-la continuamente: toda
  atualização dispara novamente os testes de CI! Geralmente, é suficiente
  atualizar antes de fazer o _merge_.
- PRs de pessoas que não são mantenedoras **nunca** devem atualizar _submódulos_
  git. Isso pode acontecer por engano. Informe ao autor que não há problema, que
  nós iremos corrigir antes do _merge_, mas que no futuro deve usar um _fork_
  atualizado.
- Se o contribuidor estiver com problemas para assinar o CLA ou usou o e-mail
  errado em algum _commit_, solicite a correção ou o _rebase_ do PR. No pior dos
  casos, feche e reabra o PR para disparar nova verificação do CLA.
- Palavras desconhecidas para o cspell devem ser adicionadas pelo autor do PR à
  lista local de _ignore_ da página. Apenas aprovadores e mantenedores adicionam
  termos globais.

### PRs co-gerenciados {#co-owned-prs}

PRs que modificam documentação co-gerenciada por algum SIG (_collector_, _demo_,
linguagem específica etc.) devem buscar duas aprovações: uma de aprovador de
_docs_ e outra de aprovador do SIG:

- O aprovador de _docs_ deve marcar o PR com `sig:<nome>` e marcar o grupo
  `-approvers` do SIG.
- Após revisar e aprovar, o aprovador de _docs_ pode adicionar o _label_
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing),
  sinalizando ao SIG que ele deve revisar o PR.
- Se não houver aprovação do SIG dentro de um prazo razoável (geralmente duas
  semanas, podendo ser menor em casos urgentes), o mantenedor da documentação
  pode usar seu próprio julgamento para fazer o _merge_.

### PRs de bots {#prs-from-bots}

PRs criadas por _bots_ seguem estas práticas:

- PRs que atualizam automaticamente versões no registro podem ser corrigidos,
  aprovados e _mergeados_ imediatamente.
- PRs que atualizam automaticamente versões de SDKs, instrumentações _zero-code_
  ou o _collector_ podem ser aprovadas e _mergeados_, a menos que o SIG
  correspondente solicite adiamento.
- PRs que atualizam automaticamente versões de especificações frequentemente
  exigem atualizações em scripts para que os testes de CI passem. Nesse caso,
  [@chalin](https://github.com/chalin/) cuidará do PR. Caso contrário, também
  podem ser aprovados e _mergeados_, exceto quanto o SIG correspondente sinaliza
  que o merge deve ser adiado.

### PRs de tradução {#translation-prs}

PRs com mudanças em traduções devem ter duas aprovações: uma de aprovador de
_docs_ e outra de aprovador de tradução. As mesmas práticas sugeridas para PRs
co-gerenciados se aplicam aqui.

### Fazendo merge dos PRs {#merging-prs}

Mantenedores podem seguir este fluxo para dar _merge_ nos PRs:

- Verifique se o PR tem todas as aprovações e todos os testes de CI passaram.
- Se a _branch_ estiver desatualizada, atualize via UI do GitHub.
- A atualização disparará os testes de CI para serem executados novamente.
  Aguarde que todos os testes passem ou use o seguinte comando para rodar os
  testes e dar merge em segundo plano:

  ```shell
  export PR=<ID DO PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```
