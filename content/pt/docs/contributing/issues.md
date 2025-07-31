---
title: Issues
description:
  Como corrigir um problema existente ou relatar um bug, risco de segurança ou possível melhoria.
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
cSpell:ignore: prepopulated
---

## Corrigindo uma _issue_ existente {#fixing-an-existing-issue}

Uma das melhores formas de contribuir para a melhoria da documentação do OTel é corrigir um problema já existente.

1. Navegue pela lista de [issues]({{% param _issues %}}).
2. Selecione uma issue com a qual você gostaria de contribuir, de preferência uma que possa ser resolvida em pouco tempo. <a name="first-issue"></a>
   {{% alert title="É sua primeira contribuição?" color="primary alert--first-timer" %}}

   Procure por issues com os seguintes rótulos:
   - [Good first issue](<{{% param _issue %}}%22good+first+issue%22>)
   - [Help wanted](<{{% param _issue %}}%3A%22help+wanted%22>)

   > **NOTA**: nós **_não atribuímos issues_** a quem ainda não contribuiu com a organização [OpenTelemetry][org], exceto em casos de mentoria ou processos formais de onboarding.
   >
   > [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. Leia os comentários existentes na issue, se houver.
4. Pergunte aos mantenedores se a issue ainda é relevante e esclareça eventuais dúvidas comentando na própria issue.
5. Declare sua intenção de trabalhar na issue adicionando um comentário.
6. Trabalhe na correção do problema. Caso enfrente dificuldades, avise os mantenedores.
7. Quando estiver pronto, [submeta seu trabalho via pull request](../pull-requests) (PR).

## Reportando um problema {#reporting-an-issue}

Se você encontrar um erro ou quiser sugerir melhorias em conteúdos existentes, abra uma nova issue.

1. Clique no link **Create documentation issue** disponível em qualquer documento. Isso redirecionará você para uma página no GitHub com um modelo de issue pré-preenchido.
2. Descreva o problema ou sugestão de melhoria. Forneça o máximo de detalhes possível.
3. Clique em **Create**.

Após enviar a issue, acompanhe as atualizações ou ative as notificações do GitHub. Pode levar alguns dias até que mantenedores e aprovadores respondam. Revisores e membros da comunidade podem fazer perguntas antes de agir sobre sua issue.

## Sugerindo novos conteúdos ou funcionalidades

Se você tem uma ideia para um novo conteúdo ou funcionalidade, mas não sabe exatamente onde ela se encaixa, ainda assim pode abrir uma issue. Também é possível relatar bugs ou vulnerabilidades de segurança.

1. Acesse a aba de [Issues no GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/).

2. Clique em **New issue**.

3. Escolha o tipo de issue mais apropriado para sua sugestão ou dúvida.

4. Preencha o template.

5. Envie a issue.

### Como escrever boas issues

Ao criar uma issue, considere as seguintes boas práticas:

- Forneça uma descrição clara do problema. Explique exatamente o que está incorreto, desatualizado, ausente ou pode ser melhorado.
- Descreva o impacto específico do problema para os usuários.
- Mantenha o escopo da issue razoável. Problemas muito amplos devem ser divididos em partes menores. Por exemplo, "Corrigir a documentação de segurança" é vago demais; "Adicionar detalhes ao tópico 'Restringindo o acesso à rede'" é específico e executável.
- Pesquise entre as issues existentes para evitar duplicações.
- Se a nova issue estiver relacionada a outra issue ou pull request, faça referência usando a URL completa ou o número precedido por `#`, por exemplo: `Introduzido por #987654`.
- Siga o [Código de Conduta](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md). Respeite os demais colaboradores. Comentários como "A documentação está péssima" não são úteis nem apropriados.

