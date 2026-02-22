---
title: Contribuindo
aliases: [/docs/contribution-guidelines]
sidebar_root_for: self
weight: 980
cascade:
  chooseAnIssueAtYourLevel: |
    [Escolha uma issue] que corresponda ao seu nível de **experiência** e
    **entendimento** de OpenTelemetry. Evite exceder suas capacidades.
  _issues: https://github.com/open-telemetry/opentelemetry.io/issues
  _issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
default_lang_commit: 505e2d1d650a80f8a8d72206f2e285430bc6b36a # patched
---

{{% alert title="Obrigado pelo seu interesse!" color=success %}}

Obrigado pelo seu interesse em contribuir com o website e documentação do
OpenTelemetry.

{{% /alert %}}

## <i class='far fa-exclamation-triangle text-warning '></i> Primeira vez contribuindo? {#first-time-contributing}

- **[Escolha uma issue][]** com os seguintes labels:
  - [Good first issue](<{{% param _issue %}}%22good+first+issue%22>)
  - [Help wanted](<{{% param _issue %}}%3A%22help+wanted%22>)

  {{% alert title="Nós não atribuímos (dar _assign_) a issues" color="warning" %}}

  Nós **_não_ atribuímos (dar _assign_) issues** para quem ainda não contribuiu
  para a [organização OpenTelemetry organization][org], a menos que faça parte
  de um processo confirmado de mentoria ou _onboarding_.

  [org]: https://github.com/open-telemetry

  {{% /alert %}}

- {{% param chooseAnIssueAtYourLevel %}}

- Leia nossa [política de contribuição com IA](pull-requests#using-ai)

- Deseja trabalhar em outras _issues_ ou mudanças maiores? [Converse com os
  mantenedores primeiro][discuss it with maintainers first].

[discuss it with maintainers first]: issues/#fixing-an-existing-issue

## Vamos lá! {#jump-right-in}

O que você deseja fazer?

- Para corrigir um **erro de digitação ou outras correções rápidas**, veja
  [Submetendo alterações usando o GitHub](pull-requests/#changes-using-github)
- Para contribuições mais significativas, leia as páginas desta seção começando
  com:
  - [Pré-requisitos][]
  - [Issues][]
  - [Submetendo Alterações][]

[Pré-requisitos]: prerequisites/
[Submetendo Alterações]: pull-requests/

## No que posso contribuir? {#what-can-i-contribute-to}

Contribuidores da documentação OpenTelemetry:

- Melhorar o conteúdo existente ou criar novo conteúdo
- [Submeter uma postagem no blog](blog/) ou estudo de caso
- Adicionar ou atualizar o [OpenTelemetry Registry](/ecosystem/registry/)
- Melhorar o código e scripts usados para construir o website

As páginas desta seção descrevem apenas como contribuir com a documentação do
OpenTelemetry.

Para orientações de como contribuir para o projeto OpenTelemetry em geral,
consulte o [Guia para novos contribuidores do OpenTelemetry][] da comunidade.
Cada [repositório OTel][org] para implementações de linguagem, o Collector e
convenções possui seu próprio guia de contribuição específico.

[escolha uma issue]: issues/#fixing-an-existing-issue
[issues]: issues/
[Guia para novos contribuidores do OpenTelemetry]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor
