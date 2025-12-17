---
title: Issues
description:
  Como corrigir um problema existente ou relatar um bug, risco de segurança ou
  possível melhoria.
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
default_lang_commit: 0930994d5be6f01b05d0caca0550c468d2f3e829
---

<style>
  /* Force all list to be compact. */
  li > p {
    margin-bottom: 0;
  }

  /* Style "first time" alert */
  .alert--first-timer {
    margin: 0.5rem 0 !important;

    > blockquote {
      margin-top: 1rem;
      margin-bottom: 0;
      border-left-color: var(--bs-warning);
      background-color: var(--bs-danger-bg-subtle);
      > *:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>

## Corrigindo uma _issue_ existente {#fixing-an-existing-issue}

Uma das melhores formas de contribuir para a melhoria da documentação do OTel é
corrigir um problema já existente.

1. Navegue pela lista de [_issues_]({{% param _issues %}}).
2. Selecione uma issue com a qual você gostaria de contribuir, de preferência
   uma que possa ser resolvida em pouco tempo. <a name="first-issue"></a>
   {{% alert title="É sua primeira contribuição?" color="primary alert--first-timer" %}}

   Procure por _issues_ com os seguintes _labels_ (rótulos):
   - [Good first issue](<{{% param _issue %}}%22good+first-issue%22>)
   - [Help wanted](<{{% param _issue %}}%3A%22help+wanted%22>)

   > **NOTA**: nós **_não atribuímos issues_** a quem ainda não contribuiu com a
   > organização [OpenTelemetry][org], exceto quando fizer parte de um processo
   > de tutoria ou de _onboarding_.
   >
   > [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. Leia os comentários existentes na _issue_, se houver.
4. Pergunte aos mantenedores se a _issue_ ainda é relevante e esclareça
   eventuais dúvidas comentando na própria _issue_.
5. Declare sua intenção de trabalhar na _issue_ adicionando um comentário.
6. Trabalhe na correção do problema. Caso enfrente dificuldades, avise os
   mantenedores.
7. Quando estiver pronto,
   [submeta seu trabalho via _pull request_](../pull-requests) (PR).

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

1. Acesse a aba de
   [_Issues_ no GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/).

2. Clique em **New issue**.

3. Escolha o tipo de _issue_ mais apropriado para sua sugestão ou dúvida.

4. Preencha o modelo.

5. Envie a _issue_.

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
- Siga o
  [Código de Conduta](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
  Respeite os demais colaboradores. Comentários como "A documentação está
  péssima" não são úteis nem apropriados.
