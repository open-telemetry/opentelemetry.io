---
title: Issues
description:
  Como corrigir um problema existente ou relatar um bug, risco de segurança ou
  possível melhoria.
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

## Corrigindo uma _issue_ existente {#fixing-an-existing-issue}

Uma das melhores formas de contribuir para a melhoria da documentação do OTel é
corrigir um problema já existente.

1. Navegue pela lista de [_issues_]({{% param _issues %}}).
2. Selecione uma issue com a qual você gostaria de contribuir.

   > [!WARNING] Importante!
   >
   > {{% param chooseAnIssueAtYourLevel %}} _Issues_ com o rótulo
   > [`CI/infra` são exclusivas para mantenedores](#ci-infra).

3. Leia os comentários existentes na _issue_, se houver.
4. Pergunte aos mantenedores se a _issue_ ainda é relevante e esclareça
   eventuais dúvidas comentando na própria _issue_.
5. Declare sua intenção de trabalhar na _issue_ adicionando um comentário.
6. Trabalhe na correção do problema. Caso enfrente dificuldades, avise os
   mantenedores.
7. Quando estiver pronto,
   [submeta seu trabalho via _pull request_](../pull-requests) (PR).

## _Issues_ de CI e infraestrutura {#ci-infra}

_Issues_ com o rótulo [CI/infra][] são **exclusivas para mantenedores**: elas
tratam dos próprios _workflows_, verificações obrigatórias, ferramentas e
configurações do repositório. Diferentemente do trabalho com conteúdo e
localização:

- Mudanças nesta área não podem ser testadas de forma significativa por quem não
  é mantenedor; por exemplo, modos de falha surgem na CI do repositório
  principal e no comportamento durante o _merge_.
- O trabalho frequentemente depende de planejamentos e contexto dos mantenedores
  que não estão visíveis no texto da _issue_.
- Parte do contexto é deliberadamente privada: trabalhos que afetam a postura de
  segurança do site (correções de reforço e remediação) não são discutidos
  publicamente antes de serem mesclados.

Observe que o rótulo `triage:accepted` em uma _issue_ desse tipo significa que o
problema foi confirmado, e não que o trabalho está disponível para qualquer
pessoa.

## Reportando um problema {#reporting-an-issue}

Se você encontrar um erro ou quiser sugerir melhorias em conteúdos existentes,
abra uma nova _issue_.

1. Clique no link **Create documentation issue** disponível em qualquer
   documento. Isso redirecionará você para uma página no GitHub com um modelo de
   _issue_ pré-preenchido.
2. Descreva o problema ou sugestão de melhoria. Forneça o máximo de detalhes
   possível.
3. Clique em **Create** (Criar).

Após enviar a _issue_, acompanhe as atualizações ou ative as notificações do
GitHub. Pode levar alguns dias até que mantenedores e aprovadores respondam.
Revisores e membros da comunidade podem fazer perguntas antes de agir sobre sua
_issue_.

## Sugerindo novos conteúdos ou funcionalidades {#suggesting-new-content-or-features}

Se você tem uma ideia para um novo conteúdo ou funcionalidade, mas não sabe
exatamente onde ela se encaixa, ainda assim pode abrir uma _issue_. Também é
possível relatar bugs ou vulnerabilidades de segurança.

1. Acesse o GitHub e selecione **[New issue][]** na aba **Issues**.
2. Escolha o tipo de _issue_ mais apropriado para sua sugestão ou dúvida.
3. Preencha o modelo.
4. Envie a _issue_.

### Como enviar boas _issues_ {#how-to-file-great-issues}

Ao criar uma _issue_, considere as seguintes boas práticas:

- Forneça uma descrição clara do problema. Explique exatamente o que está
  incorreto, desatualizado, ausente ou pode ser melhorado.
- Descreva o impacto específico do problema para os usuários.
- Limite o escopo da _issue_ para uma quantia razoável. Problemas com escopo
  muito amplo devem ser divididos em _issues_ menores. Por exemplo, "Corrigir a
  documentação de segurança" é vago demais; "Adicionar detalhes ao tópico
  'Restringindo o acesso à rede'" é específico o suficiente para ser acionável.
- Pesquise entre as _issues_ existentes para ver se não há outra relacionada ou
  semelhante a sua nova _issue_.
- Se a nova _issue_ estiver relacionada a outra _issue_ ou _pull request_, faça
  referência usando a URL completa ou o número precedido por `#`, por exemplo:
  `Introduzido por #987654`.
- Siga o [Código de Conduta][Code of Conduct]. Respeite os demais colaboradores.
  Comentários como "A documentação está péssima" não são úteis nem apropriados.

<!-- prettier-ignore-start -->
[CI/infra]: https://github.com/open-telemetry/opentelemetry.io/labels/CI%2Finfra
[Code of Conduct]: https://github.com/open-telemetry/community/blob/main/code-of-conduct.md
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new/
<!-- prettier-ignore-end -->
<!-- markdownlint-disable link-image-reference-definitions -->

[choose an issue]: <{{% param _issues %}}>
