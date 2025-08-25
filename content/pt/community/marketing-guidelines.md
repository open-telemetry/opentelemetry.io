---
title: Diretrizes de Marketing do OpenTelemetry para Organizações Contribuintes
linkTitle: Diretrizes de Marketing
weight: 999
default_lang_commit: 6a865f53d8e40c17f42772fb8fb100d62a61fb7e
cSpell:ignore: devstats
---

O OpenTelemetry (também conhecido como OTel) é uma colaboração entre usuários
finais, projetos de código aberto (OSS) adjacentes e fornecedores que, no fim
das contas, vendem produtos e serviços construídos sobre dados ou componentes do
OTel. Como muitos projetos orientados a padrões, os fornecedores que colaboram
com o OTel também competem no mercado e, por isso, é importante estabelecer
algumas regras e expectativas sobre como as organizações contribuintes se
comunicam e promovem o OTel.

De fato, o sucesso do OTel depende tanto da realidade quanto da percepção de uma
colaboração sincera entre as várias partes (e fornecedores) envolvidas. Há
muitos trabalhos técnicos incríveis acontecendo dentro do OTel e queremos
garantir que não sejam escondidos por um departamento de marketing oportunista
aqui ou ali!

Este documento é dividido em duas seções:

- **Objetivos e Diretrizes:** O que estamos tentando alcançar? Qual é a nossa
  orientação?
- **Problemas e Consequências:** Como determinamos que uma diretriz foi violada?
  E o que fazemos sobre isso?

## Objetivos e Diretrizes {#goals-and-guidelines}

Existem três áreas principais de foco para esses objetivos e diretrizes.

### I: O OpenTelemetry é um esforço conjunto {#i-open-telemetry-is-a-joint-effort}

- o que fazer:
  - Utilizar materiais do projeto, como o logotipo e o nome, de acordo com as
    [diretrizes de uso de marcas registradas](https://www.linuxfoundation.org/legal/trademark-usage)
    da Linux Foundation.
  - Enfatizar que o OTel não seria possível sem a colaboração de diversos
    contribuidores que trabalham para fornecedores concorrentes.
  - Citar nomes de outros contribuidores e fornecedores envolvidos com os
    esforços do OTel.
  - Ressaltar nossos objetivos comuns enquanto comunidade: melhorar a
    experiência dos usuários finais/desenvolvedores e capacitá-los.
- O que não fazer:
  - Sugerir que um único fornecedor é responsável pelo OTel em si ou por uma de
    suas várias partes componentes.
  - Minimizar as contribuições de outra organização ou indivíduo.

### II: Não é uma competição {#ii-its-not-a-competition}

- O que fazer:
  - Destacar que todas as contribuições são valiosas e vêm em diversos formatos,
    incluindo:
  - Contribuições para o código central do projeto ou para SDKs específicos de
    linguagens ou _frameworks_
  - Criação e compartilhamento de recursos educacionais (vídeos, _workshops_,
    artigos) ou recursos compartilhados para fins educacionais (por exemplo, um
    aplicativo de exemplo usando linguagem/_framework_ específico).
  - Atividades de construção de comunidade, como organização de eventos ou
    grupos de encontro.
  - Reconhecer e agradecer publicamente outras organizações por suas
    contribuições ao OTel.
- O que não fazer:
  - Comparar diretamente o volume ou valor das contribuições de diferentes
    colaboradores ao OTel (por exemplo, utilizando o
    [devstats da CNCF](https://devstats.cncf.io/)).
  - Sugerir que contribuidores pouco frequentes ou com contribuições menores
    sejam considerados cidadãos de segunda classe, ou questionar sua
    compatibilidade com o OTel por esse motivo (na verdade, nenhum fornecedor
    precisa contribuir diretamente para o OTel para dar suporte a ele).

### III: Promover a conscientização sobre a interoperabilidade e modularização do OTel {#iii-promote-awareness-of-otel-interoperability-and-modularization}

- O que fazer:
  - "Gritar aos quatro ventos" sobre a compatibilidade com o OTel – quanto mais
    os usuários finais entenderem o que podem fazer com os dados do OTel,
    melhor.
  - Enfatizar a neutralidade do fornecedor e a portabilidade de qualquer
    integração do OTel.
- O que não fazer:
  - Sugerir que um usuário final não esteja realmente "utilizando o OTel" a
    menos que esteja usando algum conjunto específico de componentes (o OTel é
    um projeto "amplo" com muitos componentes desacoplados).
  - Publicamente depreciar o suporte ao OTel de outro fornecedor,
    particularmente sem evidências objetivas.

## Preocupações e Consequências {#concerns-and-consequences}

Inevitavelmente, haverá situações em que fornecedores (ou pelo menos seus
departamentos de marketing) violem essas diretrizes. Até hoje, isso não
aconteceu com frequência, portanto não queremos criar um processo complicado
demais para lidar com essas preocupações.

Veja como lidamos com essas circunstâncias:

1. Quem perceber o conteúdo público (marketing) relevante deve enviar um e-mail
   para <cncf-opentelemetry-governance@lists.cncf.io> e incluir uma explicação
   sobre por que o conteúdo é problemático, idealmente referenciando as
   [diretrizes acima](#goals-and-guidelines).
1. O Comitê de Governança do OTel (GC) discutirá o caso durante sua próxima
   reunião (semanal), ou de forma assíncrona via e-mail, se possível. O GC do
   OTel garante uma resposta via e-mail **em até duas semanas** a partir do
   relatório inicial.
1. Se o GC concordar que há um problema, uma ação corretiva será recomendada ao
   autor do conteúdo em questão. O GC solicitará que a organização responsável
   pelo conteúdo realize treinamentos com funcionários relevantes sobre o
   conteúdo deste documento como uma medida preventiva adicional.

Se um padrão se desenvolver com um fornecedor específico, o GC se reunirá para
discutir consequências mais significativas – por exemplo, removendo o nome desse
fornecedor das listas de fornecedores compatíveis mantidas pelo OTel, ou
simplesmente documentando publicamente o comportamento negativo recorrente.
