---
title: Contribuindo
aliases: [/docs/contribution-guidelines]
sidebar_root_for: self
weight: 980
cascade:
  chooseAnIssueAtYourLevel: |
    [Escolha uma issue][] que corresponda ao seu nível de **experiência** e
    **entendimento** de OpenTelemetry. Evite exceder suas capacidades.
  _issues: https://github.com/open-telemetry/opentelemetry.io/issues
  _issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=state%3Aopen%20label%3A
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

## Obrigado pelo seu interesse! {#thank-you-for-your-interest}

Obrigado pelo seu interesse em contribuir com o OpenTelemetry. Contribuidores
ajudam a sustentar o OpenTelemetry, e cada contribuição ajuda a tornar o projeto
melhor para toda a comunidade.

Aqui estão algumas dicas para começar:

- **Contribuições podem surgir por necessidade:** Embora contribuidores
  regulares sejam muito bem-vindos, não há problema em contribuir por
  necessidade, como ao encontrar um _bug_ no Collector ou ao desenvolver uma
  funcionalidade de que sua equipe precisa.

- **Encontrou uma lacuna? Isso também conta:** O OpenTelemetry é um projeto
  grande e, mesmo com os melhores esforços de contribuidores e mantenedores,
  lacunas na documentação e nas funcionalidades são inevitáveis. Ao notar uma,
  abrir uma _issue_ ou enviar uma correção é uma contribuição significativa.

- **O tempo de resposta pode variar:** Contribuidores e mantenedores
  frequentemente trabalham no OpenTelemetry em seu tempo livre e costumam lidar
  com várias coisas ao mesmo tempo. Não desanime caso não receba uma resposta
  imediatamente.

- **Não é preciso ser especialista em OTel:** Suas habilidades e seu contexto
  profissional já são úteis por si só. SREs, profissionais de DevRel e pessoas
  que não têm o inglês como língua nativa trazem perspectivas diversas que
  beneficiam ativamente o projeto.

### <i class='far fa-exclamation-triangle text-warning '></i> Primeira vez contribuindo? {#first-time-contributing}

- **[Escolha uma issue][]** com os seguintes labels:
  - [Good first issue](<{{% param _issue %}}%22good%20first%20issue%22>)
  - [Help wanted](<{{% param _issue %}}%22help%20wanted%22>)

  > [!WARNING] Nós não atribuímos (dar _assign_) a issues
  >
  > Nós **_não_ atribuímos (dar _assign_) issues** para quem ainda não
  > contribuiu para a [organização OpenTelemetry][org], a menos que faça parte
  > de um processo confirmado de mentoria ou _onboarding_.
  >
  > [org]: https://github.com/open-telemetry

- {{% param chooseAnIssueAtYourLevel %}}

- Leia nossa [política de contribuição com IA](pull-requests#using-ai)

- Participe do canal do Slack
  [#opentelemetry-new-contributors](https://cloud-native.slack.com/archives/C09H3MNMBQV)
  para conhecer as boas práticas de desenvolvimento e se conectar com outros
  novos contribuidores.

- Deseja trabalhar em outras _issues_ ou mudanças maiores? [Converse com os
  mantenedores primeiro][discuss it with maintainers first].

[discuss it with maintainers first]: issues/#fixing-an-existing-issue

## Vamos lá! {#jump-right-in}

O que você deseja fazer?

- Para corrigir um **erro de digitação ou outras correções rápidas**, veja
  [Submetendo alterações usando o GitHub](pull-requests/#changes-using-github)
- Para adicionar ou atualizar um anúncio na página inicial, veja
  [Anúncios na página inicial](/site/build/announcements/)
- Para contribuições mais significativas, leia as páginas desta seção começando
  com:
  - [Pré-requisitos][]
  - [Issues][]
  - [Submetendo Alterações][]

[Pré-requisitos]: prerequisites/
[Submetendo Alterações]: pull-requests/

## No que posso contribuir? {#what-can-i-contribute-to}

O OpenTelemetry é um projeto grande, com muitas formas de participar. A
documentação é uma porta de entrada, mas está longe de ser a única.

### Documentação {#documentation}

Contribuidores da documentação OpenTelemetry podem:

- Melhorar o conteúdo existente ou criar novo conteúdo
- [Submeter uma postagem no blog](blog/) ou estudo de caso
- Adicionar ou atualizar o [OpenTelemetry Registry](/ecosystem/registry/)
- Melhorar o código que constrói o site

As páginas desta seção descrevem como contribuir com a **documentação** do
OpenTelemetry.

### Contribuições de código {#code-contributions}

Para orientações de como contribuir com código para o projeto OpenTelemetry,
consulte o [Guia para novos contribuidores do OpenTelemetry][] da comunidade.
Cada [repositório OTel][org] para implementações de linguagem, o Collector e
convenções possui seu próprio guia de contribuição específico.

O [OTel Demo](https://github.com/open-telemetry/opentelemetry-demo) é um bom
ponto de partida para quem quer dar os primeiros passos em contribuições de
código. Ele reúne mais de 15 serviços em várias linguagens, oferecendo uma noção
concreta de como a instrumentação funciona na prática em sistemas distribuídos
reais.

### Participação em SIGs {#sig-participation}

Participar de um Grupo de Interesse Especial (_Special Interest Group_, SIG) é
uma das formas mais eficazes de contribuir com o OTel. Os SIGs focam em áreas
específicas do projeto, como SDKs de linguagens específicas, o Collector,
usuários finais, experiência de contribuidores e muito mais.

Participar de um SIG ajuda a:

- Obter uma visão das prioridades atuais dentro de uma parte menor e focada do
  projeto OpenTelemetry
- Se conectar com mantenedores, aprovadores e outros contribuidores
- Trazer seus próprios tópicos e ajudar a decidir a direção do projeto

O
[repositório da comunidade OTel](https://github.com/open-telemetry/community#specification-sigs)
lista todos os SIGs ativos, com links para os convites de calendário e canais do
Slack.

### Comunidade {#community}

Contribuir com o OTel não significa se limitar a escrever código ou
documentação. Também é possível:

- Se voluntariar para fazer anotações nas reuniões dos SIGs
- Ajudar a organizar eventos da comunidade, como o OpenTelemetry Contributor Day
  na KubeCon
- Contribuir com os [esforços de localização](localization/) para tornar o OTel
  acessível a desenvolvedores em diferentes idiomas
- Participar do
  [End-User SIG](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
  compartilhando sua experiência prática, ou contribuir com podcasts da
  comunidade como
  [OTel Me](https://www.youtube.com/playlist?list=PLVYDBkQ1TdywIl9xKEo5_u7zlwY38dW43)
  e
  [OTel in Practice](https://www.youtube.com/playlist?list=PLVYDBkQ1TdyxKgdGE4ThYLkNRCuLLYy9x)

[escolha uma issue]: issues/#fixing-an-existing-issue
[issues]: issues/
[Guia para novos contribuidores do OpenTelemetry]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor
